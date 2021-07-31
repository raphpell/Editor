Editor.addModule( 'Commands',(function(){
	var fH=Editor.addInHistory
	  , fI=Editor.getUniqueId

/* Functions arguments = E,D,C,S,T,V
	E = oEditor
	D = E.oActiveDocument
	C = D.oCaret
	S = D.oSelection
	T = D.oSource
	V = D.oView
*/
	var Cds ={
	1 :(E)=> E.oTopMenu.toggle(),
	2 :(E)=> E.oTabMenu.toggle(),
	3 :(E)=> E.oStatus.toggle(),
	4 :(E,D)=> D.oGutter.toggle(),
	5 :(E,D)=> D.oCurrentLine.toggle(),

	COPY :(E)=>{
		E.sClipBoardValue = E.eClipboard.value
		setTimeout( function(){ E.eTextarea.focus()}, 50 )
		return true
		},
	CUT :(E,D,C,S)=>{
		E.sClipBoardValue = E.eClipboard.value
		setTimeout( function(){
			if( S && S.exist()){
				var n = S.start
				S.replace( '', false, fI('CUT'))
				C.setIndex( n )
				E.eTextarea.focus()
				}
			}, 50 )
		return true
		},
	PASTE :(E,D,C,S)=>{
		var sAction = fI('PASTE')
		var f = Editor.insertTextFromTextarea
		E.eClipboard.value= ''
		return S && S.exist()
			? f.call( E, E.eClipboard, sAction )
			: f.call( E, null, sAction )
		},

	DOCUMENT_CLOSE :(E,D)=>{ if( E.oTabMenu ) E.oTabMenu.close( D.sName )},
	DOCUMENT_NEW: (E)=>{ E.newDoc()},
	DOCUMENT_SAVE :(E)=>{ E.saveDoc()},

	DIALOGS :(E)=> E.dialog('dialogs'),
	DIALOG_DOCUMENT :(E)=> E.dialog('document'),
	DIALOG_SEARCH :(E)=> E.dialog('search'),
	INFO :(E)=> E.dialog('info'),
	
	FULLSCREEN: (E,D)=>{
		Tag.fullscreen( E.eEditor, E.bFullScreen = ! E.bFullScreen )
		var o = E.oTopMenu
		if( o ) o.MenuItem.set( 'FULLSCREEN', E.bFullScreen ? 'down' : 'up' )
		E.oGrip[ E.bFullScreen ? 'hide' : 'show' ]()
		E.setDocActive( D )
		if( E.onresize ) E.onresize()
		},
	SET_ZOOM :(E,D)=>{
		D.setAttribute( 'fontSize', E.sFontSize )
		D.scrollToPosition()
		},
	SHOW_CARET :(E,D)=> D.scrollToPosition(),
	SHOW_COLUMNS:(E)=> E.setAttribute('columns'),
	SHOW_INVISIBLES :(E)=> E.setAttribute('whiteSpaces'),
	SHOW_LINES:(E)=> E.setAttribute('lines'),
	SOFT_TAB:(E)=> E.setAttribute('softTab'),
	ZOOM_IN :(E,D)=> D.setAttribute( 'fontSize', ( parseInt(D.sFontSize)+2 ) +'px' ),
	ZOOM_OUT :(E,D)=>{
		var n = parseInt( D.sFontSize )-2
		if( n > 0 ) D.setAttribute( 'fontSize', n+'px' )
		},

	CHAR_LEFT :(E,D,C,S,T,V)=>{
		if( ! C.state ) E.execCommand('LINE_UP')
		else if( S && S.exist()){
			var n = S.get().start
			if( n!=null ){
				S.collapse()
				C.setIndex( n )
				E.eTextarea.focus()
				}
			}
		else{// Déplacement caractère par caractère
			var n = C.position.index
			if( n<=0 ) return ;
			if( C.setIndex( n-1 )){
				var sLine = T.getLine( V.getClosestLine( 'top', C.position.line ))
				C.setIndex( sLine.index + sLine.length - 1 )
				}
			}
		},
	CHAR_RIGHT :(E,D,C,S,T,V)=>{
		if( ! C.state ) E.execCommand('LINE_DOWN')
		else if( S && S.exist()){
			var n = S.end
			if( n!=null ){
				S.collapse()
				C.setIndex( n )
				E.eTextarea.focus()
				}
			}
		else{// Déplacement caractère par caractère
			var n = C.position.index
			if( n >= T.getValue().length ) return ;
			if( C.setIndex( n+1 )){
				var sLine = T.getLine( V.getClosestLine( 'bottom', C.position.line ))
				C.setIndex( sLine.index )
				}
			}
		},
	DOCUMENT_END :(E,D,C,S)=>{
		if( S ) S.collapse()
		C.setIndex( E.getContents().length )
		},
	DOCUMENT_START :(E,D,C,S)=>{
		if( S ) S.collapse()
		C.setIndex( 0 )
		},
	LINE_DOWN :(E,D,C,S,T,V)=>{
		var CP=C.position
		C.setPosition({ col:CP.col, viewLine:V.getLine( V.getClosestLine( 'bottom', CP.line ))})
		if( S && S.exist()) S.collapse()
		D.scrollToPosition()
		},
	LINE_END :(E,D,C,S)=>{
		if( ! C.state ) E.execCommand('DOCUMENT_END')
		else{
			if( S ) S.collapse()
			var n = C.position.line
			C.setPosition({ line:n, col:D.oPositions.getColumnMax( n )+1 })
			D.scrollToPosition()
			}
		},
	LINE_SCROLL_DOWN :(E,D,C,S,T,V)=>{
		if( V.nLineStart+2 > C.position.line ) E.execCommand('LINE_DOWN')
		D.oTextZoneControl.scrollBy( D.oCharacter.nHeight )
		},
	LINE_SCROLL_UP :(E,D,C,S,T,V)=>{
		if( V.nLineEnd-2 < C.position.line ) E.execCommand('LINE_UP')
		D.oTextZoneControl.scrollBy( -D.oCharacter.nHeight )
		},
	LINE_START :(E,D,C,S)=>{
		if( ! C.state ) E.execCommand('DOCUMENT_START')
		else{
			if( S ) S.collapse()
			C.setPosition({ line:C.position.line, col:1 })
			D.scrollToPosition()
			}
		},
	LINE_UP :(E,D,C,S,T,V)=>{
		var CP=C.position
		C.setPosition({ col:CP.col, viewLine:V.getLine( V.getClosestLine( 'top', CP.line ))})
		if( S && S.exist()) S.collapse()
		D.scrollToPosition()
		},
	PAGE_DOWN :(E,D,C,S,T,V)=>{
		var CP=C.position
		, nCharHeight = D.oCharacter.nHeight 
		, nLinesNumber = parseInt( E.nTextZoneHeight/nCharHeight )-1
		, nLine = V.getLinePlusPlus( CP.line, nLinesNumber, 'getviewline' )
		D.oTextZoneControl.scrollBy( nLinesNumber*nCharHeight )
		if( S ) S.collapse()
		C.setPosition({ col:CP.col, viewLine:nLine })
		},
	PAGE_UP :(E,D,C,S,T,V)=>{
		var CP=C.position
		, nCharHeight = D.oCharacter.nHeight 
		, nLinesNumber = parseInt( E.nTextZoneHeight/nCharHeight )-1
		, nLine = V.getLinePlusPlus( CP.line, -nLinesNumber, 'getviewline' )
		if( nLine < 1 ) nLine = 1
		D.oTextZoneControl.scrollBy( -nLinesNumber*nCharHeight )
		if( S ) S.collapse()
		C.setPosition({ col:CP.col, viewLine:nLine })
		},
	WORD_LEFT :(E,D,C,S,T)=>{
		if( ! C.state ) E.execCommand('LINE_UP')
		else if( S && S.exist()) E.execCommand('CHAR_LEFT')
		else{
			// déplacement mot par mot
			var n = C.position.index
			, oWord = T.getWordPositionAt( n, 'spaceRight' )
			C.setIndex( n > oWord.start ? oWord.start : oWord.previous )
			}
		},
	WORD_LEFT_END: null,
	WORD_RIGHT :(E,D,C,S,T)=>{
		if( ! C.state ) E.execCommand('LINE_DOWN')
		else if( S && S.exist()) E.execCommand('CHAR_RIGHT')
		else{
			var n = C.position.index
			, oWord = T.getWordPositionAt( n, 'spaceRight' )
			C.setIndex( n < oWord.end ? oWord.end : oWord.next )
			}
		},
	WORD_RIGHT_END: null
	}
	Cds.extend =function( oCommands ){
		Cds.acquire( oCommands )
		}
	return Cds
	})())