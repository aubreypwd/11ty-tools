const required = require( '@root/required.js' );

module.exports = ( eleventyConfig ) => eleventyConfig.addShortcode( 'readfile', ( file ) => required.fs.readFileSync( required.path.resolve( eleventyConfig.dir.output, file ), 'utf8' ) );
