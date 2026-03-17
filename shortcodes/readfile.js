const required = require( '@root/required.js' );

module.exports = ( eleventyConfig ) => eleventyConfig.addShortcode( 'readfile', ( base = eleventyConfig.dir.output, file ) => {

	if ( 'undefined' === typeof file ) {
		file = base;
		base = eleventyConfig.dir.output;
	}

	return required.fs.readFileSync( required.path.resolve( base, file ), 'utf8' );
} );
