const path = require( 'path' );
const { structuredDataTest } = require( 'structured-data-testing-tool' );
const { sdoValidate } = require( 'schemaorg-jsd' );

module.exports = ( eleventyConfig ) => eleventyConfig.addAsyncShortcode( 'jsonld', async function ( type, data, options = {} ) {

	// Normalize the object.
	data = Object.assign(
		data,
				{
			'@context': "https://schema.org/",
			'@type': type ?? '',
		}
	);

	// This is what we will send to the DOM...
	const script = /* html */ `<script type="application/ld+json">${ JSON.stringify( data ) }</script>`;

	try {

		// Test the JSON structure.
		await structuredDataTest( `<!doctype html><html><head>${ script }</head><body></body></html>`, { schemas: [ type ] } );

		// Test the data...
		await sdoValidate( data, type, { strict: false, validateFormats: false } );

	} catch ( err ) {
		throw new Error( err );
	}

	if ( options.asObject ?? false ) {
		return data;
	}

	return script;
} );
