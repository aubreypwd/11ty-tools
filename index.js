const path = require( 'path' );
const markdownIt = require( 'markdown-it' );

const fs = require( 'fs' );
const crypto = require( 'crypto' );

const os = require("os");


module.exports = function ( eleventyConfig, options = {} ) {

	// Add a markdown filter.
	eleventyConfig.addFilter( 'markdown', content => new markdownIt( { html: true } ).render( String( content ) ) );

	// When things change...
	eleventyConfig.addWatchTarget( __dirname );

	( // Get everything in ./shortcodes/*.js...
		fs.readdirSync( path.join( __dirname, 'shortcodes/' ) )
			.filter( file => file.endsWith( '.js' ) )
			.map( file => path.join( __dirname, 'shortcodes/', file ) )
	).forEach( ( shortcode ) => {

		// Initially load of the shortcode...
		require( shortcode )( eleventyConfig );

		// When things change, reload the shortcode into 11ty if it's changed...
		eleventyConfig.on( 'eleventy.before', () => {

			// Get a signature for the shortcode file...
			shorcodeSignature = crypto
				.createHash( 'md5' )
				.update( fs.readFileSync( require.resolve( shortcode ) ) )
				.digest( 'hex' );

			const sigFile = path.join( require( 'os' ).tmpdir(), '11ty-tools', `${ path.basename( shortcode ) }.sig` );

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
			fs.utimesSync( options.configFile, new Date(), new Date() );

			// Update the shortcode signature for next time.
			fs.mkdirSync( path.dirname( sigFile ), { recursive: true });
			fs.writeFileSync( sigFile, shorcodeSignature );
		} );
	} );



};
