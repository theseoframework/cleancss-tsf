// USAGE:
// 1. Terminal -> New Terminal (CTRL+SHIFT+`)
// 2. Enter: npm start
// 3. Open your browser, and go to go to: localhost:8002/?file=C:\path\to\file.css
// 4. The response will be the minified file.

const CleanCSS = require('clean-css');
const fs    = require( 'fs' );
const http  = require( 'http' );
const url   = require( 'url' );
const port  = 8002;

console.log( 'Server started. Listening...' );
console.log( 'Go to: localhost:' + port + '/?file=C:\\path\\to\\file.css' );

const writeConversion = filename => new Promise( async ( _resolve, _reject ) => {

	console.log( 'Working on ' + filename );

	let options = {
		level: {
			1: {
				cleanupCharsets: true, // controls `@charset` moving to the front of a stylesheet; defaults to `true`
				normalizeUrls: true, // controls URL normalization; defaults to `true`
				optimizeBackground: true, // controls `background` property optimizations; defaults to `true`
				optimizeBorderRadius: true, // controls `border-radius` property optimizations; defaults to `true`
				optimizeFilter: true, // controls `filter` property optimizations; defaults to `true`
				optimizeFont: true, // controls `font` property optimizations; defaults to `true`
				optimizeFontWeight: true, // controls `font-weight` property optimizations; defaults to `true`
				optimizeOutline: true, // controls `outline` property optimizations; defaults to `true`
				removeEmpty: true, // controls removing empty rules and nested blocks; defaults to `true`
				removeNegativePaddings: true, // controls removing negative paddings; defaults to `true`
				removeQuotes: true, // controls removing quotes when unnecessary; defaults to `true`
				removeWhitespace: true, // controls removing unused whitespace; defaults to `true`
				replaceMultipleZeros: true, // contols removing redundant zeros; defaults to `true`
				replaceTimeUnits: true, // controls replacing time units with shorter values; defaults to `true`
				replaceZeroUnits: true, // controls replacing zero values with units; defaults to `true`
				roundingPrecision: false, // rounds pixel values to `N` decimal places; `false` disables rounding; defaults to `false`
				selectorsSortingMethod: 'standard', // denotes selector sorting method; can be `'natural'` or `'standard'`, `'none'`, or false (the last two since 4.1.0); defaults to `'standard'`
				specialComments: 'all', // denotes a number of /*! ... */ comments preserved; defaults to `all`
				tidyAtRules: true, // controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `true`
				tidyBlockScopes: true, // controls block scopes (e.g. `@media`) optimizing; defaults to `true`
				tidySelectors: true, // controls selectors optimizing; defaults to `true`,
				transform: function () { } // defines a callback for fine-grained property optimization; defaults to no-op
			}
		}
	};

	let fileContents = fs.readFileSync( new URL( 'file://' + filename ) );

	try {
		new CleanCSS( options ).minify( fileContents, function( err, output ) {
			if ( output ) {
				_resolve( output );
			} else {
				console.log( 'Encountered error transforming...' );
				console.log( err );
				_reject( err );
			}
		} );
	} catch ( err ) {
		console.log( 'Encountered error using CleanCSS...' );
		console.log( err.toString() );
		_reject( err );
	}
} );

http.createServer( ( req, res ) => {
	var queryData = url.parse(req.url, true).query;
	console.log( 'Received request...' );
	res.writeHead( 200, {"Content-Type": "text/plain"} );
	if ( queryData.file ) {
		writeConversion( queryData.file ).then( content => {
			res.write( content.styles );
		} ).catch( err => {
			res.write( '---ERROR  \n\n\n' );
			if ( err ) {
				res.write( err.toString() );
			} else {
				res.write( '...No usable error was specified...' );
			}
		} ).finally( () => {
			res.end();
			console.log( 'Sent response.' );
		});
	} else {
		res.write( 'Specify the file: ?file=C:\\path\\to\\file.css' );
		res.end();
		console.log( 'Sent response.' );
	}
} ).listen( port );
