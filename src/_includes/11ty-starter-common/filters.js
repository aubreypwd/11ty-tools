const required = require( '@root/required.js' );
const markdownIt = require( 'markdown-it' ); // Cannot be in required.js since it's a Class.

module.exports = function ( eleventyConfig, config ) {

	// Add a markdown filter.
	eleventyConfig.addFilter( 'markdown', ( content, options = { disable: [ 'code' ] }, markdownItArgs = { html: true } ) => new markdownIt( markdownItArgs ).disable( options.disable ?? [] ).render( String( content ) ) );

	// Add a fileExsts nunchuck filter.
	eleventyConfig.addFilter( 'fileExists', _path => required.fs.existsSync( required.path.resolve( required.path.join( process.cwd(), config.dir.input, _path ) ) ) );

	// Easy way to make array's unique.
	eleventyConfig.addFilter( 'arrayUnique', function( value ) {

		if ( ! Array.isArray( value ) ) {
			return value;
		}

		return [ ...new Set( value ) ];
	} );

	// Add a way to strip the outer tags of a string, useful for {{ 'content' | markdown | sot | safe }}.
	eleventyConfig.addFilter( 'sot', function( str ) {

		const { parse } = require( 'node-html-parser' );

		if ( ! str ) {
			return str;
		}

		const root = parse( str );
		const first = root.firstChild ?? false;

		return first
			? first.innerHTML
			: str;
	} );

	// Dump json so you can look at it.
	eleventyConfig.addFilter( 'pj', ( value, spaces = 2 ) => JSON.stringify( value, null, spaces ) );

	// Deep merge objects in templates when site defaults need page-level overrides.
	eleventyConfig.addFilter( 'deepmerge', ( base, override = {} ) => required.deepmerge( base ?? {}, override ?? {} ) );

	// Format a phone number for display.
	eleventyConfig.addFilter( 'formatPhone', ( value ) => {

		if ( ! value || '' === value ) {
			return value;
		}

		const { parsePhoneNumberFromString } = require( 'libphonenumber-js' );
		return `1-${ parsePhoneNumberFromString( value, 'US' ).formatNational() }`;
	} );

	// Extract the hostname from a URL for cleaner link labels.
	eleventyConfig.addFilter( 'urlHostname', ( url ) => new URL( url ).hostname );
};
