Editor.addModule('KeyBoard',(function(){
	var ShortCuts={
/*
- TODO
	'CTRL+O':'WINDOW_OPEN',
	'CTRL+P':'WINDOW_PRINT',
	'CTRL+B':'MATCHING_BRACE',
- ABORTED
	'CTRL+H':'WINDOW_REPLACE',
- RESERVED
	et bien d'autre...
*/
	// TextZone
		'ALT+SHIFT+M':'1', // TopMenu
		'ALT+SHIFT+T':'2', // TabMenu
		'ALT+SHIFT+S':'3', // Status
		'ALT+SHIFT+G':'4', // gutter
		// ALT+SHIFT+F = // Fold
		'ALT+SHIFT+L':'5',
	// Editor
		'F3':function(){ alert('DOCUMENT_RENAME ?')},
		'CTRL+N':'DOCUMENT_NEW',
	//	'CTRL+W':'DOCUMENT_CLOSE',
		'CTRL+S':'DOCUMENT_SAVE',
		'CTRL+SHIFT+:':'SOFT_TAB',
		'CTRL+SHIFT+;':'SHOW_INVISIBLES',
		'CTRL+;':'SHOW_LINES',
		'CTRL+:':'SHOW_COLUMNS',
		'CTRL+F11':'FULLSCREEN',
		'CTRL+F':'DIALOG_SEARCH',
		'ALT+W':'DIALOGS',
		'CTRL+M':'DIALOG_DOCUMENT',
	// Déplacement du curseur
		'HOME':'LINE_START',
		'END':'LINE_END',
		'CTRL+HOME':'DOCUMENT_START',
		'CTRL+END':'DOCUMENT_END',
		'LEFT':'CHAR_LEFT',
		'RIGHT':'CHAR_RIGHT',
		'UP':'LINE_UP',
		'DOWN':'LINE_DOWN',
		'CTRL+LEFT':'WORD_LEFT',
		'CTRL+RIGHT':'WORD_RIGHT',
	// Défiler
		'PAGE_DOWN':'PAGE_DOWN',
		'PAGE_UP':'PAGE_UP',
		'CTRL+DOWN':'LINE_SCROLL_DOWN',
		'CTRL+UP':'LINE_SCROLL_UP',
	// Presse papier
		'CTRL+C':'COPY',
		'CTRL+X':'CUT',
		'CTRL+V':'PASTE',
	// Zoom
		'CTRL+DIVIDE':'SET_ZOOM',
		'CTRL+MINUS':'ZOOM_OUT',
		'CTRL+PLUS':'ZOOM_IN'
		}
	var K = class {
		constructor( E ){
			this.E = E
			Events.add( // Capture des touches pressées
				E.eTextarea, // CURSEUR TEXTE
					'keypress', function( evt ){
						E.sClipBoardValue=''
						Keyboard.code( evt )
						if( Keyboard.key ) Editor.insertTextFromTextarea.call( E )
						},
				E.eClipboard, // SELECTION
					'keydown', function( evt ){
						Keyboard.code( evt )
						if( Keyboard.ctrl/*  || Keyboard.shift */ || Keyboard.alt ) ; // raccourcies
							else E.eTextarea.focus()
						// Soucis comment bloquer les raccourcies du navigateur utilisé dans l'éditeur... ormis couper/coller
						// return Events.prevent( evt )
						}
				)
			this.addShortCuts( ShortCuts )
			}
		addShortCuts ( oShortCuts ){
			let E = this.E
			var _fShortCut =function( sShortCut ){
				return ()=>{ return this.fireShortCut( sShortCut )}
				}
			// Enumère les touches raccourcies
			var aKeys=[], sChar
			for(var sShortCut in oShortCuts ){
				sChar = sShortCut.charAt(0)
				if( sChar.toUpperCase()==sChar )
					aKeys.push( sShortCut, _fShortCut.call( this, sShortCut ))
				}
			// Ajout des touches raccourcies
			ShortCut.apply( null, Array.merge(
				[ E.eTextarea ], aKeys,
				[ E.eClipboard ], aKeys
				))
			}
		fireShortCut ( sKeys ){
			let E = this.E
			E.focus()
			var m = ShortCuts[ sKeys ]
			if( m ){
				if( m.constructor==String ) return E.execCommand( m )
				if( m.constructor==Function ){
					var D=E.oActiveDocument, C=D.oCaret, S=D.oSelection, T=D.oSource, V=D.oView
					return m.call( null, E,D,C,S,T,V )
					}
				}
			}
		}
	K.ShortCuts = ShortCuts
	K.extend =function( oShortCuts ){
		ShortCuts.acquire( oShortCuts )
		Editor.mapEditors( function(E){ E.oKeyBoard.addShortCuts( oShortCuts )})
		}
	return K
	})())