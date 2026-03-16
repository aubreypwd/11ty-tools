const site = require( '../../../_data/site.js' );

module.exports = {

	// https://schema.org/WebSite
	WebSite: {
		'@type': 'WebSite',
		'@id': `${ site.baseUrl }#WebSite`,
		name: site.title ?? '',
		url: `${ site.baseUrl }`,
		inLanguage: site.lang ?? '',
	},

	// https://schema.org/WebPage
	WebPage: {
		'@type': 'WebPage',
		'@id': `${ site.baseUrl }#WebPage`,

		name: '', // Set in src/_includes/11ty-starter-common/includes/jsonld.njk (page.title)
		url: `${ site.baseUrl }/#WebPage`, // Set in src/_includes/11ty-starter-common/includes/jsonld.njk (site.baseUrl + page.url)
		description: '', // Set in src/_includes/11ty-starter-common/includes/jsonld.njk (page.description)

		inLanguage: site.lang ?? '',
		isPartOf: { '@id': `${ site.baseUrl }#WebSite` },
		about: { '@id': `${ site.baseUrl }#LocalBusiness` },
	},

	// https://schema.org/Person
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

	// https://schema.org/LocalBusiness
	LocalBusiness: {
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
			// https://schema.org/PostalAddress
			'@type': 'PostalAddress',
			postalCode: '',
			addressLocality: '',
			addressRegion: '',
			addressCountry: ''
		},
		openingHours: [],
	}
};