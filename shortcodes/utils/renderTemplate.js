const path = require( 'path' );
const fs = require( 'fs' );

module.exports = function renderTemplate( file, vars ) {

	// Read in the template file...
	const str = fs.readFileSync( path.join( __dirname, '..', `templates/${file}` ), 'utf8' );

	// Convert the template to a string literal using magick and pass in the vars.
	return new Function( "vars", `with(vars){ return \`${str}\` }` )( vars );
};
