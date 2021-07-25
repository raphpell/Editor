var valueToString =function(o){
	return JSON.stringify( o, null, " " ).str_replace('"','')
	}
var LexerNode =function( o ){
	var sToken = o.token
	, e = document.createElement( sToken )
	, sValue = o.value
	e.oValue = o
	e.title = valueToString( o )
		// sToken +\n\u25B6+ sValue +\u25C0
	if( sValue ) e.innerHTML = sValue.str_replace( ['&','<','>'], ['&amp;','&lt;','&gt;'])
	e.className = 'myNode'
	if( o.css ) e.className += ' '+ o.css
	return e
	}