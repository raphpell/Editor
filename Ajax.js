Ajax =function( o ){
	var _getInfo =function( n ){
		var o = this.aInfo[n]
		if( ! o ) Ajax.onerror( 'CACHE_NOT_FOUND' )
		return o
		}
	, _onreply =function( n ){
		var m, o = _getInfo.call( this, n )
		o.sReceive = new Date ().getTime() - o.dSend.getTime() + 'ms'
		try{
			switch( o.sResponseType ){
				case 'js': eval( 'm = ' + o.oRequest.responseText ); break
				case 'text': try{ m = o.oRequest.responseText; }catch(e){
					alert( "Ajax:: Problème d'encodage." )
					} break
				case 'xml': 
					var e = o.oRequest.responseXML
					m = e ? e.documentElement : null
					break
				default: Ajax.onerror( 'UNKNOWN_RESPONSE_TYPE', o.sResponseType )
				}
			}catch(e){
				Ajax.onerror({
					message: e.message,
					description: e.description,
					url: o.sUrl,
					responseType: o.sResponseType,
					responseText: o.oRequest.responseText
					})
				 }
		o.mResponse = m
		if( this.bCache )
			this.cache( 'set', o.sMethod, o.sResponseType, o.sUrl + ( o.sQuery ? '?' + o.sQuery : '' ), n )
		_process.call( this , n )
		o.oRequest = null
		}
	, _onstatechange =function( n ){
		var that = this
		return function(){
			var oInfo = _getInfo.call( that, n )
			, o2 = oInfo.oRequest
			if( o2 && o2.readyState == 4 ){
				var b = false
				try{ b = o2.status == 200 }catch( e ){ return false }
				if( b ) _onreply.call( that, n )
					else try{
						Ajax.onerror({
							description: o2.status, 
							message: o2.statusText || '' , 
							responseHeaders: o2.getAllResponseHeaders(),
							url: oInfo.sUrl
							})}catch(e){}
				}
			}
		}
	, _process =function( n, oOnreception ){
		var oInfo = _getInfo.call( this , n )
		, b = oOnreception ? 1 : 0 // Cache
		, mResponse = oInfo.mResponse
		, m = b ? oOnreception.mFunction : oInfo.mFunction 
		, o = b ? oOnreception.oInstance : oInfo.oInstance
		if( o ) o[ m ].call( o, mResponse, b )
			else if( m ){
				var f = m.constructor == Function ? m : eval( m )
				if( f && f.constructor == Function ) f( mResponse, b )
				}
		if( ! b ) oInfo.sEnd = new Date ().getTime() - oInfo.dSend.getTime() + 'ms'
		if( ! this.bCache ) this.aInfo[n] = 0
		return n
		}
	, _send =function( sMethod, sUrl, sResponseType, m, o, bWindow ){
		var oRestore = {
			sMethod: this.sMethod,
			sResponseType: this.sResponseType
			}
		this.sMethod = sMethod
		this.sResponseType = sResponseType || this.sResponseType
		var n = this.send( sUrl, m, o, bWindow )
		this.extend( oRestore )
		return n
		}

	var oPublic = {
		send :function( sUrl, m, o, bWindow ){
			var sResponseType = this.sResponseType.toLowerCase()
			, sMethod = this.sMethod.toUpperCase()
			, sQuery = ''
			, bPOST = sMethod=='POST'
			if( bPOST ){
				var a = sUrl.split('?')
				sUrl = a[0]
				sQuery = a[1] || ''
				}
			if( this.bWindow || bWindow ){
				var sWindowName = 'debug_window' + (++Ajax.nWindowId)
				var oWindow = window.open( '', sWindowName, '' )
				oWindow.focus() 
				switch( sMethod ){
					case 'GET':
						oWindow.location = sUrl // window.open( sUrl , '' , '' )
						break;
					case 'POST':
						var eForm = Tag( 'FORM', { method:'POST', action:sUrl, target:sWindowName })
						, a = sQuery.split( '&' )
						for( var i = 0, ni = a.length; i < ni; i++ ){
							var ai = a[i].split( '=' )
							eForm.appendChild( Tag( 'INPUT', { name:ai[0], value:unescape( ai[1]), type:'hidden' }))
							}
						var e = getTags( 'BODY' )[0]
						e.appendChild( eForm )
						eForm.submit()
						e.removeChild( eForm )
						break;
					}
				return null
				}
			if( this.bCache ){
				var n = this.cache( 'get', sMethod, sResponseType, sUrl + ( bPOST ? '?' + sQuery : '' ))
				if( n !== null ) return _process.call( this, n, { oInstance:o, mFunction:m })
				}
			var oRequest = window.XMLHttpRequest 
				? new XMLHttpRequest ()
				: ( window.ActiveXObject ? new ActiveXObject ( 'Microsoft.XMLHTTP' ) : 0 )
			, m = m || this.mFunction
			, o = o || this.oInstance
			, n = this.aInfo.length
			if( ! oRequest ) return Ajax.onerror( 'NOT_SUPPORTED', 'change your browser' )
			this.aInfo[n] ={
				dSend: new Date (),
				oInstance: o,
				oRequest: oRequest,
				mFunction: m,
				sMethod: sMethod,
				sQuery: sQuery,
				sResponseType: sResponseType,
				sUrl: sUrl
				}
			oRequest.onreadystatechange = _onstatechange.call( this, n )
			oRequest.open( sMethod, sUrl, this.bAsynchronous )
			if( bPOST ){
			//	sQuery = str_replace([ '%', '+' ], [ '%25', '%2B' ] , sQuery )
				oRequest.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' )
			// Les lignes suivantes on été commentées après l'observation de message d'erreur
			//	oRequest.setRequestHeader( 'Content-length', sQuery.length )
			//	oRequest.setRequestHeader( 'Connection', 'close' )
				}
			oRequest.send( bPOST ? sQuery :  null )
			return n
			},
		get :function( sUrl, s, m, o, b ){ return _send.call( this, 'GET', sUrl, s, m, o, b )},
		post :function( sUrl, s, m, o, b ){ return _send.call( this, 'POST', sUrl, s, m, o, b )}
		}
	this.clearCache()
	this.extend([ o ? o : {}, Ajax.oDefaultSettings, oPublic ] , true )
	}

