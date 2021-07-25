Editor.Modules.Dialog.init_document =function( oEditor ){
	var _oEditor
	, oDialog = Editor.Dialog.document
	, _oDocument
	, _oReady = {}
	, _ =function( sEltId ){
		return document.getElementById( 'e'+ oEditor.id + sEltId )
		}
	, _initializeHTMLSelect =function( sName ){
		var oConfig = Editor.oConfig[ sName ]
		, e = _( sName )
		, sAttr = oConfig.type + sName
		Tag.setChildNodes( e, 'OPTION', oConfig.list.split('/'), _oEditor[sAttr])
		e.value = _oDocument[sAttr]
		if( ! _oReady[sAttr]){
			_oReady[sAttr]=1
			Events.add( e, 'change', function(){
				_oEditor.setAttribute( sName.charAt(0).toLowerCase()+sName.slice(1), e.value )
				})
			}
		if( ! _oEditor.oReady[sAttr]){
			_oEditor.oReady[sAttr]=1
			Events.add(
				_oEditor, sName+'Change', function(){
					if( this !== _oEditor ) return
					if( e ) e.value = _oDocument[sAttr]
					}
				)
			}
		}
	, _initializeHTMLCheckbox =function( sName ){
		var oConfig = Editor.oConfig[sName]
		, e = _( sName )
		, sAttr = oConfig.type+sName
		e.checked = _oDocument[sAttr]
		if( ! _oReady[sAttr]){
			_oReady[sAttr]=1
			Events.add( e, 'change', function(){ _oEditor.setAttribute( sName.charAt(0).toLowerCase()+sName.slice(1), e.checked ) })
			}
		if( ! _oEditor.oReady[sAttr]){
			_oEditor.oReady[sAttr]=1
			Events.add(
				_oEditor, sName+'Change', function(){
					if( this !== _oEditor ) return
					if( e ) e.checked = _oDocument[sAttr]
					var f = Editor.oConfig[sName].disabled
					if( f ) e.disabled = f()
					}
				)
			}
		}
	, _hide =function( s ){
		for(var i=0, a=s.split('/'), ni=a.length; i<ni; i++ )
			_( a[i]).parentNode.parentNode.style.display = "none"
		}
	, _initialize =function( E ){
		if( _oEditor!==E ){
			_oEditor = E
			if( ! _oEditor.oReady ) _oEditor.oReady = {}
			}
		var D = E.oActiveDocument
		if( _oDocument!==D ){
			_oDocument = D
			oDialog.setTitle( D.sFileName )
			var s = 'ContentEditable'
			_(s).disabled = Editor.oConfig[s].disabled()
			for(var i=0, a='Syntax/LineHeight/FontSize/TabSize'.split('/'), ni=a.length; i<ni; i++ )
				_initializeHTMLSelect( a[i])
			for(var i=0, a='Lines/Columns/Gutter/SoftTab/WhiteSpaces/ContentEditable'.split('/'), ni=a.length; i<ni; i++ )
				_initializeHTMLCheckbox( a[i])
			}
		}

	Events.add(
		Editor,
			'editor', _initialize,
			'document', _initialize,
		oDialog,
			'open', _initialize
		)
	}