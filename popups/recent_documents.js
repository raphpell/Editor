Editor.Modules.Dialog.init_recent_documents =function( oEditor ){
	var _oEditor
	, oDialog = Editor.Dialog['recent_documents']
	, _ =function( sEltId ){
		return document.getElementById( 'e'+ oEditor.id + sEltId )
		}
	, eUL = _('RecentDocuments')
	, setList =function(){
		var a = []
		_oEditor.mapDocuments( function( D ){
			if( _oEditor.isDocClosed( D.sName ))
				a.push( D.sName )
			})
		Tag.setChildNodes( eUL, 'LI', a )
		}
	, _initialize =function( E ){
		if( _oEditor!==E ){
			_oEditor = E
			if( ! E.bDialogRecentDocuments ){
				E.bDialogRecentDocuments = 1
				Events.add( E, 'close', setList )
				}
			setList()
			}
		}

	Events.add(
		Editor,
			'editor', _initialize,
			'document', _initialize,
		// 
		oDialog,
			'open', _initialize,
		// 
		eUL, 'click', function( evt ){
			var e = Events.element( evt )
			_oEditor.focus()
			if( e.nodeName=="LI" ){
				_oEditor.oTabMenu.open( e.innerHTML )
				setList()
				}
			}
		)
	}