
Editor.addModule('Dialog',(function(){
	var _Dialogs ={
		en:{ aList:[], sLanguage:'en' },
		fr:{ aList:[], sLanguage:'fr' }
		}
	var Dialogs = _Dialogs.fr
	var _sCurrentDialog = null
	var _sLanguage = null
	
	var _setCurrent =function( sDialogName ){
		if( Dialogs[ _sCurrentDialog ]) Tag.className( Dialogs[ _sCurrentDialog ], 'current', 'delete' )
		if( sDialogName ) Tag.className( Dialogs[ _sCurrentDialog = sDialogName ], 'current', 'add' )
		}
	var _close =function( sDialogName ){
		var e = Dialogs[ sDialogName ]
		if( e ){
			var o = e.style
			e.bShowed = e.bDetached = 0
			o.display = "none"
			o.top = null
			if( _sCurrentDialog==sDialogName ) _setCurrent( null )
			if( e.onclose ) e.onclose()
			}
		}
	var _open =function( E, sDialogName ){
		var e = Dialogs[ sDialogName ], o = e.style
		if( e.parentNode != E.eDialogs ) E.eDialogs.appendChild( e )
		if( e.onopen ) e.onopen( E )
		for(var eDialog=E.eDialogs.firstChild; eDialog; eDialog=eDialog.nextSibling ){
			if( ! eDialog.bDetached ) _close( eDialog.sName )
			}
		o.display = ""
		var oDim = Tag.dimension( e )
		o.left = E.nTextZoneViewWidth/2 - oDim.width/2 +'px'
		o.top = ( E.oTopMenu && E.oTopMenu.bVisible ? E.oTopMenu.height : 0 )-1 +'px'
		e.bShowed = 1
		_setCurrent( sDialogName )
		}
	var _toggle =function( sDialogName ){ // NB: 	this == oEditor
		var e = Dialogs[ sDialogName ]
		if( e.parentNode != this.eDialogs ) e.bShowed = 0
		if( e )
			switch( e.bShowed ){
				case 1: _close( sDialogName ); break;
				default: _open( this, sDialogName )
				}
		this.focus()
		}
	let nTime
	let _load = function( E, sDialogName ){
		if( ! oDialog.html ) return ;
		if( oDialog.css ) Editor.loadFile( 'popups/'+ sDialogName +'.css?'+ nTime )
		var e = Dialogs[ sDialogName ] = E.eDialogs.appendChild( Tag( 'DIV', {
			innerHTML:'<div class="dialog_title">'+ (L10N['DIALOG_'+ sDialogName.toUpperCase()]||sDialogName) +'</div>'
						+ L10N.translate( oDialog.html.replace( /\{EDITOR_NAME\}/gm, E.id )),
			className:"dialogBox dialog_"+ sDialogName,
			sName: sDialogName
			}))
		Dialogs.aList.push( e )
		e.setTitle =function( sTitle ){ this.firstChild.innerHTML = sTitle }
		if( oDialog.js )
			Editor.loadFile( 'popups/'+ sDialogName +'.js?'+ nTime, function(){
				Editor.Modules.Dialog[ 'init_'+ sDialogName ]( E )
				_open( E, sDialogName )
				})
			else _open( E, sDialogName )
		var oStartMove, oStartPos
		Events.preventSelection( true, Dialogs[ sDialogName ], 'INPUT|SELECT|TEXTAREA' )
		Events.add(
			e,
				'mousedown', function(){ _setCurrent( sDialogName )},
				'dblclick', function( evt ){
					if( Events.element( evt ).className=="dialog_title" ) _close( sDialogName )
					},
				'mousedown', function( evt ){
					if( Events.element( evt ).className=="dialog_title" ){
						oStartMove = Mouse.position( evt )
						var oStyle = Dialogs[ sDialogName ].style
						oStyle.transition = "none"
						oStartPos ={
							left:parseInt( oStyle.left ),
							top:parseInt( oStyle.top )
							}
						}
					},
			document,
				'mousemove', function( evt ){
					if( oStartMove ){
						var oEndMove = Mouse.position( evt )
						, oStyle = Dialogs[ sDialogName ].style
						oStyle.left = oStartPos.left + oEndMove.left - oStartMove.left +'px'
						oStyle.top = oStartPos.top + oEndMove.top - oStartMove.top +'px'
						}
					},
				'mouseup', function(){
					if( oStartMove ){
						var oDialog = Dialogs[ sDialogName ]
						oDialog.bDetached = true
						oDialog.style.transition = null
						oStartMove = null
						}
					}
			)
		}

	var Dg =function( E, sDialogName ){
		Dg.setLanguage( E )
		if( ! Dialogs[ sDialogName ]){
			nTime = (new Date).valueOf() 
			Scripts.add(
				Editor.sBasePath +'popups/'+ sDialogName +'.json?sLanguage='+ E.sLanguage +'&time='+nTime,
				()=>_load( E, sDialogName )
				)
			} else _toggle.call( E, sDialogName )
		}
	Dg.setLanguage =function( E ){
		var sLanguage = E.sLanguage
		if( _sLanguage == sLanguage ) return null
		_sLanguage = sLanguage
		if( ! _Dialogs[ sLanguage ]) _Dialogs[ sLanguage ] = { aList:[], sLanguage:sLanguage }
		// détache les fenêtres de l'ancien langage
		for(var i=0, a=Dialogs.aList, ni=a.length; i<ni; i++ )
			if( a[i].parentNode )
				a[i] = a[i].parentNode.removeChild( a[i])
		Editor.Dialog = Dialogs = _Dialogs[ sLanguage ]
		// attache les fenêtres de l'ancien langage
		for(var i=0, a=Dialogs.aList, ni=a.length; i<ni; i++ )
			E.eDialogs.appendChild( a[i])
		}
	return Dg
	})())
