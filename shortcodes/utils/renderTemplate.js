const required = require( '@root/required.js' );

module.exports = function renderTemplate( file, vars ) {

	// Read in the template file...
	const str = required.fs.readFileSync( required.path.join( __dirname, '..', `templates/${file}` ), 'utf8' );

	// Convert the template to a string literal using magick and pass in the vars.
	return new Function( "vars", `with(vars){ return \`${str}\` }` )( vars );
};
