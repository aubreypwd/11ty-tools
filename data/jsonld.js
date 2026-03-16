
// You can override this data in your site.json.
const site = require( '../../../_data/site.js' );

module.exports = {

	// https://schema.org/WebSite
	WebSite: {
		'@type': 'WebSite',
		'@id': `${ site.baseUrl }#WebSite`,
		name: 'Example Website',
		url: `${ site.baseUrl }`,
		inLanguage: 'en-US',

		// Overrides from site.jsonld.WebSite
		...( site.jsonld?.WebSite || {} )
	},

	// https://schema.org/WebPage
	WebPage: {
		'@type': 'WebPage',
		'@id': `${ site.baseUrl }#WebPage`,
		name: 'Example Page',
		url: `${ site.baseUrl }/example-page/`,
		description: 'Example description for a webpage on Example Website.',
		inLanguage: 'en-US',
		isPartOf: { '@id': `${ site.baseUrl }#WebSite` },
		about: { '@id': `${ site.baseUrl }#LocalBusiness` },

		// Overrides from site.jsonld.WebPage
		...( site.jsonld?.WebPage || {} )
	},

	// https://schema.org/Person
	Person: {
		'@type': 'Person',
		'@id': `${ site.baseUrl }#Person`,
		name: 'Example Person',
		jobTitle: 'Example Job Title',
		url: `${ site.baseUrl }/`,
		telephone: '+1-555-555-5555',
		email: 'hello@example.com',
		sameAs: [
			'https://twitter.com/example',
			'https://facebook.com/example',
			'https://linkedin.com/in/example'
		],
		knowsAbout: [
			'Example Skill One',
			'Example Skill Two',
			'Example Skill Three'
		],

		// Overrides from site.jsonld.Person
		...( site.jsonld?.Person || {} )
	},

	// https://schema.org/LocalBusiness
	LocalBusiness: {
		'@type': 'LocalBusiness',
		'@id': `${ site.baseUrl }#LocalBusiness`,
		image: `${ site.baseUrl }/assets/img/example.jpg`,
		name: 'Example Business',
		alternateName: 'Example Alternate Business Name',
		description: 'Example business description for a local business website.',
		url: `${ site.baseUrl }/`,
		telephone: '+1-555-555-5555',
		priceRange: '$$',
		areaServed: 'Example City, Example State',
		sameAs: [
			'https://maps.google.com/?q=Example+Business',
			'https://twitter.com/example',
			'https://facebook.com/example',
			'https://linkedin.com/company/example'
		],
		address: {
			// https://schema.org/PostalAddress
			'@type': 'PostalAddress',
			postalCode: '12345',
			addressLocality: 'Example City',
			addressRegion: 'EX',
			addressCountry: 'US'
		},
		openingHours: [ 'Mo-Fr 09:00-17:00' ],

		// Overrides from site.jsonld.LocalBusiness
		...( site.jsonld?.LocalBusiness || {} )
	},

	// Add or override entire objects.
	... ( site.jsonld ?? {} )
};
