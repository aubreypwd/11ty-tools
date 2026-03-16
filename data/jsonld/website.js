module.exports = ( site, overrides = {} ) => {
	return {
		'@type': 'WebSite',
		'@id': `${ site.baseUrl }#WebSite`,
		name: site.title ?? '',
		url: `${ site.baseUrl }`,
		inLanguage: site.lang ?? '',
		...overrides
	};
};
