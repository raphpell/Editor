Editor.Modules.Dialog.init_commands =function( oEditor ){
	var _oEditor
	, oDialog = Editor.Dialog['commands']
	, _ =function( sEltId ){
		return document.getElementById( 'e'+ oEditor.id + sEltId )
		}
	, Line =function( sCommandName,sShortcut,sColor ){
		var a=[sCommandName,sShortcut,sColor]
		a.toString =function(){
			return sColor
				? '<tr style="background:'+ sColor +';" id="e'+ oEditor.id + sCommandName +'"><td>'+ sCommandName +'</td><td>'+ sShortcut +'</td></tr>'
				: '<tr id="e'+ oEditor.id + sCommandName +'"><td>'+ sCommandName +'</td><td>'+ sShortcut +'</td></tr>'
			}
		return a
		}
	, getList =function(){
		var aKeys = [], sChar, oShortCuts = Editor.Modules.KeyBoard.ShortCuts
		for(var sAttr in oShortCuts ){
			sChar = sAttr.charAt(0)
			if( sChar.toUpperCase()==sChar ){
				var sShortcut = str_replace( [ /\bUP/,/\bDOWN/,'RIGHT','LEFT'], ['&uarr;','&darr;','&rarr;','&larr;'], sAttr )
				var sCommandName = oShortCuts[sAttr]
				if( sCommandName.constructor==String ){
					var sColor = ! Editor.Modules.Commands[ sCommandName] ? 'red' : ''
					aKeys.push( Line( sCommandName,sShortcut,sColor ))
					}
				}
			}
		return aKeys
		}
	, setList =function( sSort ){
		oDialog.sSortDir = oDialog.sSortAttr==sSort && oDialog.sSortDir=='ASC' ? 'DESC' : 'ASC'
		oDialog.sSortAttr = sSort
		var aKeys = getList()
		aKeys.sortBy( oDialog.sSortAttr, oDialog.sSortDir )
		_('Commands').innerHTML = 
			'<table>'
			+ L10N.translate( '<tr><th id="0">@COMMAND@</td><th id="1">@SHORTCUT@</th></th>' )
			+ aKeys.join('')
			+ '</table>'
		}
	, _initialize =function( E ){
		if( _oEditor!==E ){
			_oEditor = E
			if( ! E.bDialogOnCommands ){
				E.bDialogOnCommands = 1
				Events.add(
					// Met en surbrillance la commande exécutée
					E, 'command', function( sCommand ){
						if( this!=_oEditor ) return ;
						if( ! oDialog.bShowed ) return ;
						var e = _( sCommand )
						if( e ){
							e.scrollIntoView()
							var o = e.style
							if( ! o.backgroundColor ){
								o.backgroundColor = "#FC0"
								setTimeout( function(){ o.backgroundColor = null }, 500 )
								}
							}
					})
				}
			oDialog.sSortDir = oDialog.sSortDir=='DESC' ? 'ASC' : 'DESC'
			setList( oDialog.sSortAttr = oDialog.sSortAttr || '0' )
			}
		}

	Events.add(
		Editor,
			'editor', _initialize,
			'document', _initialize,
		// Met à jour la liste de commande
		oDialog,
			'open', _initialize,
		// Lance une commande
		_('Commands'), 'mouseup', function( evt ){
			var e = Events.element( evt )
			_oEditor.focus()
			if( e.nodeName=="TD" ) _oEditor.execCommand( e.parentNode.firstChild.innerHTML )
			if( e.nodeName=="TH" ) setList( e.id )
			}
		)
	}