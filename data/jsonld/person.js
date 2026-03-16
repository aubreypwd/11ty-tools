const required = require( '@root/required.js' );

module.exports = ( site, overrides = {} ) => {
	return required.deepmerge(
		{
			'@type': 'Person',
			'@id': `${ site.baseUrl }#Person`,
			name: site.meta?.author ?? '',
			jobTitle: '',
			url: `${ site.baseUrl }/`,
			telephone: '',
			email: '',
			sameAs: [],
			knowsAbout: []
		},
		overrides
	);
};
