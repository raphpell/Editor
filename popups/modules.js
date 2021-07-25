Editor.Modules.Dialog.init_modules =function( oEditor ){
	var _ =function( sEltId ){
		return document.getElementById( 'e'+ oEditor.id + sEltId )
		}
	, _refreshModulesList =function(){
		var a = _('Modules').getElementsByTagName('LI')
		for(var i=0, ni=a.length; i<ni; i++ ){
			if( Editor.Modules[a[i].title])
				a[i].className = 'loaded'
			}
		}
	Events.add(
		Editor.Dialog.modules,
			'click', function( evt ){
				var e = Events.element( evt )
				if( e.nodeName=='LI' ){
					var sModuleName = e.title
					if( ! Editor.Modules[sModuleName])
						Editor.loadModules( sModuleName, function(){
							_refreshModulesList()
							})
					}
				},
			'open', _refreshModulesList
		)
	}