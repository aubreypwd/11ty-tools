const required = require( '@root/required.js' );

module.exports = ( site, overrides = {} ) => {

	const json = required.deepmerge(
		{
			'@type': 'WebPage',
			'@id': `${ site.baseUrl }#WebPage`,
			name: '',
			url: `${ site.baseUrl }#WebPage`,
			description: '',
			inLanguage: site.lang ?? '',
			isPartOf: { '@id': `${ site.baseUrl }#WebSite` }
		},
		overrides
	);

	// Make sure @type has no duplicates due to deepmerge.
	if ( Array.isArray( json['@type'] ) ) {
		json['@type'] = [ ...new Set( json['@type'] ) ];
	}

	return json;
};
