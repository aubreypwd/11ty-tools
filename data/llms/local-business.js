const site = require( '../../../../_data/site.js' ) ?? {};

module.exports = {
	'Services': {
		'links': Object
			.values( ( require( '../../../../_data/jsonld.js' ) ?? {} ) )
			.filter( item => item?.[ '@type' ] === 'Service' )
			.map( service => {
				const anchor = String( service[ '@id' ] || service.name || '' )
					.replace( /#/g, '' )
					.replace( / /g, '-' )
					.toLowerCase();

				return {
					'label': service.name || 'Unnamed Service',
					'href': `${ site.baseUrl ?? '' }#${ anchor }`,
					'description': service.description || ''
				};
			} )
	},
	'Core Business Information': {
		'links': []
	},
	'Local Relevance': {
		'links': []
	},
	'Conversions': {
		'links': []
	},
	'Authority & Trust': {
		'links': []
	},
	'Optional': {
		'links': []
	}
};