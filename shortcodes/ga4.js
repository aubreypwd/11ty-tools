module.exports = ( eleventyConfig ) => eleventyConfig.addShortcode( 'ga4', ( id, options = {} ) => {

	if ( 'undefined' === typeof id ) {
		return /* html */ `<!-- Please add ga.config.id to page frontmatter -->`;
	}

	if ( process.env.ELEVENTY_RUN_MODE !== "build" && options.force !== true ) {
		return /* html */ `<!-- Local development, GA not loaded -->`;
	}

	return /* html */ `
		<!-- Google tag (gtag.js) for GA4 -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', '${id}');
		</script>
	`
} );
