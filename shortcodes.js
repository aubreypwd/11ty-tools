module.exports = ( eleventyConfig ) => eleventyConfig.addShortcode( "test", ( content ) => `<p>xThis is a <b>shortcode</b> test!: ${content}</p>` );
