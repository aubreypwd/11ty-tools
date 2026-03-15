const path = require( 'path' );
const fs = require( 'fs' );
const crypto = require('crypto');

module.exports = ( eleventyConfig ) => eleventyConfig.addAsyncShortcode( 'scripts', async function( scripts = [], options = {} ) {

	if ( [] === scripts ) {
		return; // No scripts, let's not waste out time.
	}

	/**
	 * Minify code (Terser).
	 *
	 * @param {string} code The code to minify.
	 *
	 * @return {string} The minified code.
	 */
	async function minifyCode( code ) {

		// Minify options defaults.
		const minifyOptions = Object.assign(
			{
				compress: true,
				mangle: true,
				ecma: 2017,
				format: {
					comments: false
				}
			},
			options.minify ?? {}
		);

		const { minify } = require( 'terser' );

		const minified = await minify( code, minifyOptions );

		return minified.code ?? code;
	}

	/**
	 * Transpile code with Babel.
	 *
	 * @param {string} code The code.
	 * @return {string}
	 */
	async function babelifyCode( code ) {

		const babel = require( '@babel/core' );

		const result = await babel.transformAsync( code, Object.assign(
			{
				presets: [
					[
						'@babel/preset-env',
						{
							targets: '> 0.25%, not dead'
						}
					]
				],
				minified: false,
				comments: false
			},
			options.babel ?? {}
		) );

		return result.code;
	}

	/**
	 * Get a scripts code.
	 *
	 * This will take script.src (see rest of code) and get it's code, minify it
	 * and transpile it through bable (both configurable).
	 *
	 * @param {Object} script The script object.
	 *
	 * @return {string} The code.
	 */
	async function getScriptCode( script ) {

		if ( 'object' !== typeof script ) {
			throw new Error( '[11ty-starter-common] script must be an object, and is not.' );
		}

		// URL script sent.
		if ( /^https?:\/\//.test( script.src ?? '' ) ) {

			// A signature for the file.
			const fileSignature = crypto.createHash( 'md5' ).update( script.src ).digest( 'hex' );

			// Where we will store a cache for it.
			const cachedFile = path.join( require( 'os' ).tmpdir(), '11ty-starter-common', 'v2', getScriptCode.name, `${ fileSignature }.cache` );

			if ( fs.existsSync( cachedFile ) ) {

				// We already have this cached, use that.
				return fs.readFileSync( cachedFile, 'utf8' );
			}

			// Fetch the code...
			const response = await fetch( script.src );

			return response.text().then( async function( code ) {

				if ( script.babel ?? true ) {
					code = await babelifyCode( code );
				}

				if ( script.minify ?? true ) {
					code = await minifyCode( code );
				}

				// Write code to cache.
				fs.mkdirSync( path.dirname( cachedFile ), { recursive: true } );
				fs.writeFileSync( cachedFile, code );

				return code;
			} );
		}

		// Use local file instead.
		let code = fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' );

		// Optimize code (maybe).
		if ( script.babel ?? true ) code = await babelifyCode( code );
		if ( script.minify ?? true ) code = await minifyCode( code );

		return code;
	}

	/**
	 * Bundle a collection of scripts into a single bundle of code.
	 *
	 * @param {string} scripts The scripts.
	 *
	 * @return {string} The code of all the scripts bundled.
	 */
	async function bundleScripts( scripts ) {

		let out = '';

		for ( const script of scripts ) {

			const code = await getScriptCode( script );

			out += code;
		}

		return out;
	}

	const tags = [];

	// [ Scripts thare are bundled into a single inline <script> tag. ]

	const bundledInlineCode = await bundleScripts( scripts.filter(
		script => script.inline && script.bundle
	) );

	if ( bundledInlineCode ) {
		tags.push( {
			inline: bundledInlineCode
		} );
	}

	// [ Bundled external code into a single file. ]
	const bundledExternalCode = await bundleScripts( scripts.filter( script => ! script.inline && script.bundle ) );
	if ( bundledExternalCode ) {

		const outfile = path.join( eleventyConfig.dir.output, options.output ?? 'assets/js', options.bundle.file );

		fs.mkdirSync( path.dirname( outfile ), { recursive: true } )
			&& fs.writeFileSync( outfile, bundledExternalCode );

		tags.push( {
			src: path.join( eleventyConfig.pathPrefix, options.base ?? '/', options.output ?? 'assets/js', options.bundle.file ),
			defer: options.bundle.defer ?? false,
			async: options.bundle.async ?? false
		} );
	}

	// [ Single <script> tags for scripts that are inline but not bundled. ]
	for ( const script of scripts.filter( script => script.inline && ! script.bundle ) ) {

		const code = await getScriptCode( script );

		if ( code ) {
			tags.push( { inline: code } );
		}
	}

	// [ Single script src tag for each script that is not bundled and not inlined. ]
	for ( const script of scripts.filter( script => ! script.inline && ! script.bundle ) ) {

		// Get the code for the script...
		const code = await getScriptCode( script );

		if ( code ) {

			// Re-construct a new src based on if it's a URL or not to the filesystem...
			script.src = /^https?:\/\//.test( script.src )

				// Point to the new file in the filesystem (assumes assets/js).
				? path.join( script.file ?? 'assets/js', path.basename( new URL( script.src ).pathname ) )

				// Keep the original (local) src.
				: script.src;

			// Where we will write the src="" file to...
			const outfile = path.resolve( eleventyConfig.dir.output, script.src );

			// Write it there...
			fs.mkdirSync( path.dirname( outfile ), { recursive: true } )
				&& fs.writeFileSync( outfile, code );

			// Add a tag for it.
			tags.push( {
				src: path.join( eleventyConfig.pathPrefix, script.src ),

				// Options for the script.
				defer: script.defer ?? false,
				async: script.async ?? false
			} );
		}
	}

 	// [ Output ]
	let out = '';
	tags.forEach( tag => {

		// Inline script tags.
		if ( tag.inline ) out += /* html */ `<script>${tag.inline}</script>`;

		// External scripts tagss.
		if ( tag.src ) out += /* html */ `<script src="${tag.src}"${tag.defer ? ' defer' : ''}${tag.async ? ' async' : ''}></script>`;
	} );

	return out;
} );
