const path = require( 'path' );
const markdownIt = require( 'markdown-it' );
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const os = require( 'os' );

// Change stuff here first.
const site = require( '../src/_data/site.json' );

module.exports = function ( eleventyConfig, options = {} ) {

	// Main config (you can overide these in 11ty-starter).
	const config = {
		dir: {
			input: 'src',
			includes: '_includes',
			output: 'docs'
		},
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',

		// Overrides: site.json.
		...site,

		// Overrides: config args.
		...( options.config?.options ?? {} )
	};

	// Add a markdown filter.
	eleventyConfig.addFilter( 'markdown', content => new markdownIt( { html: true } ).render( String( content ) ) );

	// Watch 11ty-tools for changes.
	eleventyConfig.addWatchTarget( __dirname );

	// Base template formats.
	eleventyConfig.setTemplateFormats( [
		'html',
		'njk',
		'md',
		'xml',
		'liquid',

		// Overrides: templateFormats
		...( options.templateFormats?.options ?? [] )
	] );

	if ( options.metagen ?? true ) {

		// See base layout for what this does.
		eleventyConfig.addPlugin( require( 'eleventy-plugin-metagen' ), options.metagen?.addPlugin?.options ?? {} );
	}

	if ( options.img ) {

		// https://www.11ty.dev/docs/plugins/image/, auto-transforms <img> for us.
		const { eleventyImageTransformPlugin } = require( '@11ty/eleventy-img' );

		eleventyConfig.addPlugin( eleventyImageTransformPlugin, {
			outputDir: path.join( config.dir.output, 'assets/img' ),
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
				return `${id}/${ path.parse( src ).name }-${width}.${format}`;
			},

			// Overrides: images.
			...( options.img?.addPlugin?.options ?? {} )
		} );
	}

	if ( options.imgPassthrough ?? true ) {

		// Passthrough any /src/assets/img/passthrough > /docs/assets/img/*.webp.
		eleventyConfig.on( 'eleventy.after', async () => {

			const Image = require( '@11ty/eleventy-img' );

			const inputDir = path.resolve( config.dir.input, 'assets/img/passthrough' );
			const outputDir = path.resolve( config.dir.output, 'assets/img' );

			if ( fs.existsSync( inputDir ) ) {
				await fs.promises.mkdir( inputDir, { recursive: true } );
			}

			const files = await fs.promises.readdir( inputDir, { recursive: true } );

			for ( const file of files ) {

				const inputPath = path.join( inputDir, file );

				await Image(
					inputPath,
					{
						formats: [ 'webp' ],
						outputDir: path.join( outputDir, path.dirname( file ) ),
						urlPath: '/assets/img/',
						filenameFormat: () => `${ path.parse( file ).name }.webp`,
						...( options.imgPassthrough?.Image?.options ?? {} )
					}
				)
					// Constole messages...
					.then( ( result ) => console.log( `Created ${ inputPath } -> ${ result.webp[0].outputPath }` ) )
					.catch( ( err ) => console.error( err ) );
			}
		} );
	}

	// CSS
	if ( options.css ?? true ) {

		// CSS just gets copied over, @sardine/eleventy-plugin-tinycss takes care of inline and minifying.
		eleventyConfig.addTemplateFormats( 'css' );
		eleventyConfig.addExtension( 'css', {
			outputFileExtension: 'css',
			compile: async function ( inputContent, inputPath ) {
				return async () => inputContent;
			},

			// Overrides
			...( options.css?.addExtension?.options ?? {} )
		} );
	}

	// JS
	if ( options.js ?? true ) {

		// JS goes through esbuild so we don't have to worry about what we write.
		eleventyConfig.addTemplateFormats( 'js' );
		eleventyConfig.addExtension( 'js', {
			outputFileExtension: 'js',
			compile: async function ( inputContent, inputPath ) {

				// esbuild does the stuff...
				const esbuild = require( 'esbuild' );

				// Process each JS file through esbuild...
				const result = await esbuild.build( {
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

					// Overrides: esbuild
					...( options.js?.addExtension?.esbuild?.options ?? {} )
				} );

				// Write the file esbuild gave us.
				return async () => result.outputFiles[0].text ?? '';
			},

			// Overrides: js
			...( options.js?.addExtension?.options ?? {} )
		} );
	}

	// Add support for simple bundling.
	if ( options.bundle ?? true ) {

		const { EleventyRenderPlugin } = require( '@11ty/eleventy' );
		eleventyConfig.addPlugin( EleventyRenderPlugin, options.bundle?.addPlugin?.options ?? {} );

		eleventyConfig.addBundle( 'js', options.bundle?.js?.options ?? {} );
		eleventyConfig.addBundle( 'css', {

			// Take any <style> and bundle it into a single <style>.
			bundleHtmlContentFromSelector: 'style',

			// Overrides
			...( options.bundle?.css?.addBundle?.options ?? {} )
		} );
	}

	// https://www.npmjs.com/package/@sardine/eleventy-plugin-tinycss, makes all styles, purges (only link href=""), and inlines it all per-page.
	if ( options.tinyCss ?? true ) {

		eleventyConfig.addPlugin( require( '@sardine/eleventy-plugin-tinycss' ), {
			output: `${ config.dir.output }/`,
			browserslist: 'last 2 version, not dead',
			purgeCSS: {
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

				// Overrides: purgeCSS
				...( options.tinyCss?.purgeCSS ?? {} )
			},

			// Overrides: tinyCss
			...( options.tinyCss?.addPlugin?.options ?? {} )
		} );
	}

	// https://www.npmjs.com/package/@sardine/eleventy-plugin-tinyhtml, minify and optimize HTML.
	if ( options.tinyHtml ?? true ) {

		eleventyConfig.addPlugin( require( '@sardine/eleventy-plugin-tinyhtml' ), {
			removeAttributeQuotes: false,
			removeOptionalTags: false,
			removeComments: false,
			sortAttributes: false,
			sortClassName: false,

			// Overrides.
			...( options.tinyHtml?.addPlugin?.options ?? {} )
		} );
	}

	// Google fonts: auto-inline and pre-connect.
	if ( options.googleFonts ?? true ) {
		eleventyConfig.addPlugin( require( 'eleventy-google-fonts' ), options.googleFonts?.addPlugin?.options ?? {} );
	}

	// Sanitize.css
	if ( options.sanitizeCss ?? true ) {

		eleventyConfig.addPassthroughCopy( {
			'node_modules/sanitize.css/*.css': 'assets/css/sanitize.css',

			// Overrides.
			...( options.sanitizeCss?.addPassthroughCopy?.options ?? {} )
		} );
	}

	// SASS
	if ( options.sass ?? true ) {

		// Add SASS support.
		eleventyConfig.addPlugin(
			require( 'eleventy-sass' ),
			{
				sass: {
					silenceDeprecations: [
						'import',
						'global-builtin',
						'color-functions',
						'if-function'
					]
				},
				...( options.sass?.addPlugin?.options ?? {} )
			}
		);
	}

	// sitemap.xml
	if ( options.sitemap ?? true ) {

		// Generate a sitemap.
		eleventyConfig.addPlugin( require( '@quasibit/eleventy-plugin-sitemap' ), {
			sitemap: {
				hostname: config.baseUrl,
			},
			...( options.sitemap?.addPlugin?.options ?? {} )
		} );
	}

	// robots.txt
	if ( options.robots ?? true ) {

		// robots.txt, https://www.npmjs.com/package/eleventy-plugin-robotstxt
		eleventyConfig.addPlugin( require( 'eleventy-plugin-robotstxt'), {
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

			// Overrides.
			...( options.robots?.addPlugin?.options ?? {} )
		} );

		// Auto noopener
		if ( options.noopener ) {

			// https://www.npmjs.com/package/eleventy-plugin-automatic-noopener, automatically add noopener, etc.
			eleventyConfig.addPlugin( require( 'eleventy-plugin-automatic-noopener' ), options.noopener?.addPlugin?.options ?? {} );
		}
	}

	// Auto-load shortcodes...
	(

		// Get everything in ./shortcodes/*.js...
		fs.readdirSync( path.join( __dirname, 'shortcodes/' ), { recursive: true } )
			.filter( file =>
					file.endsWith( '.js' )
						&& ! file.startsWith( 'utils/' )
						&& ! file.startsWith( 'templates/' )
				)
			.map( file => path.join( __dirname, 'shortcodes/', file ) )
	).forEach( ( shortcode ) => {

		console.log( shortcode );

		// Initially load of the shortcode...
		require( shortcode )( eleventyConfig );

		// When things change, reload the shortcode into 11ty if it's changed...
		eleventyConfig.on( 'eleventy.before', () => {

			// Get a signature for the shortcode file...
			shorcodeSignature = crypto
				.createHash( 'md5' )
				.update( fs.readFileSync( require.resolve( shortcode ) ) )
				.digest( 'hex' );

			const sigFile = path.join( require( 'os' ).tmpdir(), '11ty-tools', 'shortcodeCache', `${ crypto.createHash( 'md5' ).update( path.basename( shortcode ) ).digest( 'hex' ) }.cache` );

			// If the shortcode file signature didn't change...
			if (
				shorcodeSignature === ( fs.existsSync( sigFile )
					? fs.readFileSync( sigFile, 'utf8' )
					: '' )
			) {
				return; // Don't trigger a rebuild.
			}

			// Re-reload the shortcode into memory.
			require( shortcode )( eleventyConfig );

			// Trigger a rebuild by touching the config file.
			fs.utimesSync( path.resolve( '.eleventy.js' ), new Date(), new Date() );

			// Update the shortcode signature for next time.
			fs.mkdirSync( path.dirname( sigFile ), { recursive: true });
			fs.writeFileSync( sigFile, shorcodeSignature );
		} );
	} );

	// Base config that is used in 11ty-starter.
	return config;
};
