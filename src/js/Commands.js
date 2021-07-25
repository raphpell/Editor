Editor.addModule( 'Commands',(function(){
	var fH=Editor.addInHistory
	  , fI=Editor.getUniqueId

/* Functions arguments = D,C,S,T,V
	D = this.oActiveDocument
	C = D.oCaret
	S = D.oSelection
	T = D.oSource
	V = D.oView
*/
	var Cds ={
	1 :function(){ this.oTopMenu.toggle()},
	2 :function(){ this.oTabMenu.toggle()},
	3 :function(){ this.oStatus.toggle()},
	4 :function(D){ D.oGutter.toggle()},
	5 :function(D){ D.oCurrentLine.toggle()},
/* 	
	5 :function(){ this.oGrip.toggle()},
	6 :function(){ this.oStatus.toggle()},
	7 :function(){ this.oTabMenu.toggle()},
	8 :function(){ this.oTopMenu.toggle()}, 
*/
	COPY :function(){
		var E=this
		E.sClipBoardValue = E.eClipboard.value
		setTimeout( function(){ E.eTextarea.focus()}, 50 )
		return true
		},
	CUT :function(D,C,S){
		var E=this
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
	PASTE :function(D,C,S){
		var sAction = fI('PASTE')
		var f = Editor.insertTextFromTextarea
		this.eClipboard.value= ''
		return S && S.exist()
			? f.call( this, this.eClipboard, sAction )
			: f.call( this, null, sAction )
		},

	DOCUMENT_CLOSE :function(D){ if( this.oTabMenu ) this.oTabMenu.close( D.sName )},
	DOCUMENT_NEW: function(){ this.newDoc()},
	DOCUMENT_SAVE :function(){ this.saveDoc()},

	DIALOGS :function(){ this.dialog('dialogs')},
	DIALOG_DOCUMENT :function(){ this.dialog('document')},
	DIALOG_SEARCH :function(){ this.dialog('search')},
	
	FULLSCREEN: function(D){
		Tag.fullscreen( this.eEditor, this.bFullScreen = ! this.bFullScreen )
		var o = this.oTopMenu
		if( o ) o.MenuItem.set( 'FULLSCREEN', this.bFullScreen ? 'down' : 'up' )
		this.oGrip[ this.bFullScreen ? 'hide' : 'show' ]()
		this.setDocActive( D )
		if( this.onresize ) this.onresize()
		},
	SET_ZOOM :function(D){
		D.setAttribute( 'fontSize', this.sFontSize )
		D.scrollToPosition()
		},
	SHOW_CARET :function(D){ D.scrollToPosition()},
	SHOW_COLUMNS:function(){ this.setAttribute('columns')},
	SHOW_INVISIBLES :function(D){ this.setAttribute('whiteSpaces')},
	SHOW_LINES:function(){ this.setAttribute('lines')},
	SOFT_TAB:function(){ this.setAttribute('softTab')},
	ZOOM_IN :function(D){
		D.setAttribute( 'fontSize', ( parseInt(D.sFontSize)+2 ) +'px' )
		},
	ZOOM_OUT :function(D){
		var n = parseInt( D.sFontSize )-2
		if( n > 0 ) D.setAttribute( 'fontSize', n+'px' )
		},

	CHAR_LEFT :function(D,C,S,T,V){
		if( ! C.state ) this.execCommand('LINE_UP')
		else if( S && S.exist()){
			var n = S.get().start
			if( n!=null ){
				S.collapse()
				C.setIndex( n )
				this.eTextarea.focus()
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
	CHAR_RIGHT :function(D,C,S,T,V){
		if( ! C.state ) this.execCommand('LINE_DOWN')
		else if( S && S.exist()){
			var n = S.end
			if( n!=null ){
				S.collapse()
				C.setIndex( n )
				this.eTextarea.focus()
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
	DOCUMENT_END :function(D,C,S){
		if( S ) S.collapse()
		C.setIndex( this.getContents().length )
		},
	DOCUMENT_START :function(D,C,S){
		if( S ) S.collapse()
		C.setIndex( 0 )
		},
	LINE_DOWN :function(D,C,S,T,V){
		var CP=C.position
		C.setPosition({ col:CP.col, viewLine:V.getLine( V.getClosestLine( 'bottom', CP.line ))})
		if( S && S.exist()) S.collapse()
		D.scrollToPosition()
		},
	LINE_END :function(D,C,S){
		if( ! C.state ) this.execCommand('DOCUMENT_END')
		else{
			if( S ) S.collapse()
			var n = C.position.line
			C.setPosition({ line:n, col:D.oPositions.getColumnMax( n )+1 })
			D.scrollToPosition()
			}
		},
	LINE_SCROLL_DOWN :function(D,C,S,T,V){
		if( V.nLineStart+2 > C.position.line ) this.execCommand('LINE_DOWN')
		D.oTextZoneControl.scrollBy( D.oCharacter.nHeight )
		},
	LINE_SCROLL_UP :function(D,C,S,T,V){
		if( V.nLineEnd-2 < C.position.line ) this.execCommand('LINE_UP')
		D.oTextZoneControl.scrollBy( -D.oCharacter.nHeight )
		},
	LINE_START :function(D,C,S){
		if( ! C.state ) this.execCommand('DOCUMENT_START')
		else{
			if( S ) S.collapse()
			C.setPosition({ line:C.position.line, col:1 })
			D.scrollToPosition()
			}
		},
	LINE_UP :function(D,C,S,T,V){
		var CP=C.position
		C.setPosition({ col:CP.col, viewLine:V.getLine( V.getClosestLine( 'top', CP.line ))})
		if( S && S.exist()) S.collapse()
		D.scrollToPosition()
		},
	PAGE_DOWN :function(D,C,S,T,V){
		var CP=C.position
		, nCharHeight = D.oCharacter.nHeight 
		, nLinesNumber = parseInt( this.nTextZoneHeight/nCharHeight )-1
		, nLine = V.getLinePlusPlus( CP.line, nLinesNumber, 'getviewline' )
		D.oTextZoneControl.scrollBy( nLinesNumber*nCharHeight )
		if( S ) S.collapse()
		C.setPosition({ col:CP.col, viewLine:nLine })
		},
	PAGE_UP :function(D,C,S,T,V){
		var CP=C.position
		, nCharHeight = D.oCharacter.nHeight 
		, nLinesNumber = parseInt( this.nTextZoneHeight/nCharHeight )-1
		, nLine = V.getLinePlusPlus( CP.line, -nLinesNumber, 'getviewline' )
		if( nLine < 1 ) nLine = 1
		D.oTextZoneControl.scrollBy( -nLinesNumber*nCharHeight )
		if( S ) S.collapse()
		C.setPosition({ col:CP.col, viewLine:nLine })
		},
	WORD_LEFT :function(D,C,S,T){
		if( ! C.state ) this.execCommand('LINE_UP')
		else if( S && S.exist()) this.execCommand('CHAR_LEFT')
		else{
			// déplacement mot par mot
			var n = C.position.index
			, oWord = T.getWordPositionAt( n, 'spaceRight' )
			C.setIndex( n > oWord.start ? oWord.start : oWord.previous )
			}
		},
	WORD_LEFT_END: null,
	WORD_RIGHT :function(D,C,S,T){
		if( ! C.state ) this.execCommand('LINE_DOWN')
		else if( S && S.exist()) this.execCommand('CHAR_RIGHT')
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