const required = require( '@root/required.js' );
const markdownIt = require( 'markdown-it' );

// Change stuff here first.
const site = require( '../../../src/_data/site.js' );

module.exports = function ( eleventyConfig, flags = {}, overrides = {} ) {

	console.log( overrides );

	// Main config (you can overide these in 11ty-starter).
	const config = required.deepmerge(
		required.deepmerge(
			{
				dir: {
					input: 'src',
					includes: '_includes',
					output: 'docs'
				},
				htmlTemplateEngine: 'njk',
				markdownTemplateEngine: 'njk',
			},
			overrides.config ?? {}
		),
		site
	);

	// Add a markdown filter.
	eleventyConfig.addFilter( 'markdown', content => new markdownIt( { html: true } ).render( String( content ) ) );

	// Add a fileExsts nunchuck filter.
  eleventyConfig.addFilter( 'fileExists', _path => required.fs.existsSync( required.path.resolve( required.path.join( process.cwd(), config.dir.input, _path ) ) ) );

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
		overrides['setTemplateFormats'] ?? []
	) );

	if ( flags.metagen ?? true ) {

		// See base layout for what this does.
		eleventyConfig.addPlugin( require( 'eleventy-plugin-metagen' ), overrides['addPlugin']?.['eleventy-plugin-metagen'] ?? {} );
	}

	if ( flags.img ) {

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
			overrides['addPlugin']?.['eleventyImageTransformPlugin'] ?? {}
		) );
	}

	if ( flags.eleventyImg ?? true ) {

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
						overrides['Image']?.['@11ty/eleventy-img'] ?? {}
					)
				)
					// Constole messages...
					.then( ( result ) => console.log( `Created ${ inputPath } -> ${ result.webp[0].outputPath }` ) )
					.catch( ( err ) => console.error( err ) );
			}
		} );
	}

	// CSS
	if ( flags.css ?? true ) {

		// CSS just gets copied over, @sardine/eleventy-plugin-tinycss takes care of inline and minifying.
		eleventyConfig.addTemplateFormats( 'css' );
		eleventyConfig.addExtension( 'css', required.deepmerge(
			{
				outputFileExtension: 'css',
				compile: async function ( inputContent, inputPath ) {
					return async () => inputContent;
				},
			},
			overrides['addExtension']?.['css'] ?? {}
		) );
	}

	// JS
	if ( flags.js ?? true ) {

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
							legalComments: 'none',

							// Allow debugging at least.
							minify: ( process.env.ELEVENTY_ENV === 'production' ) ? true : false,
							sourcemap: ( process.env.ELEVENTY_ENV === 'production' ) ? false : true,
						},
						overrides['build']?.['esbuild'] ?? {}
					) );

					// Write the file esbuild gave us.
					return async () => result.outputFiles[0].text ?? '';
				},
			},
			overrides['addExtension']?.['js'] ?? {}
		) );
	}

	// Add support for simple bundling.
	if ( flags.bundle ?? true ) {

		const { EleventyRenderPlugin } = require( '@11ty/eleventy' );
		eleventyConfig.addPlugin( EleventyRenderPlugin, overrides['addPlugin']?.['EleventyRenderPlugin'] ?? {} );

		eleventyConfig.addBundle( 'js', overrides['addBundle']?.['js'] ?? {} );
		eleventyConfig.addBundle( 'css', required.deepmerge(
			{

				// Take any <style> and bundle it into a single <style>.
				bundleHtmlContentFromSelector: 'style',
			},
			overrides['addBundle']?.['css'] ?? {}
		) );
	}

	// https://www.npmjs.com/package/@sardine/eleventy-plugin-tinycss, makes all styles, purges (only link href=""), and inlines it all per-page.
	if ( flags.tinyCss ?? true ) {

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
					overrides['purgeCSS']?.['@sardine/eleventy-plugin-tinycss'] ?? {}
				),
			},
			overrides['addPlugin']?.['@sardine/eleventy-plugin-tinycss'] ?? {}
		) );
	}

	// https://www.npmjs.com/package/@sardine/eleventy-plugin-tinyhtml, minify and optimize HTML.
	if ( flags.tinyHtml ?? true ) {

		eleventyConfig.addPlugin( require( '@sardine/eleventy-plugin-tinyhtml' ), required.deepmerge(
			{
				removeAttributeQuotes: false,
				removeOptionalTags: false,
				removeComments: false,
				sortAttributes: false,
				sortClassName: false,
			},
			overrides['addPlugin']?.['@sardine/eleventy-plugin-tinyhtml'] ?? {}
		) );
	}

	// Google fonts: auto-inline and pre-connect.
	if ( flags.googleFonts ?? true ) {
		eleventyConfig.addPlugin( require( 'eleventy-google-fonts' ), overrides['addPlugin']?.['eleventy-google-fonts'] ?? {} );
	}

	// Sanitize.css
	if ( flags.sanitizeCss ?? true ) {
		eleventyConfig.addPassthroughCopy( required.deepmerge(
			{
				'node_modules/sanitize.css/*.css': 'assets/css/sanitize.css'
			},
			overrides['addPassthroughCopy']?.['sanitize.css'] ?? {}
		) );
	}

	// SASS
	if ( flags.sass ?? true ) {

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
				overrides['addPlugin']?.['eleventy-sass'] ?? {}
			)
		);
	}

	// sitemap.xml
	if ( flags.sitemap ?? true ) {

		// Generate a sitemap.
		eleventyConfig.addPlugin( require( '@quasibit/eleventy-plugin-sitemap' ), required.deepmerge(
			{
				sitemap: {
					hostname: config.baseUrl,
				},
			},
			overrides['addPlugin']?.['@quasibit/eleventy-plugin-sitemap'] ?? {}
		) );
	}

	// robots.txt
	if ( flags.robots ?? true ) {

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
			overrides['addPlugin']?.['eleventy-plugin-robotstxt'] ?? {}
		) );

		// Auto noopener
		if ( flags.noopener ) {

			// https://www.npmjs.com/package/eleventy-plugin-automatic-noopener, automatically add noopener, etc.
			eleventyConfig.addPlugin( require( 'eleventy-plugin-automatic-noopener' ), overrides['addPlugin']?.['eleventy-plugin-automatic-noopener'] ?? {} );
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
