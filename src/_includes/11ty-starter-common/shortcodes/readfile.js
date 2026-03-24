const required = require( '@root/required.js' );

module.exports = ( eleventyConfig ) => eleventyConfig.addShortcode( 'readfile', ( base = eleventyConfig.dir.input, file ) => {

	if ( 'undefined' === typeof file ) {
		file = base;
		base = eleventyConfig.dir.input;
	}

	return required.fs.readFileSync( required.path.resolve( base, file ), 'utf8' );
} );
