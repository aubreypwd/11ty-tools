module.exports = ( eleventyConfig ) => {
	eleventyConfig.addShortcode( 'test', () => `This is a <strong>shortstrong</code> test.` );
};
