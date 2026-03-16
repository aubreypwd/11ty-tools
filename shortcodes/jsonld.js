const path = require( 'path' );
const merge = require( 'deepmerge' );
const { structuredDataTest } = require( 'structured-data-testing-tool' );
const { sdoValidate } = require( 'schemaorg-jsd' );

module.exports = ( eleventyConfig ) => eleventyConfig.addAsyncShortcode( 'jsonld', async function ( type, id, data, options = {}, overrides = {} ) {

	// Normalize the object.
	data = merge(
		merge(
			data,
			{
				'@context': "https://schema.org/",
				'@type': type ?? 'Unknown',
				'@id': id
			}
		),
		overrides
	);

	const validate = ( options.validate ?? true ) && [

		// These are the only one's we can validate ATM.
		'WebSite',
		'WebPage',
		'Person',
		'Offer',
		'Organization',
		'LocalBusiness',
		'ItemList',
		'Product',
		'Event',
		'Place',
		'PostalAddress',
		'ImageObject'
	].includes( type );

	// This is what we will send to the DOM...
	const script = /* html */ `<script type="application/ld+json" data-validated="${ validate }" data-type="${ type }">${ JSON.stringify( data ) }</script>`;

	// Sometimes the validator doesn't know about certain types of jsonld.
	if ( validate ) {

		try {

			// Test the JSON structure.
			await structuredDataTest( `<!doctype html><html><head>${ script }</head><body></body></html>`, { schemas: [ type ] } );

			// Test the data...
			await sdoValidate( data, type, { strict: false, validateFormats: false } );

		} catch ( err ) {
			throw new Error( err );
		}
	}

	return script;
} );
