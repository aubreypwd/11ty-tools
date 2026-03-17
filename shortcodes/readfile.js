const required = require( '@root/required.js' );

module.exports = ( eleventyConfig ) => eleventyConfig.addShortcode( 'readfile', ( base = eleventyConfig.dir.output, file ) => required.fs.readFileSync( required.path.resolve( base, file ), 'utf8' ) );
