aKeys.sort()
eKeyboard.innerHTML = aKeys.join('')
Events.add(
	eKeyboard, 'mouseup',
		function fireKeys ( evt ){
			var e = Events.element( evt )
			if( e.parentNode.nodeName=="KBD" ) e = e.parentNode
			if( e.nodeName=="KBD" ){
				oEditor.oActiveDocument.oCaret.state = true
				switch( eKeyboard.title ){
					case 'ShortCuts': return oEditor.oKeyBoard.fireShortCut( e.id )
					case 'Commands': return oEditor.execCommand( e.id.substr(1))
					}
				}
			},
	oEditor, 'command',
		function( sCommand ){
			var e = document.getElementById( '_'+sCommand )
			if( ! e ) return;
			if( e.parentNode.nodeName=="KBD" ) e = e.parentNode
			var oStyle = e.style
			if( ! oStyle.ok ){
				oStyle.ok = true
				oStyle.backgroundColor = "#FC0"
				setTimeout( function(){
					oStyle.backgroundColor = "#DDD"
					oStyle.ok = false
					}, 250 )
				}
			}
	)