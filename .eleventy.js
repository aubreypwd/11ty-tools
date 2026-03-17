const required = require( '@root/required.js' );
const markdownIt = require( 'markdown-it' ); // Cannot be in required.js since it's a Class.

// Change stuff here first.
const site = require( '../../../src/_data/site.js' );

module.exports = function ( eleventyConfig ) {

	// Main config (you can overide these in 11ty-starter).
	const config = required.deepmerge(
		{
			dir: {
				input: 'src',
				includes: '_includes',
				output: 'docs'
			},
			htmlTemplateEngine: 'njk',
			markdownTemplateEngine: 'njk',
		},
		site
	);

	// Add a markdown filter.
	eleventyConfig.addFilter( 'markdown', content => new markdownIt( { html: true } ).render( String( content ) ) );

	// Add a fileExsts nunchuck filter.
	eleventyConfig.addFilter( 'fileExists', _path => required.fs.existsSync( required.path.resolve( required.path.join( process.cwd(), config.dir.input, _path ) ) ) );

	// Add a way to strip the outer tags of a string, useful for {{ 'content' | markdown | sot | safe }}.
	eleventyConfig.addFilter( 'sot', function( str ) {

		const { parse } = require( 'node-html-parser' );

		if ( ! str ) {
			return str;
		}

		const root = parse( str );
		const first = root.firstChild ?? false;

		return first
			? first.innerHTML
			: str;
	} );

	// Dump json so you can look at it.
	eleventyConfig.addFilter( 'pj', ( value, spaces = 2 ) => JSON.stringify( value, null, spaces ) );

	// Watch 11ty-starter-common for changes.
	eleventyConfig.addWatchTarget( __dirname );

	// Base template formats.
	eleventyConfig.setTemplateFormats( required.deepmerge(
		[
			'html',
			'njk',
			'md',
			'xml',
			'liquid'
		],
		config['setTemplateFormats'] ?? []
	) );

	if ( config.head?.css?.boostrap?.grid?.enabled ?? true ) {

		// Get the bootstrap grid for free.
		eleventyConfig.addPassthroughCopy( {
			'node_modules/bootstrap/dist/css/bootstrap-grid.min.css': 'assets/css/boostrap/bootstrap-grid.min.css' ,
			'node_modules/bootstrap/dist/css/bootstrap-grid.min.css.map': 'assets/css/boostrap/bootstrap-grid.min.css.map'
		} );
	}

	if ( config.metagen?.enabled ?? true ) {

		// See base layout for what this does.
		eleventyConfig.addPlugin( require( 'eleventy-plugin-metagen' ), config.metagen?.config?.['addPlugin']?.['eleventy-plugin-metagen'] ?? {} );
	}

	if ( config.img?.enabled ?? true ) {

		// https://www.11ty.dev/docs/plugins/image/, auto-transforms <img> for us.
		const { eleventyImageTransformPlugin } = require( '@11ty/eleventy-img' );

		eleventyConfig.addPlugin( eleventyImageTransformPlugin, required.deepmerge(
			{
				outputDir: required.path.join( config.dir.output, 'assets/img' ),
				urlPath: '/assets/img',
				formats: [ 'avif', 'webp', 'jpeg' ],
				transformOnRequest: ( process.env.ELEVENTY_ENV === 'production' ) ? false : true,
				useCache: false,
				widths: [
					// 320,
					540,
					720,
					960,
					1140,
					// 1320,
					// 1920,
					'auto'
				],
				htmlOptions: {
					imgAttributes: {
						loading: 'lazy',
						decoding: 'async',
					}
				},

				// Place files here.
				filenameFormat: ( id, src, width, format, options ) => {
					return `${id}/${ required.path.parse( src ).name }-${width}.${format}`;
				},
			},
			config.img?.config?.['addPlugin']?.['eleventyImageTransformPlugin'] ?? {}
		) );
	}

	if ( config.eleventyImg?.enabled ?? true ) {

		// Passthrough any /src/assets/img/passthrough > /docs/assets/img/*.webp.
		eleventyConfig.on( 'eleventy.after', async () => {

			const Image = require( '@11ty/eleventy-img' );

			const inputDir = required.path.resolve( config.dir.input, 'assets/img/passthrough' );
			const outputDir = required.path.resolve( config.dir.output, 'assets/img' );

			if ( required.fs.existsSync( inputDir ) ) {
				await required.fs.promises.mkdir( inputDir, { recursive: true } );
			}

			const files = await required.fs.promises.readdir( inputDir, { recursive: true } );

			for ( const file of files ) {

				const inputPath = required.path.join( inputDir, file );

				await Image(
					inputPath,
					required.deepmerge(
						{
							formats: [ 'webp' ],
							outputDir: required.path.join( outputDir, required.path.dirname( file ) ),
							urlPath: '/assets/img/',
							filenameFormat: () => `${ required.path.parse( file ).name }.webp`,
						},
						config.eleventyImg?.config?.['Image']?.['@11ty/eleventy-img'] ?? {}
					)
				)
					// Constole messages...
					.then( ( result ) => console.log( `Created ${ inputPath } -> ${ result.webp[0].outputPath }` ) )
					.catch( ( err ) => console.error( err ) );
			}
		} );
	}

	// CSS
	if ( config.css?.enabled ?? true ) {

		// CSS just gets copied over, @sardine/eleventy-plugin-tinycss takes care of inline and minifying.
		eleventyConfig.addTemplateFormats( 'css' );
		eleventyConfig.addExtension( 'css', required.deepmerge(
			{
				outputFileExtension: 'css',
				compile: async function ( inputContent, inputPath ) {
					return async () => inputContent;
				},
			},
			config.css?.config?.['addExtension']?.['css'] ?? {}
		) );
	}

	// JS
	if ( config.js?.enabled ?? true ) {

		// JS goes through esbuild so we don't have to worry about what we write.
		eleventyConfig.addTemplateFormats( 'js' );
		eleventyConfig.addExtension( 'js', required.deepmerge(
			{
				outputFileExtension: 'js',
				compile: async function ( inputContent, inputPath ) {

					// esbuild does the stuff...
					const esbuild = require( 'esbuild' );

					// Process each JS file through esbuild...
					const result = await esbuild.build( required.deepmerge(
						{
							entryPoints: [ inputPath ],
							bundle: true,
							write: false,
							platform: 'browser',
							treeShaking: true,
							format: 'iife', // Not a module.
							target: [ 'es2015' ], // Works in anything.
							legalComments: 'none', // No license stuff (want to keep it small).

							// Allow debugging at least.
							minify: ( process.env.ELEVENTY_ENV === 'production' ) ? true : false,
							sourcemap: ( process.env.ELEVENTY_ENV === 'production' ) ? false : true,
						},
						config.js?.config?.['build']?.['esbuild'] ?? {}
					) );

					// Write the file esbuild gave us.
					return async () => result.outputFiles[0].text ?? '';
				},
			},
			config.js?.config?.['addExtension']?.['js'] ?? {}
		) );
	}

	// Add support for simple bundling.
	if ( config.bundle?.enabled ?? true ) {

		const { EleventyRenderPlugin } = require( '@11ty/eleventy' );
		eleventyConfig.addPlugin( EleventyRenderPlugin, config.bundle?.config?.['addPlugin']?.['EleventyRenderPlugin'] ?? {} );

		eleventyConfig.addBundle( 'js', config.bundle?.config?.['addBundle']?.['js'] ?? {} );
		eleventyConfig.addBundle( 'css', required.deepmerge(
			{

				// Take any <style> and bundle it into a single <style>.
				bundleHtmlContentFromSelector: 'style',
			},
			config.bundle?.config?.['addBundle']?.['css'] ?? {}
		) );
	}

	// https://www.npmjs.com/package/@sardine/eleventy-plugin-tinycss, makes all styles, purges (only link href=""), and inlines it all per-page.
	if ( config.tinyCss?.enabled ?? true ) {

		eleventyConfig.addPlugin( require( '@sardine/eleventy-plugin-tinycss' ), required.deepmerge(
			{
				output: `${ config.dir.output }/`,
				browserslist: 'last 2 version, not dead',
				purgeCSS: required.deepmerge(
					{
						fontFace: true,
						variables: true,
						keyframes: true,

						// @TODO File a bug to try and fix/solve this in the main repo.
						extractors: [
							{
								extensions: [ 'html' ],
								extractor: ( content ) => {

									return content
										// Remove <style> tags before assessing what to purge.
										.replace( /<style[\s\S]*?<\/style>/gi, '' )
										.match( /[A-Za-z0-9-_:\/]+/g ) || [];
								},
							},
						],
					},
					config.tinyCss?.config?.['purgeCSS']?.['@sardine/eleventy-plugin-tinycss'] ?? {}
				),
			},
			config.tinyCss?.config?.['addPlugin']?.['@sardine/eleventy-plugin-tinycss'] ?? {}
		) );
	}

	// https://www.npmjs.com/package/@sardine/eleventy-plugin-tinyhtml, minify and optimize HTML.
	if ( config.tinyHtml?.enabled ?? true ) {

		eleventyConfig.addPlugin( require( '@sardine/eleventy-plugin-tinyhtml' ), required.deepmerge(
			{
				removeAttributeQuotes: false,
				removeOptionalTags: false,
				removeComments: false,
				sortAttributes: false,
				sortClassName: false,
			},
			config.tinyHtml?.config?.['addPlugin']?.['@sardine/eleventy-plugin-tinyhtml'] ?? {}
		) );
	}

	// Google fonts: auto-inline and pre-connect.
	if ( config.head?.google?.fonts?.enabled ?? true ) {
		eleventyConfig.addPlugin( require( 'eleventy-google-fonts' ), config.head?.google?.fonts?.config?.['addPlugin']?.['eleventy-google-fonts'] ?? {} );
	}

	// Sanitize.css
	if ( config.head?.css?.sanitize?.enabled ?? true ) {
		eleventyConfig.addPassthroughCopy( required.deepmerge(
			{
				'node_modules/sanitize.css/*.css': 'assets/css/sanitize.css'
			},
			config.head?.css?.sanitize?.config?.['addPassthroughCopy']?.['sanitize.css'] ?? {}
		) );
	}

	// SASS
	if ( config.sass?.enabled ?? true ) {

		// Add SASS support.
		eleventyConfig.addPlugin(
			require( 'eleventy-sass' ),
			required.deepmerge(
				{
					sass: {
						silenceDeprecations: [
							'import',
							'global-builtin',
							'color-functions',
							'if-function'
						]
					},
				},
				config.sass?.config?.['addPlugin']?.['eleventy-sass'] ?? {}
			)
		);
	}

	// sitemap.xml
	if ( config.sitemap?.enabled ?? true ) {

		// Generate a sitemap.
		eleventyConfig.addPlugin( require( '@quasibit/eleventy-plugin-sitemap' ), required.deepmerge(
			{
				sitemap: {
					hostname: config.baseUrl,
				},
			},
			config.sitemap?.config?.['addPlugin']?.['@quasibit/eleventy-plugin-sitemap'] ?? {}
		) );
	}

	// robots.txt
	if ( config.robots?.enabled ?? true ) {

		// robots.txt, https://www.npmjs.com/package/eleventy-plugin-robotstxt
		eleventyConfig.addPlugin( require( 'eleventy-plugin-robotstxt'), required.deepmerge(
			{
				sitemapURL: `${ config.baseUrl }/sitemap.xml`,
				shouldBlockAIRobots: false,
				rules: new Map( [

					// AI Bots.
					[ 'GPTBot', [ { allow: '/' } ] ],
					[ 'ChatGPT-User', [ { allow: '/' } ] ],
					[ 'ClaudeBot', [ { allow: '/' } ] ],
					[ 'anthropic-ai', [ { allow: '/' } ] ],
					[ 'PerplexityBot', [ { allow: '/' } ] ],
					[ 'Google-Extended', [ { allow: '/' } ] ],
					[ 'Applebot-Extended', [ { allow: '/' } ] ],
					[ 'Amazonbot', [ { allow: '/' } ] ],
					[ 'Bytespider', [ { allow: '/' } ] ],

					// All others.
					[ '*', [ { allow: '/' } ] ],
				] ),
			},
			config.robots?.config?.['addPlugin']?.['eleventy-plugin-robotstxt'] ?? {}
		) );

		// Auto noopener
		if ( config.noopener?.enabled ) {

			// https://www.npmjs.com/package/eleventy-plugin-automatic-noopener, automatically add noopener, etc.
			eleventyConfig.addPlugin( require( 'eleventy-plugin-automatic-noopener' ), config.noopener?.config?.['addPlugin']?.['eleventy-plugin-automatic-noopener'] ?? {} );
		}
	}

	// Auto-load shortcodes...
	(

		// Get everything in ./shortcodes/*.js...
		required.fs.readdirSync( required.path.join( __dirname, 'shortcodes/' ), { recursive: true } )
			.filter( file =>
					file.endsWith( '.js' )
						&& ! file.startsWith( 'utils/' )
						&& ! file.startsWith( 'templates/' )
				)
			.map( file => required.path.join( __dirname, 'shortcodes/', file ) )
	).forEach( ( shortcode ) => {

		console.log( `[11ty-starter-common] Loaded ${ shortcode }.` );

		// Initially load of the shortcode...
		require( shortcode )( eleventyConfig );

		// When things change, reload the shortcode into 11ty if it's changed...
		eleventyConfig.on( 'eleventy.before', () => {

			// Get a signature for the shortcode file...
			shorcodeSignature = required.crypto
				.createHash( 'md5' )
				.update( required.fs.readFileSync( require.resolve( shortcode ) ) )
				.digest( 'hex' );

			const sigFile = required.path.join( required.os.tmpdir(), '11ty-starter-common', 'shortcodeCache', `${ required.crypto.createHash( 'md5' ).update( required.path.basename( shortcode ) ).digest( 'hex' ) }.cache` );

			// If the shortcode file signature didn't change...
			if (
				shorcodeSignature === ( required.fs.existsSync( sigFile )
					? required.fs.readFileSync( sigFile, 'utf8' )
					: '' )
			) {
				return; // Don't trigger a rebuild.
			}

			// Re-reload the shortcode into memory.
			require( shortcode )( eleventyConfig );

			// Trigger a rebuild by touching the config file.
			required.fs.utimesSync( required.path.resolve( '.eleventy.js' ), new Date(), new Date() );

			// Update the shortcode signature for next time.
			required.fs.mkdirSync( required.path.dirname( sigFile ), { recursive: true });
			required.fs.writeFileSync( sigFile, shorcodeSignature );
		} );
	} );

	// Base config that is used in 11ty-starter.
	return config;
};
