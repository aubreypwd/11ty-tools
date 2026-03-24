const site = {
	baseUrl: 'https://505spotlight.com',
	lang: 'en-US',
	title: '505 Spotlight',
	disabled: [],
	configs: {},

	meta: {
		desc: '505 Spotlight',
		img: '/assets/img/example.webp', // Required for jsonld too, advise to set.
		twitter: '',
		author: 'Aubrey Portwood'
	}
};

site.jsonld = {
	Website: require( '../_includes/11ty-starter-common/data/jsonld/website.js' )( site ),
	WebPage: require( '../_includes/11ty-starter-common/data/jsonld/webpage.js' )( site, {
		name: 'Generic Page',
		description: 'Generic page description.',
	} ),
	Person: require( '../_includes/11ty-starter-common/data/jsonld/person.js' )( site, {
		jobTitle: 'Content Director',
		telephone: '+13142827391',
		email: 'contact@505spotlight.com',
		sameAs: [
			'https://twitter.com/aubreypwd',
			'https://hireaubrey.com'
		],
		knowsAbout: [
			'Albuquerque, New Mexico',
			'Rio Rancho, New Mexico',
			'Los Ranchos, New Mexico',
			'Corralles, New Mexico'
		]
	} ),
	LocalBusiness: require( '../_includes/11ty-starter-common/data/jsonld/local-business.js' )( site, {
		// priceRange: '',
		telephone: '+13142827391',
		// streetAddress: '123 Example Street',
		areaServed: 'Albuquerque, New Mexico',
		sameAs: [],
		openingHours: [
			'Mo-Fr 08:00-18:00'
		],
		address: {
			// postalCode: '87114',
			// streetAddress: '',
			// addressLocality: '',
			addressRegion: 'NM',
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
