module.exports = ( eleventyConfig ) => eleventyConfig.addNunjucksAsyncShortcode( 'qrcode', async function( url ) {

	return await require( 'qrcode' ).toString(
		url,
		{
			type: 'svg',
			margin: 0,
			width: 300,
			color: {
				dark: '#1d1d1d',
				light: '#00000000'
			}
		}
	);
} );
