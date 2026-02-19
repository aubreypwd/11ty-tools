const path = require( 'path' );
const fs = require( 'fs' );
const { minify } = require( 'terser' );

module.exports = ( eleventyConfig ) =>

eleventyConfig.addAsyncShortcode( 'scripts', async function( scripts = [], options = {} ) {

	// Yes, we will assume assets/js.
	eleventyConfig.addWatchTarget( options.output ?? 'assets/js' );

	const tags = [];

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

	const bundledInlineCode = scripts.filter( script => ( script.inline ?? true ) && script.bundle ).map( script => fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' ) );

	if ( bundledInlineCode.length ) {

		// A single <script>...</script> with all bundled scripts inlined.
		const result = await minify( bundledInlineCode, minifyOptions );

		tags.push( {
			inline: result.code ?? '/* NO CODE */',
		} );
	}

	const bundledExternalCode = scripts.filter( script => ( script.inline === false ) && script.bundle ).map( script => fs.readFileSync( path.resolve( eleventyConfig.dir.input, script.src ), 'utf8' ) );

	if ( bundledExternalCode.length && options.bundleFile ) {

		// A single .js file with all the bundled scripts in it.
		const externalResult = await minify( bundledExternalCode, minifyOptions );

		const outfile = path.join(
			eleventyConfig.dir.output,
			options.output ?? 'assets/js',
			options.bundleFile
		);

		fs.mkdirSync( path.dirname( outfile ), { recursive: true } );
		fs.writeFileSync( outfile, externalResult.code ?? '/* NO CODE */' );

		tags.push( {
			src: path.join( options.base ?? '/', options.output ?? 'assets/js', options.bundleFile ),

			// If you do not pass deferBundle we'll assume you don't want to defer it.
			defer: options.deferBundle ?? false
		} );
	} else if ( bundledExternalCode.length ) {
		eleventyConfig.logger.warn( '[11ty-tools, script.js] Bundled external JS exists, but no options.bundleFile set.' );
	}

	let out = '';

	tags.forEach( tag => {
		if ( tag.inline ) out += /* html */ `<script>${tag.inline}</script>`;
		if ( tag.src ) out += /* html */ `<script src="${tag.src}"${tag.defer ? ' defer' : ''}${tag.async ? ' async' : ''}></script>`;
	} );

	return out;

} );
