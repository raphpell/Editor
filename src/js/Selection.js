Editor.addModule('Selection',(function(){
	var S =function( D ){
		this.oDocument = D
		var E=D.oEditor, S=this, C=D.oCaret, P=D.oPositions

		// Restaure le défilement automatique 
		var oStart = false
		var nScrollInterval
		// Ajoute le triple clique
		var timer, timeout = 400, oWord
		var _refreshSelection = ()=>{ if( S.exist()) S.set( S.start, S.end ) }

		Events.add(
			D.oView,
				'hide', _refreshSelection,
				'show', _refreshSelection,
			D.oCharacter, 'sizechange', _refreshSelection,
			S, 'change', ()=>{ if( E.onselectionchange ) E.onselectionchange( S )},
			document,
				// Initialisation du glissé voir Editor.prototype.placeHandle
				// Initialise la sélection
				'mousedown', ( evt )=>{
					if( D.elementInContents( Events.element( evt ))){
						oStart = P.getFromEvent( evt )
						S.bMouseSelection = true
						if( S.includesIndex( oStart.index )){
							oStart = null
							S.bMouseSelection = false
							} else if( ! Keyboard.shift ) S.start = S.end = null
						}
					},
				// Restaure le DÉFILEMENT AUTOMATIQUE lors d'une sélection
				'mousemove', ( evt )=>{
					if( oStart || D.oGutter.sLineSelected || S.bDragging ){
						var e = D.eTZC 
						var oMouse = Mouse.position( evt )
						var oTag = Tag.cotes( e )
						var fScroll =function( sAttr, nAdded ){
							var oChrono = new Chrono
							clearInterval( nScrollInterval )
							e[sAttr] += nAdded
							nScrollInterval = setInterval( function(){ e[sAttr] += parseInt( nAdded*2*oChrono.stop()/100 ) }, 50 )
							}

						var n = D.oCharacter.nWidth
						if( oMouse.left > oTag.left + oTag.width ) fScroll( 'scrollLeft', n )
						else if( oMouse.left < oTag.left ) fScroll( 'scrollLeft', -n )
						else clearInterval( nScrollInterval )

						var n = parseInt( D.oCharacter.nHeight/2)
						if( oMouse.top > oTag.top + oTag.height ) fScroll( 'scrollTop', n )
						else if( oMouse.top < oTag.top )fScroll( 'scrollTop', -n ) 
						}
					},
				// Etend la sélection
				'mousemove', ( evt )=>{
					if( oStart ){
						var o = P.getFromEvent( evt )
						C.setIndex( o.index )
						S.addRangeFromPosition( oStart, o )
						}
					else if( S.exist() && ! S.bDragging ){
						var o = P.getFromEvent( evt )
						Tag.className( D.eTZ, 'selectionHover', o && S.includesIndex( o.index ) ? 'add' : 'delete' )
						}
					},
				// Glisse la sélection
				'mousemove', ( evt )=>{
					if( S.bDragging ) C.setPosition( P.getFromEvent( evt ))
					},
				// Finalise la sélection
				'mouseup', ( evt )=>{
					clearInterval( nScrollInterval )
					if( S.start==S.end || ! oStart )
							; // CONFLICT D&D // E.placeHandle( evt )
					oStart = false
					S.bMouseSelection = false
					},
				// Finalise le glissé
				'mouseup', ( evt )=>{
					if( S.bDragging ){
						var o = P.getFromEvent( evt )
						, nIndex = o.index
						, s = S.cloneContents()
						, n = S.start
						, b1 = nIndex < n
						, b2 = nIndex > n+s.length
						if( o && ( b1 || b2 )){
							var sAction = Editor.getUniqueId( 'SELECTION_D&D' )
							var fHistory =function( sCallback, start, end ){
								return Editor.addInHistory.call( E, sAction, sCallback, start, end )
								}
							fHistory( 'Undo', n, n + s.length )
							S.replace( '', true, sAction )
							// insertion avant la sélection
							if( b1 ){
								C.setIndex( nIndex )
								C.insert( s, true, sAction )
								fHistory( 'Redo', nIndex, nIndex + s.length )()
								}
							// insertion après la sélection
							else if( b2 ){
								C.setIndex( nIndex-s.length )
								C.insert( s, true, sAction )
								fHistory( 'Redo', nIndex - s.length, nIndex )()
								}
							}
						else {
							S.collapse()
							}
						S.bDragging = null
						var o = P.getFromEvent( evt )
						Tag.className( D.eTZ, 'selectionHover', o && S.includesIndex( o.index ) ? 'add' : 'delete' )
						Tag.className( D.eTZ, 'drag', 'delete' )
						Tag.className( D.eCaret, 'drag', 'delete' )
						}
					},
			D.eTZC,
				// Ajoute le TRIPLE CLIQUE + Sélectionne un 'mot'
				'dblclick', ( evt )=>{
					timer = null
					var e = Events.element( evt )
					if( D.elementInContents( e ) || e==D.eCaret ){
						oWord = D.oSource.getWordPositionAt( P.getFromEvent( evt ).index )
						S.set( oWord.start, oWord.end )
						Tag.className( D.eTZ, 'selectionHover', 'add' )
						C.setIndex( oWord.end )
						E.focus()
						timer = setTimeout(function(){ timer = null; }, timeout )
						}
					},
				// TRIPLE CLIQUE = Sélectionne la ligne
				'click', ( evt )=>{
					if( timer && D.elementInContents( Events.element( evt ))){
						S.set( oWord.start, oWord.end )
						S.expand('line')
						C.setIndex( S.end )
						E.focus()
						}
					}
			)
		S.showInfo()
		}
	S.prototype ={
		bShowInfo: true,
		start: null,
		end: null,
		onchange :function(){},

		exist :function(){
			return this.start!=null && this.end!=null && this.start!=this.end
			},
		includesIndex :function( n ){
			return this.exist() ? ( this.start<=n && n<this.end ) : false
			},
		showInfo :function(){
			var St=this.oDocument.oEditor.oStatus
			if( this.bShowInfo && St ) St.setSlot( 1, 'Sel:'+(this.end-this.start))
			},
		addRangeFromPosition :function( oStart, oEnd, bWithoutFlow ){
			if( ! oEnd ) return ;
			// if( oStart.index == oEnd.index ) return this.start = this.end = null
			var nCurrentLine = oEnd.line
			if( oStart.index > oEnd.index ){
				var tmp = oStart
				oStart = oEnd
				oEnd = tmp
				}
			this.start = oStart.index
			this.end = oEnd.index

			if( bWithoutFlow ) return this.clearLayout()
			
			var oOldStart = this.oStart
			var oOldEnd = this.oEnd
			this.oStart = oStart
			this.oEnd = oEnd
			this.showInfo()
			
			var D=this.oDocument, W=D.oPositions, T=D.oSource, V=D.oView
			var eParent = this.oDocument.eSelections
			eParent.style.marginLeft = D.Padding.get('left')+'px'
			var eFragment = null
			var oChar = this.oDocument.oCharacter
			var nCharWidth = oChar.nWidth
			var nCharHeight = oChar.nHeight
			
			this.createNodes =function( oStart, oEnd ){
				var eFragment = document.createDocumentFragment()
				var b = V.haveHiddenRange()
				for( var i=oStart.line; i<=oEnd.line; i++ ){
					if( b && ! in_array( i, V.aVisibleLines )) continue ;
					var nColumns = W.getColumnMax( i )
					var left=0, width=0
					if( i==oStart.line && i==oEnd.line ){
						left = (oStart.col-1)*nCharWidth 
						width = (oEnd.col - oStart.col)*nCharWidth
						}
					else if( i==oStart.line ){
						left = (oStart.col-1)*nCharWidth
						width = (nColumns - oStart.col+1)*nCharWidth
						}
					else if( i==oEnd.line ){
						width = (oEnd.col-1)*nCharWidth
						}
					else{
						width = nColumns*nCharWidth		//  + nCharWidth
						}
					// alert( i +'\n'+ V.getLine(i))
					var e = Tag( 'DT', {
						innerHTML: '&nbsp;',
						className: 'selected',
						style:{
							left: left +'px',
							top: (V.getLine(i)-1)*nCharHeight +'px',
							width: width +'px'
							}
						})
					if( i==nCurrentLine ) e.className = ''
					eFragment.appendChild( e )
					}
				return eFragment
				}

			// OPTIMISATION
			/*
			if( this.bMouseSelection && oOldStart!=undefined && oOldEnd!=undefined && oStart.line != oEnd.line ){
				if( oStart.index==oOldStart.index ){
					if( oEnd.index <= oOldEnd.index ){ // Supps + ajout
						var a = eParent.childNodes
						for( var i=a.length-1; i>=0; i-- )
							if( parseInt( a[i].style.top ) >= (oEnd.line-1)*nCharHeight )
								eParent.removeChild( a[i])
						var oPos = W.getFromIndex( T.getLine( oEnd.line ).index )
						eFragment = this.createNodes( oPos, oEnd )
						}
					if( oEnd.index > oOldEnd.index ) // 1 supp + ajouts
						eFragment = this.createNodes( oOldEnd, oEnd )
				}else if( oEnd.index==oOldEnd.index ){
					if( oStart.index < oOldStart.index ) // 1 supp + ajouts
						eFragment = this.createNodes( oStart, oOldStart )
					if( oStart.index >= oOldStart.index ){ // Supps + ajout
						var a = eParent.childNodes
						for( var i=a.length-1; i>=0; i-- )
							if( parseInt( a[i].style.top ) <= (oStart.line-1)*nCharHeight )
								eParent.removeChild( a[i])
						var sLine = T.getLine( oStart.line )
						var oPos = W.getFromIndex( sLine.index+sLine.length-1 )
						eFragment = this.createNodes( oStart, oPos )
						}
					}
				}
			*/
			if( ! eFragment ){
				this.clearLayout()
				eFragment = this.createNodes( oStart, oEnd )
				}

			if( eFragment ) eParent.appendChild( eFragment )
			this.oDocument.oEditor.focus()
			this.updateClipBoard()
			this.onchange()
			},
		clearLayout :function(){
			this.oDocument.eSelections.innerHTML = ''
			this.showInfo()
			},
		updateClipBoard :function(){
			var s = this.cloneContents()
			if( ! s ) return this.oDocument.oEditor.eTextarea.focus()
			var e = this.oDocument.oEditor.eClipboard
			e.value = s
			e.focus()
			if( e.setSelectionRange ){
				e.setSelectionRange( 0, e.value.length )
			} else if( e.createTextRange ){ 
				var o = e.createTextRange()
				o.collapse( true )
				o.moveEnd( 'character', e.value.length )
				o.moveStart( 'character', 0 )
				o.select()
				return o
				}
			},
		collapse :function(){
			this.start = this.end = null
			this.oStart = this.oEnd = null
			this.clearLayout()
			},
		get :function(){
			return { start:this.start, end:this.end }
			},
		set :function( nStart, nEnd, bWithoutFlow ){
			if( nStart > nEnd ){
				var tmp = nStart
				nStart = nEnd
				nEnd = tmp
				}
			var D = this.oDocument
			nStart = nStart>0 ?nStart :0
			nEnd = Math.min( nEnd, D.oEditor.getContents().length )
			if( bWithoutFlow ) this.addRangeFromPosition( {index:nStart}, {index:nEnd}, true )
			else{
				var W = D.oPositions
				this.addRangeFromPosition(
					W.getFromIndex( nStart ),
					W.getFromIndex( nEnd )
					)
				}
			return this
			},
		setIndex :function( nIndex ){
			var o = this.oDocument.oPositions.getFromIndex( nIndex )
			this.addRangeFromPosition( o, o, true )
			return this
			},
		expand :function( sType, m ){
			var D=this.oDocument, T=D.oSource, V=D.oView, C=D.oCaret
			switch( sType ){
				case 'all':
					this.set( 0, T.getValue().length )
					break;
				case 'lines':
					if( m ){
						var S=this, CP=C.position
						var nLine = V.getLinePlusPlus( CP.line, m )
						nLine = Math.min( Math.max( 1, nLine ), T.nLines )
						var n1 = D.oPositions.getIndex( nLine, CP.col )
						, n2 = ! S.exist()
								? CP.index
								: CP.index==S.start
									? S.end
									: S.start
						S.set( n1, n2 )
						C.setIndex( n1 )
						break;
						}
				case 'line':
				default:
					if( this.exist()){
						var sEndLine = T.lineAt( this.end )
						, nStart = T.lineAt( this.start ).index
						, nEnd = sEndLine.index + sEndLine.length
						}
					else{
						var sLine = T.lineAt( C.position.index )
						, nStart = sLine.index
						, nEnd = sLine.index + sLine.length
						}
					this.set( nStart, nEnd-(sType=='line'?0:1))
					C.setIndex( nEnd )
				}
			},
		cloneContents :function(){
			var s = this.oDocument.oSource.getValue()
			return s.substring( this.start, this.end )
			},
		replace :function( sAdded, bWithoutFlow, sAction ){
			var s = sAdded || ''
			if( this.exist()){
				var n = this.start
				this.oDocument.updateContents({
					start: n,
					added: s,
					deleted: this.cloneContents(),
					action: sAction
					})
				this.set( n, n+s.length, bWithoutFlow )
				// NON : this.oDocument.oEditor.oCaret.setIndex( n + sAdded.length )
				}
			return this
			},
		remove :function( bWithoutFlow, sAction ){
			var D=this.oDocument
			if( this.exist()){
				this.replace( '', bWithoutFlow, sAction )
				D.oCaret.setIndex( this.start ) // OUI
				D.oEditor.focus()
				return true
				}
			return false
			}
		}

	var newinstance =function( D ){
		if( D.oSelection ) D.oSelection.collapse()
		D.oSelection = new S(D)
		}
	// Ajout automatique d'une instance à la création d'un document
	Events.add( Editor.prototype, 'documentinit', newinstance )
	// Ajoute une instance à tous les documents déjà existant
	Editor.mapDocuments( newinstance )
	// Active la possibilité d'éditer les documents
	Editor.Modules.Selection = true
	var s='onContentEditableChange'
	Editor.mapEditors( function(E){ if( E[s]) E[s]()})
	
	var fH=Editor.addInHistory
	  , fI=Editor.getUniqueId
	Editor.extend( 'Commands', {
		BACK_TAB :(E,D,C,S,T)=>{ // TODO : new RegExp (  '^(?:\t| {1,'+ D.nTabSize +'})', 'gim' )
			var CP=C.position
			, sAction = fI('OUTDENT')
			if( S.exist()){
				S.expand()
				S.replace( str_replace( /^(?:\t)/gim, '', S.cloneContents()), false, sAction )
				C.setIndex( S.start )
				}
			else{
				var sLine = T.lineAt( CP.index )
				var a = sLine.match( /^(?:\t)+/g )
				var nWhiteSpacesEnd = sLine.index + ( a ? a[0].length : 0 )
				var n = CP.col-1
				var nTabSize = D.oTabulation.size
				if( CP.index <= nWhiteSpacesEnd ){
					S.set( CP.index, CP.index+1 )
					S.expand()
					S.replace( str_replace( /^(?:\t)/gim, '', S.cloneContents()), false, sAction )
					S.collapse()
					}
				// TODO = le curseur se positionne sur des positions ne correspondant pas à un index !
				n = n % nTabSize == 0 ? n - nTabSize : n - n % nTabSize
				if( n < 0 ) n = 0
				C.setPosition({ line:CP.line, col:n+1 })
				}
			},
		CHAR_LEFT_EXTEND :(E,D,C,S,T,V)=>{
			var nS = C.position.index, nE = nS-1
			if( nS<=0 ) return ;
			if( C.setIndex( nE )){
				var sLine = T.getLine( V.getClosestLine( 'top', C.position.line ))
				nE = sLine.index + sLine.length - 1
				C.setIndex( nE )
				}
			if( S ){
				if( ! S.exist()) S.set( nE, nS )
				else if( S.start==nS ) S.set( nE, S.end )
				else if( S.end==nS ) S.set( S.start, nE )
				}
			},
		CHAR_RIGHT_EXTEND :(E,D,C,S,T,V)=>{
			var nS = C.position.index, nE = nS+1
			if( nS >= T.getValue().length ) return ;
			if( C.setIndex( nE )){
				var sLine = T.getLine( V.getClosestLine( 'bottom', C.position.line ))
				nE = sLine.index
				C.setIndex( nE )
				}
			if( S ){
				if( ! S.exist()) S.set( nS, nE )
				else if( S.end==nS ) S.set( S.start, nE )
				else if( S.start==nS ) S.set( nE, S.end )
				}
			},
		CLEAR :(E,D,C,S)=>{
			if( S.exist()) S.remove( true )
			else{
				var n = C.position.index
				D.updateContents({ start:n, deleted:D.oSource.charAt(n) })
				}
			},
		COMMENT_BLOCK :(E,D,C,S)=>{
			var CP=C.position
			, sAction = fI('COMMENT_BLOCK')
			if( S && S.exist()){
				fH.call( E, sAction, 'Undo', S.start, S.end, CP.index )
				var s = '/* '+ S.cloneContents() +' */'
				, i = S.start==CP.index ? S.start+3 : null
				S.replace( s, true, sAction )
				fH.call( E, sAction, 'Redo', S.start+3, S.start+s.length-3, i||S.start+s.length-3 )()
				}
			else{
				fH.call( E, sAction, 'Undo', null, null, CP.index )
				var s = '/*  */'
				C.insert( s, true, sAction )
				fH.call( E, sAction, 'Redo', null, null, CP.index + parseInt( s.length/2 ))()
				}
			},
		COMMENT_LINE :(E,D,C,S,T,V)=>{
			var CP=C.position
			, sAction = fI('COMMENT_LINE')
			, sComment = '// ' 
			if( S.exist()){
				fH.call( E, sAction, 'Undo', S.start, S.end, CP.index )
				var sLine = T.lineAt( S.end )
				S.set( S.start, sLine.index+sLine.length-1 )
				var s = S.cloneContents()
				, i = S.start==CP.index ? S.start : null
				s = sComment + s.split( T.sNewLine ).join( T.sNewLine + sComment )
				S.replace( s, true, sAction )
				fH.call( E, sAction, 'Redo', S.start, S.start+s.length, i||S.start+s.length )()
			}else{
				fH.call( E, sAction, 'Undo', null, null, CP.index )
				var sLine = T.lineAt( CP.index )
				S.set( CP.index, sLine.index+sLine.length-1 )
				S.replace( sComment + S.cloneContents(), true, sAction )
				fH.call( E, sAction, 'Redo', null, null, CP.index + sComment.length )()
				}
			},
		DEL_LINE_LEFT :(E,D,C,S,T)=>{
			var CP=C.position
			, n=CP.index
			, bRestoreSelection = S.exist() && n==S.start
			, nLineStart = T.getLine( CP.line ).index
			if( bRestoreSelection ){
				var nDiff= n-nLineStart
				,nStart=S.start-nDiff
				,nEnd=S.end-nDiff
				}
			S.set( nLineStart, n, true )
			S.remove( true, fI('DEL_LINE_LEFT'))
			if( bRestoreSelection ) S.set( nStart, nEnd )
			},
		DEL_LINE_RIGHT :(E,D,C,S,T)=>{
			var CP=C.position
			, n=CP.index
			, bRestoreSelection = S.exist() && n==S.end
			, sLine = T.getLine( CP.line )
			if( bRestoreSelection ){
				var nStart=S.start, nEnd=S.end
				}
			S.set( n, sLine.index + sLine.length - 1, true )
			S.remove( true, fI('DEL_LINE_RIGHT'))
			if( bRestoreSelection ) S.set( nStart, nEnd )
			},
		DEL_WORD_LEFT :(E,D,C,S,T)=>{
			var CP=C.position
			, n=CP.index
			, bRestoreSelection = S.exist() && n==S.start
			, o = T.getWordPositionAt( n )
			if( bRestoreSelection ){
				var nStart=S.start ,nEnd=S.end
				}
			var nDiff = 0
			if( o.start != n ){
				nDiff = n - o.start
				S.set( o.start, n, true )
				}
			else{
				nDiff = n-o.previous
				S.set( o.previous, n, true )
				}
			S.remove( true, fI('DEL_WORD_LEFT'))
			if( bRestoreSelection ) S.set( nStart-nDiff, nEnd-nDiff )
			},
		DEL_WORD_RIGHT :(E,D,C,S,T)=>{
			var CP=C.position
			, n=CP.index
			, bRestoreSelection = S.exist() && n==S.end
			, o = T.getWordPositionAt( n )
			if( bRestoreSelection ){
				var nStart=S.start, nEnd=S.end
				}
			S.set( n, o.end, true )
			S.remove( true, fI('DEL_WORD_RIGHT'))
			if( bRestoreSelection ) S.set( nStart, nEnd )
			},
		DELETE_BACK :(E,D,C,S,T,V)=>{
			if( S.exist()) S.remove( true )
			else{
				var n = C.position.index
				if( n > 0 ){
					D.updateContents({ start:n-1, deleted:D.oSource.charAt(n-1) })
					C.setIndex( n-1 )
					}
				}
			},
		DOCUMENT_END_EXTEND :(E,D,C,S)=>{
			var n=E.getContents().length
			, i=C.position.index
			if( S.exist() && S.end!=n )
				C.setIndex( i = ( i==S.start ? S.end : S.start ))
			C.setIndex( S.end!=n || i==S.start ? n : S.start )
			if( S.end!=n ) S.set( i, n )
			D.scrollToPosition()
			},
		DOCUMENT_START_EXTEND :(E,D,C,S)=>{
			var i=C.position.index
			if( S.exist() && S.start!=0 )
				C.setIndex( i = ( i==S.start ? S.end : S.start ))
			C.setIndex( S.start!=0 || i==S.end ? 0 : S.end )
			if( S.start!=0 ) S.set( 0, i )
			D.scrollToPosition()
			},
		LINE_DELETE :(E,D,C,S,T)=>{
			S.expand('line')
			S.replace( '', false, fI('LINE_DELETE'))
			C.setIndex( S.start )
			},
		LINE_DOWN_EXTEND :(E,D,C,S)=> S.expand( 'lines',+1),
		LINE_END_EXTEND :(E,D,C,S,T)=>{
			var CP=C.position
			, sLine = T.getLine( CP.line )
			, n = sLine.index + sLine.length - ( sLine.charAt( sLine.length-1 )==T.sNewLine ? 1 : 0 )
			if( ! S.exist()) S.set( CP.index, n )
			else if( CP.index==S.start ) S.set( n, S.end )
			else if( CP.index==S.end ) S.set( S.start, n )
			C.setIndex( n )
			},
		LINE_START_EXTEND :(E,D,C,S,T)=>{
			var CP=C.position
			, sLine = T.getLine( CP.line )
			, n1 = sLine.index
			, a = sLine.match( /^\s+/ )
			, n2 = sLine.index + ( a ? a[0].length : 0 )
			, n = CP.index==n2 ? n1 : n2
			if( ! S.exist()) S.set( n, CP.index )
			else if( CP.index==S.start ) S.set( n, S.end )
			else if( CP.index==S.end ) S.set( S.start, n )
			C.setIndex( n )
			},
		LINE_TRANSPOSE :(E,D,C,S,T)=>{
			var CP=C.position
			if( S.exist()) S.collapse()
			var sCurrent = T.lineAt( CP.index )
			if( sCurrent.line > 1 ){
				var sPrevious = T.getLine( sCurrent.line-1 )
				var nIndex = sPrevious.index + sCurrent.length + 1
				S.set( sPrevious.index, sCurrent.index+sCurrent.length )
				if( sCurrent.line==T.nLines ){
					sPrevious = sPrevious.slice( 0, -1 )
					sCurrent += T.sNewLine
					}
				S.replace( sCurrent + sPrevious, true, fI('LINE_TRANSPOSE'))
				S.collapse()
				C.setIndex( nIndex )
				}
			},
		LINE_UP_EXTEND :(E,D,C,S)=> S.expand( 'lines',-1),
		LINES_CLIMB_DOWN :(E,D,C,S,T)=>{
			var CP=C.position
			var sAction = fI('LINES_CLIMB_DOWN')
			if( ! S.exist()) S.expand()
			var n = T.lineNumberAt( S.end )
			if( n < T.nLines ){
				S.expand()
				fH.call( E, sAction, 'Undo', S.start, S.end+1, S.start )()
				var s = S.cloneContents()
				, sLine = T.getLine( n + 1 )
				, n = sLine.index
				, b = sLine.line==T.nLines?1:0
				, nStart= n - s.length + sLine.length + b
				, nEnd= nStart + s.length - 1 + b
				if( b ){
					s = s.slice( 0, -1 )
					sLine += T.sNewLine
					}
				S.set( S.start, n + sLine.length, true )
				S.replace( sLine + s, true, sAction )
				fH.call( E, sAction, 'Redo', nStart, nEnd, nStart )()
				}
			},
		LINES_CLIMB_UP :(E,D,C,S,T)=>{
			var CP=C.position
			var sAction = fI('LINES_CLIMB_UP')
			if( ! S.exist()) S.expand()
			var n = T.lineNumberAt( S.start )
			if( n > 1 ){
				S.expand()
				fH.call( E, sAction, 'Undo', S.start, S.end+1, S.start )()
				var s = S.cloneContents()
				var sLine = T.getLine( n-1 )
				var b = T.lineNumberAt( S.end-1 )==T.nLines?1:0
				S.set( sLine.index, S.end, true )
				var nStart= sLine.index
				, nEnd= nStart + s.length - 1 + b
				, nIndex= nStart
				if( b ) sLine = T.sNewLine + sLine.slice( 0, -1 )
				S.replace( s + sLine, true, sAction )
				fH.call( E, sAction, 'Redo',  nStart, nEnd, nIndex )()
				}
			},
		LINES_JOIN :(E,D,C,S,T)=>{
			var CP=C.position
			if( S.exist()){
				var sAction = fI('LINES_JOIN')
				var s = S.cloneContents()
				fH.call( E, sAction, 'Undo', S.start, S.end, CP.index )()
				var i = S.start==CP.index ? S.start : null
				s = s.split( T.sNewLine ).join( '' )
				S.replace( s, true, sAction )
				fH.call( E, sAction, 'Redo', S.start, S.start+s.length, i||S.start+s.length )()
				}
			},
		LOWERCASE :(E,D,C,S)=>{
			if( S.exist()) S.replace( S.cloneContents().toLowerCase(), false, fI('LOWERCASE'))
			},
		NEW_LINE :(E,D,C,S,T)=>{
			var sAction = fI('ENTER')
			, s = T.getValue().substring( T.getLine( C.position.line ).index, C.position.index )
			, a = s.match( /^([\t]+)/ )
			fH.call( E, sAction, 'Undo', S.start, S.end, C.position.index )
			if( S.exist()) S.remove( true, sAction )
			C.insert( T.sNewLine + (a?a[0]:''), false, sAction )
			fH.call( E, sAction, 'Redo', null, null, C.position.index )()
			},
		PAGE_DOWN_EXTEND :(E,D,C,S)=>{
			var CP=C.position
			, nCharHeight = D.oCharacter.nHeight 
			, nLinesNumber = parseInt( E.nTextZoneHeight/nCharHeight )-1
			D.oTextZoneControl.scrollBy( nLinesNumber*nCharHeight )
			S.expand( 'lines', +nLinesNumber )
			},
		PAGE_UP_EXTEND :(E,D,C,S)=>{
			var nCharHeight = D.oCharacter.nHeight 
			, nLinesNumber = parseInt( E.nTextZoneHeight/nCharHeight )-1
			D.oTextZoneControl.scrollBy( -nLinesNumber*nCharHeight )
			S.expand( 'lines', -nLinesNumber )
			},
		SELECT_ALL :(E,D,C,S,T)=>{
			C.setIndex( T.getValue().length )
			S.expand('all')
			},
		SELECTION_DUPLICATE :(E,D,C,S,T)=>{
			var i = C.position.index
			var sAction = fI('DUPLICATE')
			if( S.exist()){ // duplique la sélection
				var s = S.cloneContents()
				S.replace( s+s, false, sAction ).set( S.start, S.start+s.length )
			}else{ // duplique la ligne courante
				S.expand('line')
				var s = S.cloneContents()
				S.replace( s+s, false, sAction ).collapse()
				}
			C.setIndex( i )
			},
		SHOW_SELECTION_END :(E,D,C,S)=>{
			if( S.exist()){
				C.setIndex( S.end )
				D.scrollToPosition()
				}
			},
		SHOW_SELECTION_START :(E,D,C,S)=>{
			if( S.exist()){
				C.setIndex( S.start )
				D.scrollToPosition()
				}
			},
		TAB :(E,D,C,S)=>{// Insère une tabulation, ou indente une ou plusieurs lignes
			if( S.exist()){
				S.expand()
				S.replace( str_replace( /^/gim, "\t", S.cloneContents()), false, fI('INDENT'))
				C.setIndex( S.start )
			}else{
				var sAction = fI('INSERT_TAB')
				C.insert( "\t", false, sAction )
				fH.call( E, sAction, 'Redo', null, null, C.position.index )()
				}
			},
		UPPERCASE :(E,D,C,S)=>{
			if( S.exist()) S.replace( S.cloneContents().toUpperCase(), false, fI('UPPERCASE'))
			},
		WORD_LEFT_END_EXTEND: null,
		WORD_LEFT_EXTEND :(E,D,C,S,T)=>{// Etend la sélection à la limite de mot à gauche
			var n = C.position.index
			, oWord = T.getWordPositionAt( n, 'spaceRight' )
			, nStart = n > oWord.start ? oWord.start : oWord.previous
			if( S && S.exist()){
				if( n == S.start ) S.set( nStart, S.end )
					else S.set( S.start, nStart )
			}else{
				S.set( nStart, n )
				}
			C.setIndex( nStart )
			},
		WORD_RIGHT_END_EXTEND :(E,D,C,S,T)=>{// Etend la sélection à la limite de mot à droite
			var n = C.position.index
			, oWord = T.getWordPositionAt( n, 'spaceLeft' )
			, nEnd = n < oWord.end ? oWord.end : oWord.next
			if( S.exist()){
				if( n == S.end ) S.set( S.start, nEnd )
					else S.set( nEnd, S.end )
			}else{
				S.set( n, nEnd )
				}
			C.setIndex( nEnd )
			},
		WORD_RIGHT_EXTEND: null
		})
	Editor.extend( 'KeyBoard', {
	// EXTENSION DE LA SÉLECTION
		'CTRL+A':'SELECT_ALL',
		'CTRL+SHIFT+LEFT':'WORD_LEFT_EXTEND',
		'CTRL+SHIFT+RIGHT':'WORD_RIGHT_END_EXTEND',
		'CTRL+SHIFT+HOME':'DOCUMENT_START_EXTEND',
		'CTRL+SHIFT+END':'DOCUMENT_END_EXTEND',
		'SHIFT+LEFT':'CHAR_LEFT_EXTEND',
		'SHIFT+RIGHT':'CHAR_RIGHT_EXTEND',
		'SHIFT+DOWN':'LINE_DOWN_EXTEND',
		'SHIFT+UP':'LINE_UP_EXTEND',
		'SHIFT+HOME':'LINE_START_EXTEND',
		'SHIFT+END':'LINE_END_EXTEND',
		'SHIFT+PAGE_DOWN':'PAGE_DOWN_EXTEND',
		'SHIFT+PAGE_UP':'PAGE_UP_EXTEND',
	// SUPPRESSION
		'DELETE':'CLEAR',
		'BACKSPACE':'DELETE_BACK',
		'CTRL+BACKSPACE':'DEL_WORD_LEFT',
		'CTRL+DELETE':'DEL_WORD_RIGHT',
		'CTRL+SHIFT+BACKSPACE':'DEL_LINE_LEFT',
		'CTRL+SHIFT+DELETE':'DEL_LINE_RIGHT',
		'CTRL+L':'LINE_DELETE',
	// DÉPLACEMENT DE LIGNES
		'CTRL+T':'LINE_TRANSPOSE',
		'CTRL+SHIFT+UP':'LINES_CLIMB_UP',
		'CTRL+SHIFT+DOWN':'LINES_CLIMB_DOWN',
	// EDITION
		'CTRL+D':'SELECTION_DUPLICATE',
		// 'CTRL+I': 'LINE_SPLIT',
		'CTRL+J':'LINES_JOIN',
		'CTRL+Q':'COMMENT_LINE',
		'CTRL+U':'LOWERCASE',
		// 'CTRL+SHIFT+T': 'LINE_COPY',
		'CTRL+SHIFT+Q':'COMMENT_BLOCK',
		'CTRL+SHIFT+U':'UPPERCASE',
		'SHIFT+TAB':'BACK_TAB',
		'TAB':'TAB',
		'ENTER':'NEW_LINE',
		})

	return S
	})())