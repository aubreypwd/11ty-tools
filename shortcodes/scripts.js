const path = require( 'path' );
const fs = require( 'fs' );
const { minify } = require( 'terser' );

module.exports = ( eleventyConfig ) =>

eleventyConfig.addAsyncShortcode( 'scripts', async function( scripts = [], options = {} ) {

	if ( [] === scripts ) {
		return;
	}

	// Yes, we will assume assets/js.
	eleventyConfig.addWatchTarget( options.output ?? 'assets/js' );

	const tags = []; // These get pushed out later.

	// Minify options defaults.
	const minifyOptions = Object.assign(
		{
			compress: true,
			mangle: true,
			ecma: 2018,
			format: {
				comments: false
			}
		},
		minify.options ?? {}
	);

	let filteredScripts = [], minified = null;

	// Scripts that are inline and bundled: Combine all the scripts into a single inline tag (this gets the actual code from the scripts).
	filteredScripts = scripts.filter( script => script.inline && script.bundle ).map( script => fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' ) );

	if ( filteredScripts.length ) {

		// A single <script>...</script> with all bundled scripts inlined.
		minified = await minify( filteredScripts, minifyOptions );

		tags.push( { inline: minified.code ?? '/* NO CODE */' } );
	}

	// Scripts that are inline but not bundled: Get their own <script> inline tag (this too also gets the script code from the scripts).
	filteredScripts = scripts.filter( script => script.inline && ! script.bundle ).map( script => fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' ) );

	if ( filteredScripts.length ) {

		for ( const script of filteredScripts ) {

			minified = await minify( script, minifyOptions );

			tags.push( { inline: minified.code ?? '/* NO CODE */' } );
		}
	}

	// Scripts that are not inline and not bundled: Get their own <script src> tag.
	filteredScripts = scripts.filter( script => ! script.inline && ! script.bundle );

	if ( filteredScripts.length ) {

		for ( const script of filteredScripts ) {

			minified = await minify( fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf-8' ) );

			const outfile = path.resolve(
				eleventyConfig.dir.output,
				script.src
			);

			fs.mkdirSync( path.dirname( outfile ), { recursive: true } );
			fs.writeFileSync( outfile, minified.code ?? '/* NO CODE */' );

			tags.push( {
				src: script.src,
				defer: script.defer ?? false,
				async: script.async ?? false
			} );
		}
	}

	// Scripts that are not inlined and bundled (this also reads in the code from all the scripts).
	filteredScripts = scripts.filter( script => ! script.inline && script.bundle ).map( script => fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' ) );

	if ( filteredScripts.length && options.bundle.file ) {

		// A single .js file with all the bundled scripts in it.
		minified = await minify( filteredScripts, minifyOptions );

		const outfile = path.join(
			eleventyConfig.dir.output,
			options.output ?? 'assets/js',
			options.bundle.file
		);

		fs.mkdirSync( path.dirname( outfile ), { recursive: true } );
		fs.writeFileSync( outfile, minified.code ?? '/* NO CODE */' );

		tags.push( {
			src: path.join( options.base ?? '/', options.output ?? 'assets/js', options.bundle.file ),

			// If you do not pass bundle.defer we'll assume you don't want to defer it.
			defer: options.bundle.defer ?? false
		} );
	} else if ( filteredScripts.length ) {
		eleventyConfig.logger.warn( '[11ty-tools, script.js] Bundled external JS exists, but no options.bundle.file set.' );
	}

	// Output.
	let out = '';

	console.log( tags );

	tags.forEach( tag => {
		if ( tag.inline ) out += /* html */ `<script>${tag.inline}</script>`;
		if ( tag.src ) out += /* html */ `<script src="${tag.src}"${tag.defer ? ' defer' : ''}${tag.async ? ' async' : ''}></script>`;
	} );

	return out;

} );
