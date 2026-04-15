const required = require( '@root/required.js' );

module.exports = ( site, name, overrides = {} ) => {
	return required.deepmerge(
		{
			'@type': 'Service',
			'@id': `${ site.baseUrl }#${ name }`.replace( ' ', '-' ),
			name: name,
			description: '',
			url: `${ site.baseUrl }#${ name }`.replace( ' ', '-' ),
			serviceType: '',
			areaServed: '',
			provider: {
				'@id': `${ site.baseUrl }#LocalBusiness`
			}
		},
		overrides
	);
};
