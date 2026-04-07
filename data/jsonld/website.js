const required = require( '@root/required.js' );

module.exports = ( site, overrides = {} ) => {
	return required.deepmerge(
		{
			'@type': 'WebSite',
			'@id': `${ site.baseUrl }#WebSite`,
			name: site.title ?? '',
			description: site.meta.description ?? '',
			url: `${ site.baseUrl }`,
			inLanguage: site.lang ?? 'en-US'
		},
		overrides
	);
};
