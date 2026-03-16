const required = require( '@root/required.js' );

module.exports = ( site, overrides = {} ) => {
	return required.deepmerge(
		{
			'@type': 'LocalBusiness',
			'@id': `${ site.baseUrl }#LocalBusiness`,
			image: site.meta?.img ? `${ site.baseUrl }/${ site.meta.img }` : '',
			name: site.title ?? '',
			alternateName: site.meta?.author ?? '',
			description: site.meta?.desc ?? '',
			url: `${ site.baseUrl }/`,
			telephone: '',
			priceRange: '',
			streetAddress: '',
			areaServed: '',
			sameAs: [],
			address: {
				'@type': 'PostalAddress',
				postalCode: '',
				addressLocality: '',
				addressRegion: '',
				addressCountry: '',
				streetAddress: ''
			},
			openingHours: []
		},
		overrides
	);
};
