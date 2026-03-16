const site = require( '../../../../_data/site.js' );

module.exports = {
	Person: {
		'@type': 'Person',
		'@id': `${ site.baseUrl }#Person`,
		name: site.meta?.author ?? '',
		jobTitle: '',
		url: `${ site.baseUrl }/`,
		telephone: '',
		email: '',
		sameAs: [],
		knowsAbout: [],
	},
};
