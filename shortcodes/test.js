module.exports = ( eleventyConfig ) =>
	eleventyConfig.addShortcode(
		'test',
		( content ) => /* html */ `
			<p>This is a <strong>shortcode</strong> test. Here is the <code>$content</code>: ${content}</p>
		`
	);
