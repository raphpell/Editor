Editor.Modules.Dialog.init_search =function( oEditor ){
	Editor.loadModules( 'Selection,TextMarker' )
	var _oEditor
	, _oDocument
	, _ =function( sEltId ){
		return document.getElementById( 'e'+ oEditor.id + sEltId )
		}
	, setDefaultSearch =function(){
		var S = _oDocument.oSelection
		_('TextSearch').value = S ? S.cloneContents() : ''
		_('TextSearch').focus()
		}
	, getText =function(){
		return _oDocument.oSource.getValue()
		}
	, getRegExp =function( bLine ){
		var s = _('TextSearch').value || 'Made in France'
		if( _('ModeNormal').checked ) s = RegExp.escape( s )
		var sBoundary = _('OnlyWord').checked ? '\\b' : ''
		, sRegExp = (bLine?'^':'')+ sBoundary + s + sBoundary +(bLine?'$':'')
		, sModifier = 'gm'+ (_('RespectCase').checked?'':'i')
		, re = new RegExp( sRegExp, sModifier )
		re.sModifier = sModifier
		return re
		}
	, getPosition =function( nLimit, sDirection ){
		if( !_('TextSearch').value ) return null
		var nFound=-1, sMatched
		, _getIndex =function( args ){
			for(var i=0, ni=args.length; i<ni; i++ )
				if( args[i].constructor!=String )
					return nIndex = args[i]
			}
		getText().replace( getRegExp(),{
			Down :function( sMatch, nIndex ){
				nIndex = _getIndex( arguments )
				if( nIndex >= nLimit && nFound==-1 ){ nFound=nIndex; sMatched=sMatch }
				},
			Up: function( sMatch, nIndex ){
				nIndex = _getIndex( arguments )
				if( nIndex+sMatch.length <= nLimit ){ nFound=nIndex; sMatched=sMatch }
				}
			}[ sDirection]
			)
		return nFound==-1
			? null
			: { start:nFound, end:nFound+sMatched.length, matched:sMatched }
		}
	, alertNotFound =function(){
		var re = getRegExp()
		alert( L10N.get( 'NOT_FOUND', '/'+ re.source +'/'+ re.sModifier ))
		}
	, _initialize =function( E ){
		if( _oEditor!==E ){
			_oEditor = E
			}
		var D = E.oActiveDocument
		if( _oDocument!==D ){
			_oDocument = D
			_('TabReplace').style.display = _oDocument.bContentEditable ? '' : 'none'
			}
		}
	, _open =function( E ){
		_initialize( E )
		setDefaultSearch()
		}
		
	Events.add(
		Editor,
			'editor', _initialize,
			'document', _initialize,
		Editor.Dialog.search, 'open', _open,
		'click',
			_('BtnNext'), function(){
				var oRange, D=_oDocument, C=D.oCaret, S=D.oSelection, V=D.oView
				if( _('Down').checked ){
					var nStart =  S.exist() ? S.end : C.position.index
					oRange = getPosition( nStart, 'Down' )
					if( ! oRange && nStart && _('Loop').checked ) oRange = getPosition( 0, 'Down' )
					}
				if( _('Up').checked ){
					var nStart = S.exist() ? S.start : C.position.index
					var nLength = getText().length
					oRange = getPosition( nStart, 'Up' )
					if( ! oRange && nStart<nLength && _('Loop').checked ) oRange = getPosition( nLength, 'Up' )
					}
				if( oRange ){
					S.set( oRange.start, oRange.end )
					C.setIndex( oRange.end )
					V.showLine( C.position.line )
					D.scrollToPosition()
					return
					}
				alertNotFound()
				},
			_('BtnCount'), function(){
				alert( L10N.get( 'COUNT_RESULT', ''+_oDocument.oTextMarker.mark( 'count', getRegExp())))
				},
			_('BtnReplace'), function(){
				var D=_oDocument, C=D.oCaret, S=D.oSelection
				var nStart = C.position.index
				if( S.exist() && getRegExp( true ).test( S.cloneContents())){
					var sResult = S.cloneContents().replace( getRegExp(), _('TextReplace').value )
					S.replace( sResult )
					nStart = S.end
					}
				if( _('Down').checked ){
					var oRange = getPosition( nStart, 'Down' )
					if( ! oRange && nStart && _('Loop').checked ) oRange = getPosition( 0, 'Down' )
					if( oRange ){
						S.set( oRange.start, oRange.end )
						C.setIndex( S.end )
						return
						}
					}
				if( _('Up').checked ){
					if( S.exist()) nStart = S.start
					var nLength = getText().length
					var oRange = getPosition( nStart, 'Up' )
					if( ! oRange && nStart<nLength && _('Loop').checked ) oRange = getPosition( nLength, 'Up' )
					if( oRange ){
						S.set( oRange.start, oRange.end )
						C.setIndex( oRange.end )
						return
						}
					}
				alertNotFound()
				},
			_('BtnReplaceAll'), function(){
				var D=_oDocument, C=D.oCaret, S=D.oSelection, nFound=-1, sMatched=-1
				var oRange = getPosition( 0, 'Down' )
				while( oRange ){
					S.set( oRange.start, oRange.end, true )
					var sResult = S.cloneContents().replace( getRegExp(), _('TextReplace').value )
					S.replace( sResult, true )
					oRange = getPosition( S.end, 'Down' )
					}
				if( S.exist()){
					S.set( S.start, S.end )
					C.setIndex( S.end )
					}
				},
			_('BtnMarkAll'), function(){ _oDocument.oTextMarker.mark( 'style6', getRegExp())},
			_('BtnPurge'), function(){ _oDocument.oTextMarker.unmark( 'style6' )},
			_('BtnClose'), function(){ Editor.Modules.Dialog( oEditor, 'search' )}
		)
	}