Ajax.union({
	nWindowId: 0,
	oDefaultSettings:{
		bAsynchronous: 1,
		bCache: 0,
		bWindow: 0,
		sMethod: 'GET' , // || 'POST'
		sResponseType: 'js' // || 'xml' || 'text'
		},
	load :function( sUrl, m ){
		var o = new Ajax, f = m &&  m.constructor==Function ? m : function( s ){
			m[ m.value!=undefined ? 'value' : 'innerHTML' ] = s
			m.style.overflow = 'auto' // pour IE
			}
		o.get( sUrl +'?asText=1&uncompressed=1', 'text', f )  // asText pour IE
		},
	onerror :function( m, s ){
		var sError = ''
		switch( m.constructor ){
			case String: sError = m +' '+ s
				break;
			default:
				var aDesc = []
				each(
					'url,description,message,responseHeaders,responseText,responseType'.split( ',' ),
					function( s ){ m[s] ? aDesc.push( s + ' = ' + m[s] ) : '' },
					[String]
					)
				sError = "\n"+ aDesc.join( ",\n" )
			}
		throw new Error ( 'Ajax :: ' + sError )
		}
	})

Ajax.prototype.extend({
	cache :function( sAction, sMethod, sResponseType, sUrl, n ){
		if( sAction == 'initialize' )
			return this.oCache = {
				GET:{js:{},xml:{},text:{}},
				POST:{js:{},xml:{},text:{}}
				}
		try{
			var o = this.oCache[ sMethod.toUpperCase()][ sResponseType.toLowerCase()]
			}catch(e){
				Ajax.onerror( 'INVALID_CACHE_PATH' )
				}
		if( sUrl.length > 256 ) Ajax.onerror( 'INVALID_CACHE_ID' )
		switch( sAction ){
			case 'get': return o[ sUrl ] || null
			case 'set': return o[ sUrl ] = n
			case 'delete':
				var n = o[ sUrl ]
				if( ! isNaN( n )){
					delete o[ sUrl ]
					this.aInfo[n] = 0
					return n
					}
			}
		return null
		},
	clearCache :function(){
		this.aInfo = []
		this.cache( 'initialize' )
		},
	remove :function( sUrl, sMethod, sResponseType ){
		return this.cache( 'delete', sMethod, sResponseType, sUrl )
		}
	})