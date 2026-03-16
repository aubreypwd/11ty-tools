module.exports = ( site ) => ( {
	WebSite: {
		'@type': 'WebSite',
		'@id': `${ site.baseUrl }#WebSite`,
		name: site.title ?? '',
		url: `${ site.baseUrl }`,
		inLanguage: site.lang ?? '',
	},
} );
