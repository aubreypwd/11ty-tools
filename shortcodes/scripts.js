const path = require( 'path' );
const fs = require( 'fs' );
const { minify } = require( 'terser' );
const babel = require( '@babel/core' );

module.exports = ( eleventyConfig ) => eleventyConfig.addAsyncShortcode( 'scripts', async function( scripts = [], options = {} ) {

	if ( [] === scripts ) {
		return; // No scripts, let's not waste out time.
	}

	/**
	 * Get a scripts code.
	 *
	 * This will accept a .src that is a URL and fetch the response.
	 *
	 * @param {Object} script The script object.
	 *
	 * @return {string} The code.
	 */
	async function getScriptCode( script ) {

		if ( /^https?:\/\//.test( script.src ?? '' ) ) {
			const response = await fetch( script.src );
				return response.text();
		}

		return fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' );
	}

	/**
	 * Transpile code with Babel.
	 *
	 * @param {string} code The code.
	 * @return {string}
	 */
	async function babelify( code ) {

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


	const tags = []; // These get pushed out later.

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

	let filteredScripts = [], minified = null, out = '';

	// Scripts that are inline and bundled: Combine all the scripts into a single inline tag (this gets the actual code from the scripts).
	filteredScripts = await Promise.all( scripts.filter( script => script.inline && script.bundle ).map( script => getScriptCode( script ) ) );

	if ( filteredScripts.length ) {

		minified = await minify( script.babel ? await babelify( filteredScripts ) : filteredScripts, minifyOptions );
			tags.push( { inline: minified.code ?? '/* NO CODE */' } );
	}

	// Scripts that are inline but not bundled: Get their own <script> inline tag (this too also gets the script code from the scripts).
	filteredScripts = await Promise.all( scripts.filter( script => script.inline && ! script.bundle ).map( script => getScriptCode( script ) ) );

	if ( filteredScripts.length ) {
		for ( const script of filteredScripts ) {

			minified = await minify( script.babel ? await babelify( script ) : script, minifyOptions );
				tags.push( { inline: minified.code ?? '/* NO CODE */' } );
		}
	}

	// Scripts that are not inline and not bundled: Get their own <script src> tag.
	filteredScripts = scripts.filter( script => ! script.inline && ! script.bundle );

	if ( filteredScripts.length ) {
		for ( const script of filteredScripts ) {

			const code = await getScriptCode( script );

			minified = await minify( script.babel ? await babelify( code ) : code );

			const newSrc = /^https?:\/\//.test( script.src )

				// Point to the new file in the filesystem (assumes assets/js).
				? path.join( script.file ?? 'assets/js', path.basename( new URL( script.src ).pathname ) )

				// Keep the original src.
				: script.src;


			const outfile = path.resolve( eleventyConfig.dir.output, newSrc );

			fs.mkdirSync( path.dirname( outfile ), { recursive: true } );
			fs.writeFileSync( outfile, minified.code ?? '/* NO CODE */' );

			tags.push( {
				src: path.join( eleventyConfig.pathPrefix, newSrc ),
				defer: script.defer ?? false,
				async: script.async ?? false
			} );
		}
	}

	// Scripts that are not inlined and bundled (this also reads in the code from all the scripts).
	filteredScripts = await Promise.all( scripts.filter( script => ! script.inline && script.bundle ).map( script => getScriptCode( script ) ) );

	if ( filteredScripts.length && options.bundle.file ) {

		// A single .js file with all the bundled scripts in it.
		minified = await minify( await babelify( filteredScripts ), minifyOptions );

		const outfile = path.join( eleventyConfig.dir.output, options.output ?? 'assets/js', options.bundle.file );

		fs.mkdirSync( path.dirname( outfile ), { recursive: true } );
		fs.writeFileSync( outfile, minified.code ?? '/* NO CODE */' );

		tags.push( {
			src: path.join( eleventyConfig.pathPrefix, options.base ?? '/', options.output ?? 'assets/js', options.bundle.file ),
			defer: options.bundle.defer ?? false // If you do not pass bundle.defer we'll assume you don't want to defer it.
		} );

	} else if ( filteredScripts.length ) {
		eleventyConfig.logger.warn( '[11ty-tools, script.js] Bundled external JS exists, but no options.bundle.file set.' );
	}

	tags.forEach( tag => {
		if ( tag.inline ) out += /* html */ `<script>${tag.inline}</script>`;
		if ( tag.src ) out += /* html */ `<script src="${tag.src}"${tag.defer ? ' defer' : ''}${tag.async ? ' async' : ''}></script>`;
	} );

	return out;
} );
