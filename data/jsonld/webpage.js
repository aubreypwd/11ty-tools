const site = require( '../../../../_data/site.js' );

module.exports = {
	WebPage: {
		'@type': 'WebPage',
		'@id': `${ site.baseUrl }#WebPage`,
		name: '',
		url: `${ site.baseUrl }/#WebPage`,
		description: '',
		inLanguage: site.lang ?? '',
		isPartOf: { '@id': `${ site.baseUrl }#WebSite` },
		about: { '@id': `${ site.baseUrl }#LocalBusiness` },
	},
};
