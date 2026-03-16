module.exports = ( site, overrides = {} ) => {
	return {
		'@type': 'WebPage',
		'@id': `${ site.baseUrl }#WebPage`,
		name: '',
		url: `${ site.baseUrl }/#WebPage`,
		description: '',
		inLanguage: site.lang ?? '',
		isPartOf: { '@id': `${ site.baseUrl }#WebSite` },
		about: { '@id': `${ site.baseUrl }#LocalBusiness` },
		...overrides,
	};
};
