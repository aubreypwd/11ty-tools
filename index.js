const path = require( 'path' );
const markdownIt = require( 'markdown-it' );

module.exports = function ( eleventyConfig, options = {} ) {

	// Add a markdown filter.
	eleventyConfig.addFilter( 'markdown', content => new markdownIt( { html: true } ).render( String( content ) ) );

	// Refresh anytime things change...
	eleventyConfig.addWatchTarget( __dirname );
	eleventyConfig.on( 'eleventy.before', () => delete require.cache[ require.resolve( __filename ) ] );

	// Shortcodes.
	eleventyConfig.addShortcode( 'test', require( './shortcodes/test.js' ) );
};
