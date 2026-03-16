const site = require( '../../../../_data/site.js' );

module.exports = {
	WebSite: {
		'@type': 'WebSite',
		'@id': `${ site.baseUrl }#WebSite`,
		name: site.title ?? '',
		url: `${ site.baseUrl }`,
		inLanguage: site.lang ?? '',
	},
};
