const renderTemplate = require( './utils/renderTemplate.js' );

module.exports = ( eleventyConfig ) => {

	eleventyConfig.addShortcode( 'ga4', ( id, options = { force: false } ) => {

		if ( process.env.ELEVENTY_RUN_MODE !== "build" && ! options.force ) {
			return "<!-- Local development, GA not loaded -->";
		}

		return renderTemplate( 'ga/ga.js.html', { id, options } );
	} );
};
