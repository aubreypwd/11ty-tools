const merge = require( 'deepmerge' );

module.exports = ( site, overrides = {} ) => {
	return merge(
		{
			'@type': 'WebSite',
			'@id': `${ site.baseUrl }#WebSite`,
			name: site.title ?? '',
			url: `${ site.baseUrl }`,
			inLanguage: site.lang ?? 'en-US'
		},
		overrides
	);
};
