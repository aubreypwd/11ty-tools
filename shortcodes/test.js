module.exports = ( eleventyConfig ) =>
	eleventyConfig.addShortcode(
		'test',
		( content ) => `This is a <strong>shortcode</strong> test. Here is the <code>$content</code>: ${content}`
	);
