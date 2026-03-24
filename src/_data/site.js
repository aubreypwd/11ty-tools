const site = {
	baseUrl: 'https://example.com',
	lang: 'en-US',
	title: 'Site Title',
	disabled: [],
	configs: {},

	meta: {
		desc: 'Site description',
		img: '/assets/img/example.webp', // Required for jsonld too, advise to set.
		twitter: 'example',
		author: 'My Name'
	}
};

site.jsonld = {
	Website: require( '../_includes/11ty-starter-common/data/jsonld/website.js' )( site ),
	WebPage: require( '../_includes/11ty-starter-common/data/jsonld/webpage.js' )( site, {
		name: 'Generic Page',
		description: 'Generic page description.',
	} ),
	Person: require( '../_includes/11ty-starter-common/data/jsonld/person.js' )( site, {
		jobTitle: 'Generic Role',
		telephone: '+15555550100',
		email: 'hello@example.com',
		sameAs: [
			'https://example.com/profile-a/',
			'https://example.com/profile-b/',
		],
		knowsAbout: [
			'Topic A',
			'Topic B',
			'Topic C',
		]
	} ),
	LocalBusiness: require( '../_includes/11ty-starter-common/data/jsonld/local-business.js' )( site, {
		priceRange: '$',
		telephone: '+15555550000',
		streetAddress: '123 Example Street',
		areaServed: 'Region A',
		sameAs: [
			'https://example.com/listing-a/',
			'https://example.com/listing-b/',
		],
		openingHours: [
			'Mo-Fr 08:00-18:00',
			'Sa 09:00-14:00',
		],
		address: {
			postalCode: '00000',
			streetAddress: '123 Example Street',
			addressLocality: 'City A',
			addressRegion: 'State A',
			addressCountry: 'US',
		}
	} ),
	ServiceA: require( '../_includes/11ty-starter-common/data/jsonld/service.js' )(
		site,
		'Service A',
		{
			description: 'Generic description for Service A.',
			serviceType: 'Category A',
			areaServed: 'Region A',
		}
	),
	ServiceB: require( '../_includes/11ty-starter-common/data/jsonld/service.js' )(
		site,
		'Service B',
		{
			description: 'Generic description for Service B.',
			serviceType: 'Category B',
			areaServed: 'Region B',
		}
	),
	ServiceC: require( '../_includes/11ty-starter-common/data/jsonld/service.js' )(
		site,
		'Service C',
		{
			description: 'Generic description for Service C.',
			serviceType: 'Category C',
			areaServed: 'Region C',
		}
	)
};

site.llms = require( '../_includes/11ty-starter-common/data/llms/local-business.js' )( site,
	{
		'Core Business Information': {
			'links': [
				{
					'label': 'About Us',
					'href': `${ site.baseUrl }/about/`,
					'description': 'Learn about the business, team background, and what makes this company different.'
				},
				{
					'label': 'Contact',
					'href': `${ site.baseUrl }/contact/`,
					'description': 'Find phone, email, contact form, and the fastest way to get in touch.'
				},
				{
					'label': 'Pricing',
					'href': `${ site.baseUrl }/pricing/`,
					'description': 'Review general pricing details, package options, and what is included.'
				}
			]
		},
		'Local Relevance': {
			'links': [
				{
					'label': 'Service Areas',
					'href': `${ site.baseUrl }/service-areas/`,
					'description': 'See the cities and neighborhoods this business serves across the local region.'
				},
				{
					'label': 'Albuquerque Location',
					'href': `${ site.baseUrl }/locations/albuquerque/`,
					'description': 'Get location-specific details for the main Albuquerque office, including directions and parking.'
				},
				{
					'label': 'Local Guide',
					'href': `${ site.baseUrl }/blog/albuquerque-guide/`,
					'description': 'Read locally focused advice, tips, and recommendations relevant to nearby customers.'
				}
			]
		},
		'Conversions': {
			'links': [
				{
					'label': 'Book Appointment',
					'href': `${ site.baseUrl }/book/`,
					'description': 'Schedule a service call, consultation, or appointment online.'
				},
				{
					'label': 'Request Quote',
					'href': `${ site.baseUrl }/quote/`,
					'description': 'Submit project details and request a custom estimate.'
				},
				{
					'label': 'Special Offers',
					'href': `${ site.baseUrl }/offers/`,
					'description': 'View current promotions, discounts, and limited-time offers.'
				}
			]
		},
		'Authority & Trust': {
			'links': [
				{
					'label': 'Reviews',
					'href': `${ site.baseUrl }/reviews/`,
					'description': 'Read customer testimonials and recent review highlights.'
				},
				{
					'label': 'Case Studies',
					'href': `${ site.baseUrl }/case-studies/`,
					'description': 'See examples of completed work, outcomes, and client success stories.'
				},
				{
					'label': 'Licenses & Certifications',
					'href': `${ site.baseUrl }/credentials/`,
					'description': 'Verify professional licenses, certifications, insurance, and related credentials.'
				}
			]
		},
		'Optional': {
			'links': [
				{
					'label': 'FAQ',
					'href': `${ site.baseUrl }/faq/`,
					'description': 'Find answers to common questions about services, scheduling, and policies.'
				},
				{
					'label': 'Blog',
					'href': `${ site.baseUrl }/blog/`,
					'description': 'Browse educational articles, updates, and practical tips from the business.'
				},
				{
					'label': 'Financing Options',
					'href': `${ site.baseUrl }/financing/`,
					'description': 'Review payment plans, financing details, and available approval options.'
				}
			]
		}
	}
 );

module.exports = site;
