Editor.Modules.Dialog.init_dialogs =function( oEditor ){
	var _oEditor
	var _ =function( sEltId ){
		return document.getElementById( 'e'+ oEditor.id + sEltId )
		}
	Events.add(
		Editor.Dialog.dialogs,
			'open', function( E ){ _oEditor = E },
			'click', function( evt ){
				var e = Events.element( evt )
				if( e.nodeName=='INPUT' ) Editor.Modules.Dialog( _oEditor, e.title )
				}
			)
	}