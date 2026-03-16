const merge = require( 'deepmerge' );

module.exports = ( site, overrides = {} ) => {
	return merge(
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
