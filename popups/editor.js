Editor.Modules.Dialog.init_editor =function( oEditor ){
	var _oEditor
	, _ =function( sEltId ){
		return document.getElementById( 'e_'+ oEditor.id +'_'+ sEltId )
		}
	, _initializeSELECT =function( sName ){
		var oConfig = Editor.oConfig[ sName ]
		, e = _( sName )
		, sAttr = oConfig.type + sName
		Tag.setChildNodes( e, 'OPTION', oConfig.list.split('/'), _oEditor[sAttr])
		e.value = _oEditor[sAttr]
		Events.add(
			e, 'change', function(){
				var _defaultValue = _oEditor[sAttr]
				_oEditor[sAttr] = e.value
				_oEditor.mapDocuments( function(D){
					if( D[sAttr]==_defaultValue ){
						D.setAttribute( sName.charAt(0).toLowerCase()+sName.slice(1), e.value )
						}
					})
				}
			)
		}
	, _initializeCHECKBOX_1 =function( sName ){
		var oConfig = Editor.oConfig[sName]
		, e = _( sName )
		, sAttr = oConfig.type+sName
		e.checked = _oEditor[sAttr]
		Events.add(
			e, 'change', function(){
				var _defaultValue = _oEditor[sAttr]
				_oEditor[sAttr] = e.checked
				_oEditor.mapDocuments( function(D){
					if( D[sAttr]==_defaultValue )
						D.setAttribute( sName.charAt(0).toLowerCase()+sName.slice(1), e.checked )
					})
				}
			)
		}
	, _initializeCHECKBOX_2 =function( sName ){
		var e = _( sName )
		, sAttr = 'b'+sName
		e.checked = _oEditor[sAttr]
		Events.add(
			e, 'change', function(){
				var b = e.checked
				_oEditor[sAttr] = b
				_oEditor['o'+sName][ b ? 'show' : 'hide' ]()
				}
			)
		}
	, _initialize =function( E ){
		if( _oEditor!==E ){
			_oEditor = E
			for(var i=0, a='FontSize/TabSize/LineHeight'.split('/'), ni=a.length; i<ni; i++ )
				_initializeSELECT( a[i])
			for(var i=0, a='Lines/Columns/Gutter/SoftTab/WhiteSpaces'.split('/'), ni=a.length; i<ni; i++ )
				_initializeCHECKBOX_1( a[i])
			for(var i=0, a='TopMenu/TabMenu/Status'.split('/'), ni=a.length; i<ni; i++ )
				_initializeCHECKBOX_2( a[i])
			}
		}

	Events.add(
		Editor, 'editor', _initialize,
		Editor.Dialog.editor, 'open', _initialize
		)
	}