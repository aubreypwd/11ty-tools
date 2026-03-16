module.exports = ( site, overrides = {} ) => ( {
	'Services': {
		'links': Object
			.values( site.jsonld ?? {} )
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

	// Do not modify these here, instead override them where you require this.
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
	},
	...overrides
} );
