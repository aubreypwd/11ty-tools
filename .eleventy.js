require( 'module-alias/register' );

module.exports = async function ( eleventyConfig ) {
	return require( './src/_includes/11ty-starter-common/.eleventy.js' )( eleventyConfig );
};
