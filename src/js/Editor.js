Editor =(function(){
	var HTMLZone=(function(){
		var _toggle =function(){ this[ this.bVisible?'hide':'show' ]()}
		return{
			Caret:class{
				constructor( D ){
					this.state = -1
					this.bShowInfo = true
					this.nTime = 500
					this.e = D.eCaret
					this.oDocument = D
					this.position = { col:1, line:1, index:0 }
					Events.add(
						D.oCharacter, 'sizechange', ()=>this.refresh()
						)
					if( this.bShowInfo ) this.showInfo()
					}
				showInfo (){
					let o = this.position, St=this.oDocument.oEditor.oStatus
					if( St ) St.setSlot( 2, 'Ln:'+o.line+' Col:'+o.col+' Index:'+ o.index ) // 'VL:'+(o.viewLine||'...')
					}
				insert ( sText, bWithoutFlow, sAction ){ // sAction sert dans UndoStack (UndoRedoManager)
					if( ! sText ) return ;
					var n = this.position.index
					this.oDocument.updateContents({ start:n, added:sText, action:sAction })
					if( bWithoutFlow ) return ;
					this.setIndex( n + sText.length )
					this.setActive( true )
					}
				setActive ( m ){
					let o = this.e.style
					if( ! this.oDocument.bContentEditable ) m = false
					switch( m ){
						case true:
							this.setActive( false )
							o.display = ''
							this.nInterval = setInterval( ()=> o.display = o.display ? '' : 'none', this.nTime )
							break;
						case false:
							this.nInterval = clearInterval( this.nInterval )
							o.display = 'none'
							break;
						case null:
							this.nInterval = clearInterval( this.nInterval )
							o.display = ''
							break;
						}
					this.state = m
					}
				setIndex ( nIndex, bPreventScrolling ){ // nLine et nCol  commence à 1
					var D=this.oDocument
					, bHidden = this.setPosition( D.oPositions.getFromIndex( nIndex ))
					if( ! bPreventScrolling ) D.scrollToPosition()
					return bHidden
					}
				setPosition ( oPos ){ // ATTENTION oPos DOIT CONTENIR index QUE SI C'EST UNE VALEUR JUSTE
					let D = this.oDocument
					, mask = Bitmask( oPos.viewLine, oPos.line, oPos.col, oPos.index!=undefined )
					switch( mask.s ){
						case '1010': // la colonne est recalculée !
							oPos = D.oPositions.getFromView( oPos )
							break;
						case '0110':
							oPos.viewLine = D.oView.getLine( oPos.line )
							oPos.index = D.oPositions.getIndex( oPos.line, oPos.col )
							break;
						case '0111': // ligne caché !
						case '1111':
							break;
						default: alert( 'oCaret.setPosition: ERROR '+ mask.s )
						}
					this.position = oPos
					if( this.bShowInfo ) this.showInfo()
					if( this.onchange ) this.onchange()
					return this.refresh()
					}
				refresh (){
					let o = this.e.style
					, D=this.oDocument, V=D.oView
					, oPos = this.position
					, nLine = oPos.viewLine||( V.haveHiddenRange() ? V.aVisibleLinesFlipped[ oPos.line+1 ] : oPos.line )
					, bHidden = V.haveHiddenRange() && ! in_array( oPos.line, V.aVisibleLines )
					if( ! bHidden ){
						this.nLEnd = this.nLStart = null
						o.top = ( nLine-1 )*D.oCharacter.nHeight +'px'
						o.left = D.Padding.get('left') + parseInt( ( oPos.col-1 )*D.oCharacter.nWidth ) +'px' // Math.max( 0, )
						}
					else o.top = o.left = '-1000em'
					D.oCurrentLine.setPosition( nLine, o.top, bHidden )
					return bHidden
					}
				},
			Character:class{
				constructor( D ){
					this.sChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890/*-+."
					this.nHeight = 0
					this.nWidth = 0
					this.e = Tag( 'PRE', { className:'charSizeTest' })
					D.eTZC.appendChild( this.e )
					Events.add( this, 'sizechange', ()=>{
						this.e.innerHTML = this.sChars
						var o = Tag.dimension( this.e )
						this.nWidth = Math.round10( o.width / this.sChars.length, -2 )
						this.nHeight = o.height
						})
					}
				},
			Cols:class{
					constructor ( D ){
						this.oDocument = D
						Events.add( D, 'layout', ()=> this.refreshDimension())
						}
					refreshDimension ( evt, b ){
						var D=this.oDocument, oStyle=D.eCols.style
						b = D.bColumns = b!=undefined ? b : D.bColumns
						oStyle.display = b ? '' : 'none'
						if( b ){
							oStyle.marginLeft = D.Padding.get('left')+'px'
							var V=D.oView
							, nWidth = D.oPositions.nColumnMax // D.oPositions.getColumnMax()
							, nCols = Math.ceil( nWidth/D.oTabulation.size )
							, n = ( V.haveHiddenRange() ? V.aVisibleLines.length : D.oSource.nLines ) * D.oCharacter.nHeight
							oStyle.width = D.oTabulation.size*D.oCharacter.nWidth*nCols + "px"
							CssRules.add( '.editor DL.cols DD {'+
								'height:' + n + 'px !important;'+
								'width:' + D.oTabulation.size*D.oCharacter.nWidth + 'px !important;'+
								'}' )
							CssRules.add( '.editor DL.cols { height:' + n + 'px !important; }' )
							D.eCols = Tag.replaceHtml( D.eCols, '<dd>&nbsp;</dd>'.repeat( nCols ))
							}
						}
					},
			CurrentLine:class{
				constructor ( D, bVisible ){
					this.toggle =_toggle
					this.oDocument = D
					this.bHidden = false
					this.bVisible = true
					this.e = D.eCurrentLine
					Events.add( D, 'layout', ()=> this.refreshDimension())
					this.bVisible = ! bVisible
					this.toggle()
					}
				refreshDimension (){
					var D=this.oDocument
					this.e.style.width = D.Padding.get('left') + D.nLinesMaxWidth +'px' 
					}
				setPosition ( nLine, nTop, bLineHidden ){
					var o = this.e.style
					o.top = nTop
					if( ! this.bVisible ) return ;
					o.display = ( this.bHidden = bLineHidden ) ? 'none' : ''
					}
				hide (){ this.bVisible = !( this.e.style.display = 'none' ) }
				show (){ this.bVisible = !( this.e.style.display = '' ) }
				},
			Grip:class{
				constructor ( E, bVisible ){
					this.toggle =_toggle
					this.oEditor = E
					var eMask = Tag('DIV',{className:'fullscreen'})
					, eParent = E.eEditor
					, MP1 = null
					, oStartDim
					eParent.appendChild( this.e = Tag('DIV',{className:'grip'}))
					var bExpanded = false
					this.hide = ()=> this.bVisible = !( this.e.style.display="none" )
					this.show = ()=> this.bVisible = !( this.e.style.display="" )
					Events.add(
						this.e,
							'dblclick', ()=>{
								if( bExpanded ){
									bExpanded = false
									E.resizeTo( E.oFixedDim.width-2 +'px', E.oFixedDim.height-6 +'px' ) // TODO: supprimer "les valeurs négatives"
								}else{
									bExpanded = true
									E.fitDocument()
									}
								if( E.onresize ) E.onresize()
								},
							'mousedown', (evt)=>{
								MP1 = Mouse.position( evt )
								oStartDim = Tag.dimension( E.eEditor )
								return Events.prevent( evt )
								},
						document,
							'mousemove', (evt)=>{
								if( MP1 ){
									var MP2 = Mouse.position( evt )
									E.resizeTo(
										oStartDim.width + MP2.left - MP1.left +'px',
										oStartDim.height + MP2.top - MP1.top +'px'
										)
									}
								},
							'mouseup', ( evt )=>{
								if( MP1 ){
									oStartDim = MP1 = null
									if( E.onresize ) E.onresize()
									}
								}
						)
					this.bVisible = ! bVisible
					this.toggle()
					}
				},
			Gutter:class{
				constructor( D ){
					this.toggle = _toggle
					this.bVisible = true
					this.nStart = 0
					this.nEnd = 0
					this.nLength = 0
					this.nWidth = 0
					this.sLineSelected = ''
					
					this.e = D.eGutter
					this.oDocument = D
					this.aMark = []
					Events.preventSelection( true, this.e )
					var E=D.oEditor
					Events.add(
						this.e,
							'dblclick', (evt)=>{
								Keyboard.code(evt)
								if( ! Keyboard.ctrl ) E.execCommand( 'SELECT_ALL' )
								},
							'mousedown', (evt)=>{
								var e = Events.element( evt )
								Keyboard.code(evt)
								if( e.nodeName=="LI" ){
									var nLineNumber = parseInt( e.innerHTML )
									, sLine = D.oSource.getLine( nLineNumber )
									, S = D.oSelection
									, nIndex
									if( Keyboard.ctrl ) return this.toggleMark( e, nLineNumber )
									if( S ){
										S.collapse()
										S.set( sLine.index, sLine.index + sLine.length )
										this.sLineSelected = sLine
										nIndex = S.end 
										} else nIndex = sLine.index
									D.oCaret.setIndex( nIndex )
									E.focus()
									}
								},
						document,
							'mousemove', (evt)=>{
								if( this.sLineSelected ){
									var S=D.oSelection, C=D.oCaret
									if( S ){
										var s1 = this.sLineSelected
										var s2 = D.oSource.getLine( D.oEditor.getLine( evt ))
										if( s2 ){
											if( s2.line >= s1.line ){
												S.set( s1.index, s2.index + s2.length )
												C.setIndex( S.end )
												}
											if( s2.line < s1.line ){
												S.set( s2.index, s1.index + s1.length )
												C.setIndex( S.start )
												}
											C.setActive( true )
											}
										}
									}
								},
							'mouseup', (evt)=>{
								this.sLineSelected = false
								},
						D.eTZC, 'scroll', ()=> this.toLeft() ,
						D.oView, 'change', ()=>{
							if( D.oGutter.bVisible ) D.oGutter.refresh()
								else D.layOut('render')
							},
						D.oCharacter, 'sizechange', ()=> this.refreshWidth(),
						D, 'update', ()=>{
							var o = D.oUpdates, b
							, oD = o.oDeleted
							, oA = o.oAdded
							if( oD.text ){
								b = this.aMark[ oD.nLineStart ]
								this.aMark.splice.apply( this.aMark, [ oD.nLineStart, oD.nLineEnd-oD.nLineStart ])
								this.aMark[ oD.nLineStart ] = b
								}
							if( oA.text ) this.aMark.splice.apply( this.aMark, [ oA.nLineStart+1, 0 ].concat( Array( oA.nLineEnd-oA.nLineStart )))

							var nLength = D.oSource.nLines.toString().length
							}
						)
					}
				markLine ( n, s ){ this.aMark[n]=s||1 }
				toLeft (){
					clearTimeout( this.nTimeout )
					var D=this.oDocument
					, o = D.eGutter.firstChild.style
					, nScrollLeft = D.eTZC.scrollLeft
					if( ! o.paddingLeft ) o.paddingLeft = '0px'
					if( o.opacity=='0' || parseInt( o.paddingLeft )!=nScrollLeft ){
						this.nTimeout =setTimeout( function(){
							o.paddingLeft = nScrollLeft +'px'
							}, 100 )
						}
					}
				toggleMark ( e, nLineNumber ){
					Tag.className( e, 'mark', 'toggle' )
					this.aMark[ nLineNumber ] = Tag.className( e, 'mark' )
					}
				refreshWidth (){
					if( ! this.bVisible ) return ;
					var D=this.oDocument
					, nLength = D.oSource.nLines.toString().length
					, n = D.oCharacter.nWidth*( nLength+2)
					this.nLength = nLength
					var oStyle = this.e.firstChild.style
					oStyle.width = n+'px'
					oStyle.textIndent = D.oCharacter.nWidth*1+'px'
					n += 4
					if( this.nWidth != n ){
						D.Padding.add( 'left', n-this.nWidth )
						this.nWidth = n
						}
					}
				show (){
					if( this.bVisible ) return ;
					this.bVisible = true
					var D=this.oDocument
					this.refreshWidth()
					this.refresh()
					this.e.style.display = ''
					D.oCaret.refresh()
					if( this.onshow ) this.onshow()
					}
				hide (){
					if( ! this.bVisible ) return ;
					this.e.innerHTML = '<ul></ul>'
					this.e.style.display = 'none'
					this.bVisible = false
					var D=this.oDocument
					D.Padding.add( 'left', -this.nWidth )
					D.oCaret.refresh()
					this.nWidth = 0
					D.layOut('render')
					if( this.onhide ) this.onhide()
					}
				refresh (){
					var D=this.oDocument, V=D.oView
					if( ! V ) return
					var s='', sHtmlIn
					for(var j=0, a; a=V.aVisibleRanges[j]; j++)
						for( var i=a[0]; i<=a[1]; i++ ){
							sHtmlIn = this.aMark[i] ? ' class="mark"' : ''
							if( sHtmlIn ) sHtmlIn += this.aMark[i].constructor==String ? ' title="'+ this.aMark[i] +'"' : ''
							s += '<li'+ sHtmlIn +'>'+ i
							}
					Tag.replaceHtml( this.e.firstChild, s )
					this.e.style.height = D.oView.nLinesHeight +'px' // ! important pour tout sauf firefox...
					this.e.firstChild.style.paddingTop = V.top
					var nLength = D.oSource.nLines.toString().length
					if( this.nLength!=nLength ) this.refreshWidth()
					D.layOut('render')
					}
				},
			Lines:class{
				constructor (D){
					this.oDocument = D
					Events.add( D, 'layout', ()=>this.refreshDimension() )
					}
				refreshDimension ( evt, b ){
					var D=this.oDocument, oStyle=D.eLines.style
					b = D.bLines = b!=undefined ? b : D.bLines
					oStyle.display = b ? '' : 'none'
					if( b ){
						oStyle.marginLeft = D.Padding.get('left')+'px'
						CssRules.add( '.editor DL.lines { width:' + D.nLinesMaxWidth + 'px !important; }' )
						var V=D.oView
						, n = V.haveHiddenRange() ? V.aVisibleLines.length : D.oSource.nLines
						D.eLines = Tag.replaceHtml( D.eLines, '<dt>&nbsp;</dt>'.repeat( n ))
						}
					}
				},
			Status:class{
				constructor ( E, nSlots, bVisible ){
					this.toggle =_toggle
					this.oEditor = E
					this.nSlots = nSlots
					this.height = 0
					var e = E.eStatus
					if( e ){
						this.e = Tag.replaceHtml( e, '<DL><DT></DT>'+ '<DD></DD>'.repeat( this.nSlots ) +'</DL>&nbsp;' )
						this.aSlots = this.e.getElementsByTagName( 'DD' )
						}
					this.bVisible = ! bVisible
					this.toggle()
					Events.preventSelection( true, this.e )
					Events.add(
						this.aSlots[4], 'dblclick', ()=>{
							var D=E.oActiveDocument
							if( D ){
								var T=D.oSource
								T.sOS = { DOS:"MAC",MAC:"UNIX",UNIX:"DOS" }[T.sOS]
								T.showInfo()
								}
							}
						)
					}
				getDimension (){
					return this.height = Tag.dimension( this.e ).height + 4
					}
				hide (){
					var e=this.e, E=this.oEditor
					if( ! this.bVisible ) return;
					if( e ){
						this.bVisible = false
						e.style.display = 'none'
						E.oPadding.add( 'bottom', -this.height )
						var D = E.oActiveDocument
						if( D ) D.oTextZoneControl.refresh() 
						this.height = 0
						}
					}
				show (){
					var e=this.e, E=this.oEditor
					if( this.bVisible ) return;
					if( e ){
						this.bVisible = true
						e.style.display = ''
						E.oPadding.add( 'bottom', this.getDimension())
						var D = E.oActiveDocument
						if( D ) D.oTextZoneControl.refresh() 
						}
					}
				setSlot ( nSlot, sValue, sTitle ){
					if( this.e ){
						var e = this.aSlots[ nSlot ]
						e.innerHTML = sValue
						e.title = sTitle||''
						}
					}
				},
			TabMenu:class{
				constructor( E ){
					this.toggle =_toggle
					this.nLength = 0
					this.sCurrentDoc = false
					
					this.oEditor = E
					this.o = {}
					let e = this.eTabMenu = Tag('DIV',{ className:'tab_menu', innerHTML:'<DL></DL>' })
					, eNext
					, ePrevious
					e.appendChild( eNext = Tag('DIV',{ className:'nav next', innerHTML:'&nbsp;' }))
					e.appendChild( ePrevious = Tag('DIV',{ className:'nav previous', innerHTML:'&nbsp;' }))

					this.eTabContents = Tag('DIV',{ className:'tab_contents '+ E.id })
					E.eEditor.appendChild( this.eTabMenu )
					E.eEditor.appendChild( this.eTabContents )
					let o = this.eTabMenu.style
					o.display = 'none'
					o.top = E.oPadding.get( 'top' ) +'px'
					var nScroll=0, nLeft=0

					var nTimeout, nTime = 250
					this.clearRepeat =function(){
						clearTimeout( nTimeout )
						}
					this.next =function(){
						var eDT = e.getElementsByTagName('DT')[ nScroll++ ]
						if( eDT && eDT.nextSibling ){
							nLeft -= Tag.dimension( eDT ).width+1
							e.firstChild.style.left = nLeft +'px'
							nTimeout = setTimeout( ()=> this.next(), nTime )
							}
						else{
							nScroll--
							}
						}
					this.previous =function(){
						var eDT = e.getElementsByTagName( 'DT' )[ --nScroll ]
						if( eDT ){
							nLeft += Tag.dimension( eDT ).width+1
							e.firstChild.style.left = nLeft +'px'
							nTimeout = setTimeout( ()=> this.previous(), nTime )
							}
						else{
							nScroll++
							}
						}
					this.displayNav =function(){
						eNext.style.display =
						ePrevious.style.display = this.nLength > 1 ? '' : 'none'
						}
					Events.preventSelection( true, eNext )
					Events.preventSelection( true, ePrevious )
					Events.add(
						'mousedown',
							eNext, ()=> this.next(),
							ePrevious, ()=> this.previous(),
						'mouseup',
							eNext, ()=> this.clearRepeat(),
							ePrevious, ()=> this.clearRepeat(),
						'mouseout',
							eNext, ()=> this.clearRepeat(),
							ePrevious, ()=> this.clearRepeat(),
						this.eTabMenu,
							'click', (evt)=>{
								if( E.bPreventUserInteraction ) return;
								var e = Events.element( evt )
								if( e.nodeName=='DT' ) this.setActive( e.title )
								E.focus()
								},
							'dblclick', (evt)=>{
								if( E.bPreventUserInteraction ) return;
								var e = Events.element( evt )
								if( e.nodeName=='DT' && this.nLength>1 ) this.close( e.title )
								E.focus()
								},
						this, 'change', ()=>{}
						)
					}
				isOpened ( sDocName ){
					var a = this.o[ sDocName]
					return a && a[0].parentNode && true
					}
				open ( sDocName ){
					var E = this.oEditor
					var D = E.oDocuments[ sDocName ]
					if( ! this.o[ sDocName ]){
						this.nLength++
						this.o[ sDocName ] =[
							this.eTabMenu.firstChild.appendChild( Tag('DT',{ innerHTML: D.sFileName, title: sDocName })),
							this.eTabContents.appendChild( D.eTZC ),
							D
							]
						}
					else if( ! this.isOpened( sDocName )){
						this.eTabMenu.firstChild.appendChild( this.o[ sDocName ][0])
						this.eTabContents.appendChild( this.o[ sDocName ][1])
						this.nLength++
						}
					E.execCommand('SET_ZOOM')

					this.setActive( sDocName )
					if( ( this.nLength>1 || D && D.bTabMenu ) && ! this.bVisible ) this.show()
					this.displayNav()
					if( E.onopen ) E.onopen( sDocName )
					}
				close ( sDocName ){
					if( ! this.o[ sDocName]) return;
					var E = this.oEditor
					var eDT = this.o[ sDocName ][0]
					if( eDT.parentNode ){
						this.nLength--
						var eNeightBour = eDT.previousSibling || eDT.nextSibling
						this.eTabMenu.firstChild.removeChild( eDT )
						if( eNeightBour ) this.setActive( eNeightBour.title )
							else this.eTabContents.removeChild( this.o[ sDocName ][1] )
						//	else E.newDoc()
						}
					this.displayNav()
					if( E.onclose ) E.onclose( sDocName )
					}
				rename ( sOldName, sNewName ){
					this.o[ sNewName ] = this.o[ sOldName ]
					var eDT = this.o[ sNewName ][0]
					eDT.innerHTML = sNewName.split('/').pop()
					eDT.title = sNewName
					this.o[ sOldName ] = null
					}
				setActive ( sDocName ){
					var a
					if( ! this.isOpened( sDocName )) return;
					if( this.sCurrentDoc == sDocName ) return;
					if( this.sCurrentDoc ){
						if( a = this.o[ this.sCurrentDoc ]){
							a[1].style.display = 'none'
							Tag.className( a[0], 'current', 'delete' )
							}
						}
					if( a = this.o[ this.sCurrentDoc = sDocName ]){
						a[1].style.display = ''
						Tag.className( a[0], 'current', 'add' )
						var D = a[2]
						this.oEditor.setDocActive( D )
						}
					if( this.onchange ) this.onchange()
					}
				getDimension (){
					var o = Tag.dimension( this.eTabMenu )
					this.height = o.height + 1
					this.width = o.width
					return o
					}
				hide (){
					if( ! this.bVisible ) return ;
					var e=this.eTabMenu, E=this.oEditor, D=E.oActiveDocument
					if( e && ! e.style.display ){
						e.style.display = 'none'
						this.bVisible = false
						E.oPadding.add( 'top', -this.height )
						}
					if( D ){
						D.oTextZoneControl.refresh()
						D.refreshView()
						}
					}
				show (){
					if( this.bVisible ) return ;
					this.getDimension()
					this.oEditor.bTabMenu = 1
					var e=this.eTabMenu, E=this.oEditor, D=E.oActiveDocument, n
					if( e && e.style.display && this.nLength ){
						e.style.display = ''
						e.firstChild.style.left ='0px'
						this.bVisible = true
						E.oPadding.add( 'top', this.height )
						}
					if( D ) D.oTextZoneControl.refresh()
					}
				},
			TextZone:class{
				constructor( D ){
					Events.add( D, 'layout', this.refresh =function(){
						var o = D.eTZ.style
						o.left = D.Padding.get('left') +'px'
						o.width = D.nLinesMaxWidth +'px' 
						})
					}
				},
			TextZoneControl:class{
				constructor( D ){
					this.toggle =_toggle
					this.bVisible = false
					this.nShowMeMargin = 0
					this.oDocument = D
					this.oEditor = D.oEditor
					this.e = D.eTZC
					this.oTextZone = new HTMLZone.TextZone(D)
					this.eShowMe = Tag('DIV', { className:'showMe' })
					Events.add(
						this.e, 'scroll', ()=>{
							this.getVisibleArea()
							if( this.bVisible ) this.show()
							},
						D.oEditor, 'documentinit', ()=>{
							this.refresh()
							this.getVisibleArea()
							if( this.bVisible ) this.show()
							}
						)
					}
				refresh (){
					var E=this.oEditor, D=E.oActiveDocument
					D.eTZC.style.top = E.oPadding.get( 'top' )+2 +'px'
					D.eTZC.style.bottom = (E.oPadding.get( 'bottom' )||2) +'px'
					// 1. OUTER DIMENSION
					var o = Tag.dimension( this.e )
					E.nTextZoneHeight = o.height
					E.nTextZoneWidth = o.width
					// 2. VIEW DIMENSION ( without scrollbar )
					var e = this.eShowMe
					e.style.cssText = ''
					var o = Tag.dimension( this.e.appendChild( e ))
					E.nTextZoneViewHeight = o.height
					E.nTextZoneViewWidth = o.width
					this.getVisibleArea()
					this[ this.bVisible ? 'show' : 'hide' ]()
					}
				getVisibleArea (){
					var E = this.oEditor
					, n = this.nShowMeMargin
					, nPaddingLeft = this.oDocument.Padding.get('left')
					, nLeft = this.e.scrollLeft + nPaddingLeft
					, nTop = this.e.scrollTop
					return this.oVisibleArea ={
						left: nLeft + n,
						top: nTop + n,
						right: nLeft + E.nTextZoneViewWidth - nPaddingLeft - n,
						bottom: nTop + E.nTextZoneViewHeight - n
						}
					}
				hide (){
					this.bVisible = false
					if( this.eShowMe.parentNode )
						this.e.removeChild( this.eShowMe )
					}
				show (){
					this.bVisible = true
					var e = this.e.appendChild( this.eShowMe )
					, oStyle = e.style
					, o = this.oVisibleArea
					oStyle.left = o.left+'px'
					oStyle.top = o.top+'px'
					oStyle.width = o.right-o.left+'px'
					oStyle.height = o.bottom-o.top+'px'
					}
				scrollBy ( n, s ){
					this.e[s||'scrollTop'] += n
					}
				},
			TopMenu:class{
				constructor( E ){
					this.toggle =_toggle

					var MenuItem =function( sName, oEditor ){
						var eLI = null
						if( MenuItem.button[ sName ] != undefined ) eLI = MenuItem.createButton( oEditor, sName )
						else if( MenuItem.number[sName] != undefined ) eLI = MenuItem.createNumber( oEditor, sName )
						else if( sName!='|' && sName.charAt(1)==sName.charAt(1).toLowerCase()){
								var oConfig=Editor.oConfig[sName]
								if( oConfig ){
									var eLI = Tag( 'LI' )
									, sAttr = oConfig.type + sName
									if( oConfig.list ){ // Liste de choix
										var aList = oConfig.list.split('/')
										, eSELECT = Tag('SELECT')
										eSELECT.title = L10N[ sName ]||''
										Tag.addChildNodes( eSELECT, "option", aList, oEditor[sAttr])
										Tag.interlock( eLI, eSELECT )
										Events.add(
											eSELECT, 'change', function(){
												var D = oEditor.oActiveDocument
												if( D ) D.setAttribute(
													sName.charAt(0).toLowerCase()+sName.slice(1),
													eSELECT.value
													)
												},
											oEditor, sName+'Change', function(){
												var D = oEditor.oActiveDocument
												if( D ) eSELECT.value = D[sAttr]
												}
											)
										MenuItem[ "e" + sName ] = eSELECT
										}
									else if( oConfig.type=='b' && oConfig.command ){ // case à cocher
										var eLI = MenuItem.createButton( oEditor, oConfig.command )
										eLI[ oEditor[sAttr]?'down':'up' ]()
										Events.add(
											oEditor, sName+'Change', function(){
												var D = oEditor.oActiveDocument
												if( D ) eLI[ D[sAttr] ? 'down' : 'up' ]()
												}
											)
										}
									}
								}
						else{
							Tag.interlock( eLI = Tag("LI",{className:'separator'}), Tag( 'DIV' ))
							}
						return eLI
						}
					MenuItem.createNumber =function( oEditor, sName, sCommand ){
						var eLI = Tag( "LI" )
						Events.add( eLI, 'mousedown', function(){ oEditor.execCommand( sCommand || sName )})
						Tag.interlock(
							eLI,
							Tag("A",{ title:L10N[ sName ]||''}),
							Tag("DIV",{ style:{ backgroundPosition: "-" + MenuItem.number[sName] + "px -34px" }})
							)
						return MenuItem[ 'e'+ sName ] = eLI
						},
					MenuItem.createButton =function( oEditor, sName, sCommand ){
						var eLI = Tag( "LI" )
						, m = L10N[ sName ] // Réservé pour la traduction
						, eA = Tag("A",{ title:m||'' })
						, eDIV = Tag("DIV",{ style:{ backgroundPosition: "-" + MenuItem.button[ sName] + "px 0" }})
						, eSPAN = Tag("SPAN",{ innerHTML: m })
						, f1 =function(){ oEditor.execCommand( sCommand || sName )}
						, f2 =function( sClassName, sAction, sPosition ){
							return function(){
								var e = this.firstChild
								e.cssClass( sClassName, sAction )
								e.firstChild.style.backgroundPosition = sPosition
								}
							}
						, f3 =function( sName , n ){
							return '-'+ MenuItem.button[ sName] +'px -'+ n +'px'
							}
						/* if( Browser.isIE ) Events.add( eA, 'click', f1, 'dblclick', f1 )
							else  */Events.add( eLI, 'mousedown', f1 )
						eLI.disable =f2( "disabled",	"add", f3( sName, 17 ))
						eLI.down 	=f2( "down", 		"add", f3( sName, 17 ))
						eLI.enable 	=f2( "disabled",	"delete", f3( sName, 0 ))
						eLI.up 		=f2( "down", 		"delete", f3( sName, 0 ))
						Tag.interlock( eLI, eA, eDIV )
						MenuItem[ 'e'+ sName ] = eLI
						return eLI
						},
					MenuItem.number ={ 1:0, 2:17, 3:34, 4:51, 5:68, 6:85, 7:102, 8:119, 9:137, 0:153 }
					MenuItem.button ={
						FULLSCREEN:0,
						UNDO:17,
						REDO:34,
						DIALOG_SEARCH:51,
						DOCUMENT_NEW:68,
						DOCUMENT_SAVE:85,
						HELP:102,
						INFO:119,
						READ_ONLY_TOGGLE:137,
						HIGHLIGHT_TOGGLE:153,
						DIALOGS:170,
						TAB:187,
						BACK_TAB:204,
						ZOOM_IN:221,
						ZOOM_OUT:238,
						SHOW_INVISIBLES:255
						/* 272 289 306 323 340 357 374 391 408 */ 
						}
					MenuItem.set =function( sName, sMethod ){
						var e = MenuItem[ 'e' + sName ]
						if( e && e[ sMethod ]) e[ sMethod ]()
						}
					this.oEditor = E
					this.MenuItem = MenuItem
					this.eMenu = Tag('DIV', { className:'menu', innerHTML:"<ul></ul>" })
					var a = E.sTopMenu.split(',')
					var eUL = this.eMenu.firstChild
					for(var i=0, sItem; sItem=a[i]; i++ ){
						var eLI = MenuItem( sItem, E )
						if( eLI ) eUL.appendChild( eLI )
						}
					E.eEditor.appendChild( this.eMenu )
					this.getDimension()
					this.show()
					if( ! ( this.eMenu.firstChild.innerHTML && E.bTopMenu )) this.hide()
					}
				getDimension (){
					var o = Tag.dimension( this.eMenu )
					this.height = o.height
					this.width = o.width
					return o
					}
				hide (){
					if( ! this.bVisible ) return;
					var e=this.eMenu, E=this.oEditor, D=E.oActiveDocument
					this.bVisible = false
					e.style.display = "none"
					E.oPadding.add( 'top', -this.height )
					if( E.oTabMenu ){
						E.oTabMenu.eTabMenu.style.top = "0"
						if( D ) D.oTextZoneControl.refresh()
						}
					if( D ) D.refreshView()
					}
				show (){
					if( this.bVisible ) return;
					this.getDimension()
					var e=this.eMenu, E=this.oEditor, D=E.oActiveDocument
					this.bVisible = true
					e.style.display = ""
					E.oPadding.add( 'top', this.height )
					if( E.oTabMenu ){
						E.oTabMenu.eTabMenu.style.top = this.height+'px'
						if( D ) D.oTextZoneControl.refresh() 
						}
					}
				}
			}
		})()
	var Modules={
		Interval:(function(){
			var _oFPS={}
			, _create=function( nFps ){
				var o=_oFPS[nFps]
				var f = function(){
					var o=_oFPS[nFps], a=o.a.splice(0,o.a.length)
					while(a.length) a.shift()()
					if(o.a.length==0)_remove(nFps)
					}
				return _oFPS[nFps] = o ? o : {
					a:[],
					n: setInterval( f, parseInt(1000/nFps))
					}
				}
			, _remove=function( nFps ){
					var o=_oFPS[nFps]
					if(!o)return false
					clearInterval(o.n)
					delete _oFPS[nFps]
					return true
					}
			return {
				push :function( nFps, f ){
					return _create(nFps).a.push(f)
					},
				remove: _remove
				}
			})(),
		NewLine:(function(){
			// TODO: D.layOut need newline width
			return {
				TOKEN: 'N',
				HTML: '<i class="newline"></i>$1' //'\n' ou '\r' sera ajouté après.   \xAC
				}
			})(),
		Source:(function(){
			var T =function( D, sSource ){
				this.oDocument = D
				var sValue, aLines, oLines
				, _setValue =function( s ){
					sValue = s
					aLines = s.split( this.sNewLine )
					oLines = {}
					this.countLines()
					if( D ) this.showInfo()
					return s
					}
				this.countLines =function(){ // return n
					return this.nLines = aLines.length
					}
				this.charAt =function( nIndex ){
					return sValue.charAt( nIndex )
					},
				this.lineNumberAt =function( nIndex ){ // return n 
					return sValue.substr( 0, nIndex ).countLines()
					},
				this.lineAt =function( nIndex, sError ){ // return s.{line,index}
					nIndex = nIndex || 0
					var n = sValue.charAt( nIndex )==this.sNewLine ? -1 : 0
					var b = 0 <= nIndex && nIndex <= sValue.length
					if( ! b ){
						var s = (sError||'') + '\nErreur index: '+ nIndex +'=='+ sValue.length +" ?\nTexte source:\n"+ sValue
					//	alert( s )
						throw new Error( s )
						}
					return b
						? this.getLine( sValue.substring( 0, nIndex+1 ).split( this.sNewLine ).length + n )
						: null
					}
				this.getLine =function( n ){ // return s.{line,index}
					if( oLines[ n ]) return oLines[ n ]
					if( 1<=n && n<=aLines.length ){
						var sLine = new String ( aLines[ n-1 ] + ( n!=this.nLines ? this.sNewLine : '' ) )
						sLine.line = n
						sLine.index = aLines.slice( 0, n-1 ).join( this.sNewLine ).length + ( n > 1 ? 1 : 0 )
						return oLines[ n ] = sLine
						}
					return null
					}
				this.getLines =function( nStart, nEnd ){ // return s
					var bLast = nEnd==aLines.length
					return aLines.slice( nStart-1, nEnd ).join( this.sNewLine ) + ( bLast ? '' : this.sNewLine )
					}
				this.getValue =function( bOS ){
					return bOS ? aLines.join( T.LineBreaks[ this.sOS ]) : sValue
					}
				this.setValue =function( s ){
					this.sOS = s ? this.determineOS( s ) : "UNIX"
					// Needed to create a bridge for characters positions between String, Textarea, Caret and Selection
					if( Browser.isOpera ) s = s.toString()
					s = s.replace( /\r\n|\r|\n/g, this.sNewLine )
					return _setValue.call( this, s )
					}
				this.updateValue =function( o ){
					o.deleted = o.deleted || ''
					o.added = o.added || ''
					var nLinesOld = aLines.length
					, sLineStart = this.lineAt( o.start )
					, sLineEndDeleted = this.lineAt( o.start + o.deleted.length )
					, sNewContents = sValue.substring( 0, o.start ) + o.added + sValue.substring( o.start + o.deleted.length )
					_setValue.call( this, sNewContents )
					var sLineEndAdded = this.lineAt( o.start + o.added.length )
					, sNewLinesContents = sNewContents.substring( sLineStart.index, sLineEndAdded.index + sLineEndAdded.length )
					return {
						nIndex: o.start,
						nLinesNew: aLines.length,
						nLinesOld: nLinesOld,
						oDeleted:{
							text: o.deleted,
							nLineStart: sLineStart.line,
							nLineEnd: sLineEndDeleted.line,
							sNewContents: this.lineAt( o.start )
							},
						oAdded:{
							text: o.added,
							nLineStart: sLineStart.line,
							nLineEnd: sLineEndAdded.line,
							aNewContents: sNewLinesContents.split( this.sNewLine )
							}
						}
					}
				this.setValue( sSource || '' )
				}
			T.LineBreaks ={ DOS:"\r\n",MAC:"\r",UNIX:"\n" }
			T.oRe ={
				// \u00C0-\u00FF : lettres accentuées
				'selection': /(?:\s+|[0-9A-Za-z\u00C0-\u00FF]+|[^\s0-9A-Za-z\u00C0-\u00FF]+)/g,
				'spaceLeft': /(?:\s*(?:\w|\d)+|\s*[^\s\w\d]+|\s+)/g,
				'spaceRight': /(?:\s+|(?:\w|\d)+\s*|[^\s\w\d]+\s*)/g
				}
			T.prototype ={
				nLines: 1,
				sOS: null, // DOS, MAC, UNIX
				sNewLine: "\n", // "\n", // TODO : Must be a character :  \r or \n, caractère définissant les nouvelles lignes
				determineOS :function( s ){
					if( /\r\n/.test( s )) return 'DOS'
					if( /\r/.test( s )) return 'MAC'
					if( /\n/.test( s )) return 'UNIX'
					// Fichier sans saut de ligne !
					return 'DOS'
					},
				getWordPositionAt :function( nIndex, sType ){ // return {start,end,next,previous}
					var re = T.oRe[ sType || 'selection' ]
					var f = (nIndex)=>{
						var s = this.lineAt( nIndex )
						if( s==null ){
							return nIndex < 0
								? { start:0, end:0 } 
								: { start:nIndex, end:nIndex }
							}

						var sPrefixe = this.getLine( s.line-1 ) || ''
						, sSuffixe = this.getLine( s.line+1 ) || ''
						, n = sPrefixe.index || 0
						s = sPrefixe+s+sSuffixe
						var a = s.match( re )
						, nStart = n
						, nEnd = n
						if( a ){
							for( var i=0, ni=a.length; i<ni; i++ ){
								var sWord = a[i]
								if( nIndex < nStart + sWord.length ){
									nEnd += sWord.length
									break
									}
								else nStart = nEnd += sWord.length
								}
							return { start:nStart, end:nEnd } 
							}
						return { start:nIndex, end:nIndex }
						}
					var o = f( nIndex )
					o.previous = o.start > 0 ? f( o.start-1 ).start : 0
					o.next = f( o.end ).end
					return o // end non inclus dans le mot
					},
				showInfo :function(){
					var St=this.oDocument.oEditor.oStatus, T=this
					if( St ){
						if( T.sOS ) St.setSlot( 4, JSON.stringify( Modules.Source.LineBreaks[T.sOS]).slice(1,-1), T.sOS ) // 'Line break:' + 
						St.setSlot( 3, 'Length:'+T.getValue(T.sOS).length+' Lines:'+T.nLines )
						}
					}
				}
			return T
			})(),
		Tabulation:class{
			constructor( D ){
				this.oDocument = D
				this.bSoftTab = D.bSoftTab
				this.setMaxSize( D.nTabSize||8 )
				Events.add( D.oCharacter, 'sizechange', ()=> this.refresh() )
				}
			refresh (){
				var D = this.oDocument
				CssRules.add( '.'+ D.oEditor.id +' .tab { width:'+ D.oCharacter.nWidth*this.size +'px; }' )
				}
			setMaxSize ( n ){
				if(n<1) n=1
				this.size = n
				this.TOKEN = 'B'+'='.repeat( n-1 )
				this.refresh()
				}
			},
		View:class{
			constructor( D ){
				this.oDocument = D
				this.aVisibleLines = []
				this.aHiddenRanges = []
				this.aVisibleRanges = []
				this.aRealVisibleRanges = []
				this.bUpdateCalcul = true
				this.nLength = 0
				Events.add( D.oCharacter, 'sizechange', ()=> this.refresh() )
				}
			calculateVisibleRanges (){
				if( ! this.bUpdateCalcul ) return ;
				var aVisible=[], nLines=0, nLine =1, nLineEnd
				var _add=function( nS, nE ){
					aVisible.push([ nS, nE ])
					nLines += nE-nS+1
					}
				for(var i=0, aRange; aRange=this.aHiddenRanges[i]; i++ ){
					if( nLine < aRange[0]){
						_add( nLine, aRange[0]-1 )
						nLine =aRange[1]+1
						}
					if( nLine == aRange[0]) nLine =aRange[1]+1
					}
				if( nLine <= this.oDocument.oSource.nLines )
					_add( nLine, this.oDocument.oSource.nLines )
				this.aRealVisibleRanges = aVisible
				this.nLines = nLines
				this.bUpdateCalcul = false
				}
			getLine ( nLine ){
				if( this.haveHiddenRange()){
					var a = this.aVisibleLinesFlipped
					return a[nLine] ? parseInt(a[nLine])+1 : null
					}
				return nLine
				}
			getClosestLine ( sDirection, nLine ){
				if( this.haveHiddenRange()){
					var a = this.aVisibleLines, nPreviousLine
					for( var i=0, ni=a.length; i<ni; i++ ){
						if( a[i]>=nLine && sDirection=='top' ) return nPreviousLine||1
						if( a[i]>nLine && sDirection=='bottom' ) return a[i]
						nPreviousLine = a[i]
						}
					return a[a.length-1]
					}
				return sDirection=='top'?(nLine>2?nLine-1:1):nLine+1
				}
			getLinePlusPlus ( nLine, n, bViewLine ){
				if( this.haveHiddenRange()){
					var a = this.aVisibleLines, nTmp = 0
					switch( n<0 ){
						case true:
							for( var i=a.length-1, ni=-1; i>ni; i-- ){
								if( a[i]<nLine ) nTmp--
								if( nTmp==n ) return bViewLine ? i+1 : a[i] 
								}
							return 1
						case false:
							for( var i=0, ni=a.length; i<ni; i++ ){
								if( a[i]>nLine ) nTmp++
								if( nTmp==n ) return bViewLine ? i+1 : a[i]
								}
							return a[a.length-1]
						}
					}
				return nLine+n
				}
			haveHiddenRange (){
				return this.aHiddenRanges.length > 0
				}
			hideRange ( nLStart, nLEnd, bWithoutFlow ){
				this.bUpdateCalcul = true
				if( ! this.isHiddenRange( nLStart, nLEnd ))
					this.aHiddenRanges.push([nLStart,nLEnd])
				this.aHiddenRanges.sortBy('0')
				if( ! bWithoutFlow ){
					this.refresh()
					if( this.onhide ) this.onhide()
					}
				}
			isHiddenRange ( nLStart, nLEnd ){
				var b = false
				for(var i=0, a; a=this.aHiddenRanges[i]; i++){
					if( a[0]==nLStart && a[1]==nLEnd )
						return i+1
					if( a[0]>nLStart ) break;
					}
				return b
				}
			isLineVisible ( nLine ){
				return this.aHiddenRanges.length==0 || in_array( nLine, this.aVisibleLines )
				}
			refresh ( sAction ){
				this.aVisibleLines = []
				var aVisibleLines = []
				, D=this.oDocument, T=D.oSource
				, oUpdates = D.oUpdates
				, nLineHeight = D.oCharacter.nHeight
				, nViewHeight = D.oEditor.nTextZoneHeight + nLineHeight + 1 // +1 résoud un bug d'affichage !
				, nLength = Math.ceil( nViewHeight/nLineHeight )
				if( isNaN( nViewHeight )) return false
				if( oUpdates ){
					var oD = oUpdates.oDeleted
					if( oD.text.length ){
						for(var j=oD.nLineStart, nj=oD.nLineEnd; j<=nj; j++ )
							this.showLine( j, true )
						}
					var oA = oUpdates.oAdded
					if( oA.text.length && oA.nLineStart<oA.nLineEnd )
							this.showLine( oA.nLineStart+1, true )
					var nPlus = oUpdates.nLineShift // 
					if( nPlus ){
						this.bUpdateCalcul = true
						var nGrr = oD ? oD.nLineEnd : oA.nLineStart
						for(var i=0, ni=this.aHiddenRanges.length; i<ni; i++ ){
							var a = this.aHiddenRanges[i]
							if( a[0]>=nGrr )
								this.aHiddenRanges[i]=[ a[0]+nPlus, a[1]+nPlus ]
							}
						}
					if( this.onupdate ) this.onupdate()
					}
				// CALCUL DE LA DIMENSION DE LA VUE...
				// Comportement bloc réduit
				if( this.haveHiddenRange()){
					this.calculateVisibleRanges()
					var nLines = this.nLines
					, nLineAtTop = nLineAtBottom = null
					, bLineEndHidden = true
					, nLinesHeight = nLines * nLineHeight
					, nMaxScrollTop = nLinesHeight-nViewHeight
					, nScrollTop = Math.min( D.eTZC.scrollTop, nMaxScrollTop )
					, nViewLineStart = Math.max( 1, Math.ceil( nScrollTop / nLineHeight ))
					, nLineEnd, nLineStart
					, aVisibleRangesInView = []

					var n1=0, n2=Math.min( nLines-1, nLength-1), bSearchStart=true, bSearchEnd=true, nStart

					var f =function( a ){
						if( nStart ) nStart = a[0]
						for( var i=a[0], ni=a[1]+1; i<ni; i++ ){
							aVisibleLines.push(i)
							if( bSearchEnd ){
								if( bSearchStart ){
									n1++
									if( n1==nViewLineStart ){
										nLineAtTop = n1-1
										nLineStart = nStart = i
										bSearchStart = false
										continue;
										}
									}
								else {
									n2--
									if( n2==0 ){
										nLineAtBottom = Math.max( 0,nLines-nLineAtTop-nLength )
										nLineEnd = i
										bSearchEnd = false
										}
									}
								}
							}
						if( nStart ) aVisibleRangesInView.push([ nStart, nLineEnd || a[1]])
						if( nLineEnd ) nStart=null
						}
					for(var i=0, ni= this.aRealVisibleRanges.length; i<ni; i++ )
						f( this.aRealVisibleRanges[i])

					this.aVisibleRanges = aVisibleRangesInView
					this.aVisibleLinesFlipped = Array.flip( aVisibleLines )
					}
				// Comportement par défaut
				else{
					var nLines = T.nLines
					, nLinesHeight = nLines * nLineHeight
					, nMaxScrollTop = nLinesHeight-nViewHeight
					, nScrollTop = Math.min( D.eTZC.scrollTop, nMaxScrollTop )
					, nLineStart = Math.max( 1, Math.ceil( nScrollTop / nLineHeight ))
					, nLineEnd = Math.min( nLineStart+nLength-1, nLines )
					, nLineAtTop = nLineStart-1
					, nLineAtBottom = nLines-nLineEnd
					this.aVisibleRanges = [[nLineStart,nLineEnd]]
					this.aRealVisibleRanges = [[1,nLines]]
					}
				this.acquire({
					aVisibleLines: aVisibleLines,
					nLength: nLength,
					nLines: nLines,
					nLineAtTop: nLineAtTop,
					nLineAtBottom: nLineAtBottom,
					nLineStart: nLineStart,
					nLineEnd: nLineEnd,
					nLinesHeight: nLinesHeight,
					height: Math.min( nLength*nLineHeight, nLinesHeight ) +'px',
					top: ( nLineAtTop )*nLineHeight +'px',
					bottom: ( nLineAtBottom )*nLineHeight +'px'
					})
				if( this.onchange ) this.onchange( sAction )
				return true
				}
			showLine ( mLines, bWithoutFlow ){
				if( mLines.constructor==Number && this.isLineVisible( mLines )) return;
				this.bUpdateCalcul = true
				var aLines = to_array( mLines )
				for( var j=0, nj=aLines.length; j<nj; j++ ){
					var nLine = aLines[j]
					if( this.isLineVisible( nLine )) continue;
					for( var i=0, ni=this.aHiddenRanges.length; i<ni; i++ ){
						var a = this.aHiddenRanges[i]
						if( a[0]<=nLine && nLine<=a[1] ){
							this.aHiddenRanges.splice( i, 1 )
							;i--;ni--;
							}
						}
					}
				if( ! bWithoutFlow ){
					this.refresh()
					if( this.onshow()) this.onshow()
					}
				}
			showRange ( nLStart, nLEnd, bWithoutFlow ){
				this.bUpdateCalcul = true
				for(var i=0, a; a=this.aHiddenRanges[i]; i++){
					if( a[0]==nLStart && a[1]==nLEnd ){
						this.aHiddenRanges.splice( i, 1 )
						break;
						}
					}
				if( ! bWithoutFlow ){
					this.refresh()
					if( this.onshow ) this.onshow()
					}
				}
			},
		Positions:(function(){
			var _refreshArray =function(){
				var D=this.oDocument
				var bSearchMaxWidth = false
				if( D.oUpdates ){
					var o = D.oUpdates.oDeleted, s
					if( o.text ){
						if( o.nLineStart<=this.nColumnMaxLine && this.nColumnMaxLine<=o.nLineEnd ) bSearchMaxWidth=true
						this.a.splice( o.nLineStart, o.nLineEnd-o.nLineStart )
						s = this.replaceCharactersOfLine( str_replace( this.oSource.sNewLine, '', o.sNewContents ))
						this.a[ o.nLineStart-1 ] = s
						this.refreshColumnMax( s.length, o.nLineStart )
						}
					var o = D.oUpdates.oAdded
					if( o.text ){
						for( var i=o.nLineStart, ni=o.nLineEnd; i<ni; i++ ){
							this.a.splice( o.nLineStart-1 , 0, '' )
							}
						for( var i=o.nLineStart, ni=o.nLineEnd, j=0; i<=ni; i++, j++ ){
							s = this.replaceCharactersOfLine( o.aNewContents[j] )
							this.a[ i-1 ] = s
							this.refreshColumnMax( s.length, i )
							}
						}
					}
				else{
					var sSource = this.oSource.getValue()
					var nCacheID = D.nTabSize+D.bSoftTab+sSource
					if(nCacheID==this.nCacheID) return
					this.nCacheID = nCacheID
					this.a = sSource.split( /(?:\r\n|[\r\n\f])/ )
					for( var i=0, ni=this.a.length; i<ni; i++ )
						this.a[i] = this.replaceCharactersOfLine( this.a[i])
					this.getColumnMax()
					}
				if( bSearchMaxWidth ){
					this.nColumnMax = null
					this.getColumnMax()
					}
				}
			P =function(D){
				this.a = []
				this.oDocument = D
				this.oSource = D.oSource
				this.oTabulation = D.oTabulation
				var E = D.oEditor
				var f = ()=> _refreshArray.call( E.oActiveDocument.oPositions )
				Events.add(
					D, 'update', ()=> _refreshArray.call( this ),
					E,
						'documentinit', f,
						'TabSizeChange', f,
						'SoftTabChange', f
					)
				}
			P.prototype ={
				a: null,
				nColumnMax: null, // PRIVATE
				nColumnMaxLine: null, // PRIVATE
				replaceCharactersOfLine :function( s ){
					var o = this.oTabulation
					var nShift = 0
					sResult = str_replace(
						[ /[^\s]/g, /(?:\r\n|[\r\n\f])/g, /\t/g, /\s/g ],
						[ 'x', Modules.NewLine.TOKEN, function( sMatched, nIndex ){
							if( ! o.bSoftTab ) return o.TOKEN
							// Tabulations souples
							var n = o.size-(nIndex+nShift)%o.size
							nShift += n-1
							return o.TOKEN.slice( 0, n )
							}, '.' ],
						s
						)
					return sResult
					},
				calculateColumn :function( nIndex, oLine ){ // DEPRECATED
					var oLine = oLine || this.oSource.lineAt( nIndex, 'calculateColumn' )
					return this.replaceCharactersOfLine( oLine.substring( 0, nIndex-oLine.index )).length+1
					},
				getIndex :function( nLine, nCol ){ // return nIndex
					var a = this.a.slice( 0, nLine )
					a[ a.length-1 ] = a[ a.length-1 ].slice( 0, nCol-1 )
					return a.join('N').replace( /B=*/g, 'T' ).length
					},
				getFromEvent :function( evt ){ // return {line,viewLine,col,index} voir aussi src/js/Selection.js
					var D=this.oDocument, Ch=D.oCharacter
					, oMouse = Mouse.position( evt )
					, e = D.eTZC
					, oTag = oTag || Tag.position( e )
					return this.getFromView({
						viewLine: Math.ceil( ( oMouse.top - oTag.top + e.scrollTop ) / Ch.nHeight ),
						col: Math.round( ( oMouse.left - oTag.left + e.scrollLeft - D.Padding.get('left') ) / Ch.nWidth ) + 1
						})
					},
				getFromIndex :function( nIndex ){ // return {line,viewLine,col,index}
					var a = this.oSource.getValue().slice( 0, nIndex ).split( this.oSource.sNewLine )
					, nLine = a.length
					return {
						line: nLine,
						viewLine: this.oDocument.oView.getLine( nLine ),
						col: this.replaceCharactersOfLine( a[nLine-1]).length+1,
						index: parseInt( nIndex )
						}
					},
				getFromView :function( oPosition ){ // {viewLine,col} return {line,viewLine,col,index}
					var D=this.oDocument, V=D.oView
					, nLine = oPosition.viewLine
					, nCol = oPosition.col

					var nViewLine = nLine = Math.max( 1, Math.min( nLine, V.nLines ))
					nCol = Math.max( 1, nCol )

					if( V.haveHiddenRange()) nLine = V.aVisibleLines[ nLine-1 ]

					var sLine = this.a[ nLine-1 ]
					if( sLine!=undefined ){
						var nIndex = nCol-1
						var sChar = sLine.charAt( nIndex )
						switch( sChar ){
							case '.': case 'x': case 'B': break;
							case '=':
								var nToBegin = 1
								var nToEnd = 1
								var n = parseInt( this.oTabulation.size )
								for( var i=nIndex; sLine.charAt( --i )=="="; nToBegin++ );
								for( var i=nIndex; sLine.charAt( ++i )=="="; nToEnd++ );
								nCol = nToBegin < nToEnd ? nCol-nToBegin : nCol+nToEnd
								break;
							default:
								nCol = sLine.length+1
							}
					}else if( this.a.length ){
						nLine = this.a.length
						nCol = this.a[ nLine-1 ].length+1
					}else{
						nLine = 1
						nCol = 1
						}
					return { viewLine:nViewLine, line:nLine, col:nCol, index:this.getIndex( nLine, nCol )}
					},
				getColumnMax :function( nLine ){ // Sans nLine retourne le résultat pour la source
					if( nLine ) return this.a[nLine-1] ? this.a[nLine-1].length : 0
					var nMax = 0, nColumnMaxLine = 1
					for(var i=0, ni=this.a.length, n ; i<ni ; i++ ){
						n = this.a[i].length
						if( n > nMax ){
							nMax = n
							nColumnMaxLine = i+1
							}
						}
					this.nColumnMaxLine = nColumnMaxLine
					return this.nColumnMax = nMax
					},
				refreshColumnMax :function( nValue, nLine ){ // PRIVATE
					if( nValue > this.nColumnMax ){
						this.nColumnMax = nValue
						this.nColumnMaxLine = nLine
						}
					}
				}
			return P
			})()
		}
	var Strategy={
		Render:(function(){
			var Strategies ={
				CacheAll :(function(){
					var redraw =function(){
						var D=this, V=D.oView, sContents=''
						// 1- Récupère le contenu affiché
						for( var aj=V.aVisibleRanges, j=0, nj=aj.length; j<nj; j++ ){
							var a = aj[j]
							sContents += '<dt>'+D.aLinesBuffer.slice( a[0]-1, a[1] ).join('<dt>')
							}
						// 2- Modifie la zone texte
						var e = D.eTZ
						, oStyle = e.style
						oStyle.height = V.height
						oStyle.paddingTop = V.top
						oStyle.paddingBottom = V.bottom
						oStyle.left = D.Padding.get('left')+'px'
						D.eTZ = Tag.replaceHtml( e, sContents )
						}
					return {
						initialize :function(){
							this.aLinesBuffer = this.oSyntax.getContents()
							redraw.call( this )
							},
						editing :function(){
							var D=this, o=D.oUpdates, oD=o.oDeleted, oA=o.oAdded
							Array.prototype.splice.apply( D.aLinesBuffer,
								Array.merge(
									  oD.text
										? [ oD.nLineStart-1, oD.nLineEnd-oD.nLineStart+1 ]
										: [ oA.nLineStart-1, 1 ]
									, oA.text
										? D.oSyntax.getLines( oA.nLineStart, oA.nLineEnd )
										: [D.oSyntax.getLine( oD.nLineStart )]
									)
								)
							redraw.call( this )
							},
						redraw : redraw
						}
					})(),
				StringCaching :(function(){
					var redraw =function(){
						var D=this, V=D.oView, sContents=''
						// 1- Récupère le contenu affiché
						for( var aj=V.aVisibleRanges, j=0, nj=aj.length; j<nj; j++ ){
							var a = aj[j]
							for( var i=a[0]-1; i<a[1]; i++ ){
								var m = D.aLinesBuffer[i]
								if( ! m ) m = D.aLinesBuffer[i] = ( D.oSyntax.getLine( i+1 )||' ' )
								sContents += '<dt>'+ m
								}
							}
						// 2- Modifie la zone texte
						var e = D.eTZ
						, oStyle = e.style
						oStyle.height = V.height
						oStyle.paddingTop = V.top
						oStyle.paddingBottom = V.bottom
						oStyle.left = D.Padding.get('left')+'px'
						D.eTZ = Tag.replaceHtml( e, sContents )
						}
					return {
						initialize :function(){
							this.aLinesBuffer = []
							redraw.call( this )
							},
						editing :function(){
							var D=this, o=D.oUpdates, oD=o.oDeleted, oA=o.oAdded
							Array.prototype.splice.apply( D.aLinesBuffer,
								Array.merge(
									  oD.text
										? [ oD.nLineStart-1, oD.nLineEnd-oD.nLineStart+1 ]
										: [ oA.nLineStart-1, 1 ]
									, oA.text
										? D.oSyntax.getLines( oA.nLineStart, oA.nLineEnd )
										: [D.oSyntax.getLine( oD.nLineStart )]
									)
								)
							redraw.call( this )
							},
						redraw : redraw
						}
					})(),
				Default :(function(){ // Element Caching
					var redraw =function(){
						var D=this, V=D.oView, e= D.eTZ
						if( e.parentNode ) e=D.eTZC.removeChild( D.eTZ )
						if( ! D.oSyntax ) return ;
						// 1- Efface les éléments
						while( e.childNodes.length ) e.removeChild( e.firstChild )
						// 2- Ajoute les éléments à afficher
						for(var aj=V.aVisibleRanges, j=0, nj=aj.length; j<nj; j++ ){
							var a = aj[j]
							for(var i=a[0]-1; i<a[1]; i++ ){
								var m = D.aLinesBuffer[i]
								if( ! m ) m = D.oSyntax.getLine( i+1 )
								if( ! m.parentNode )
									e.appendChild(
										D.aLinesBuffer[i] =	m.constructor==String
											? Tag( 'DT', { innerHTML:m, style:{ position:'absolute' }})
											: D.aLinesBuffer[i]
										)
								D.aLinesBuffer[i].style.top = (V.getLine(i+1)-1)*D.oCharacter.nHeight +'px'
								}
							}
						// 3- Modifie la zone texte
						var oStyle = e.style
						oStyle.height = V.nLinesHeight +'px'
						oStyle.left = D.Padding.get('left') +'px'
						D.eTZC.appendChild( e )
						}
					return {
						initialize :function(){
							this.aLinesBuffer = []
							redraw.call( this )
							},
						editing :function(){
							var D=this
							, o=D.oUpdates
							, nLinesDeleted = o.nLineEnd-o.nLineStart+1
							, aSpliced = [ o.nLineStart-1, nLinesDeleted ]
							for( var i=aSpliced[0]; i<aSpliced[1]; i++ ){
								var e = D.aLinesBuffer[ i ]
								if( e && e.parentNode ) D.eTZ.removeChild( e )
								}
							var a = new Array ( o.nLineEnd + o.nLineShift - o.nLineStart + 1 )
							Array.prototype.splice.apply( D.aLinesBuffer, aSpliced.concat( a ))
							redraw.call( this )
							},
						redraw : redraw
						}
					})()
				}
			var RS =function( D, sStrategyName ){
				this.oDocument = D
				this.setStrategy( sStrategyName||'Default' )
				}
			RS.prototype ={
				execAction :function( s ){ // initialize, editing, redraw
					var o = this.oStrategy
					if( o && o[ s = s && s.charAt? s: 'redraw' ]) return o[s].call( this.oDocument )
					throw new Error ( '"'+ this.sStrategyName +'" render strategy: action "'+ s +'" undefined.' )
					},
				removeCache :function( nLineStart, nLineEnd ){
					if( ! nLineStart ) this.oDocument.aLinesBuffer = []
					else for( var i=nLineStart-1; i<nLineEnd; i++ )
						this.oDocument.aLinesBuffer[i]=''
					},
				setStrategy :function( s ){
					if( ! Strategies[ s ]) throw new Error ( '"'+ s +'" render strategy undefined.' )
					this.oStrategy = Strategies[ this.sStrategyName=s ]
					var o = this.oDocument.eTZ.style
					o.height = o.paddingTop = o.paddingBottom = 0
					this.execAction( 'initialize' )
					}
				}
			RS.get =function( s ){ return Strategies[ s ]}
			RS.addStrategy =function( s, o ){
				if( o.initialize && o.editing && o.redraw )
					return Strategies[ s ] = o
				throw new Error ( '"'+ s +'" render strategy is not valid.' )
				}
			return RS
			})(),
		Highlighting:(function(){
			var Strategies ={
				Default :(function(){
					var generateContents =function( m ){ // return array
						var _SEPARATOR = "@GRR_END_LINE@"
						, a = m.str_replace(
							[ '&', '<', '>', /\t/g, /(\n|\r)/g ],
							[ '&amp;', '&lt;', '&gt;', Modules.Tabulation.HTML, Modules.NewLine.HTML+_SEPARATOR ]
							).split( _SEPARATOR )
						return a[0]
						}
					return function( D ){
						var T = D.oSource
						D.oTabulation.bSoftTab = D.bSoftTab = false
						this.getElementsByLine =function( nLine ){ return []}
						this.getElementsByTagName =function( sNodeName ){ return []}
						this.getContents =function(){ return generateContents( T.getValue()) }
						this.getLine =function( nLine ){ return generateContents( T.getLine( nLine )) || '' }
						this.getLines =function( nStart, nEnd ){ return generateContents( T.getLines( nStart, nEnd )) }
						this.update =function(){
							var o = D.oUpdates
							o.nLineShift = o.nLinesNew - o.nLinesOld
							o.nLineStart = o.oDeleted.text ? o.oDeleted.nLineStart : o.oAdded.nLineStart
							o.nLineEnd = o.oDeleted.text && o.oAdded.text
								? Math.max( o.oDeleted.nLineEnd , o.oAdded.nLineEnd )
								: ( o.oDeleted.text ? o.oDeleted.nLineEnd : o.oAdded.nLineEnd )
							}
						}
					})()
				}
			var HS =function( D, sStrategyName ){
				this.setStrategy =function( s ){
					if( ! Strategies[ s ]) throw new Error ( '"'+ s +'" render strategy undefined.' )
					this.oStrategy = new Strategies[ this.sStrategyName=s ](D)
					D.oRender.execAction('initialize')
					}
				this.setStrategy( this.sName = sStrategyName||'Default' )
				}
			HS.prototype={
				getElementsByLine :function( nLine ){ return this.oStrategy.getElementsByLine( nLine )},
				getElementsByTagName :function( sNodeName ){ return this.oStrategy.getElementsByTagName( sNodeName )},
				getContents :function(){ return this.oStrategy.getContents()},
				getLine :function( nLine ){ return this.oStrategy.getLine( nLine )},
				getLines :function( nStart, nEnd ){ return this.oStrategy.getLines( nStart, nEnd )},
				update :function( oUpdates ){ return this.oStrategy.update( oUpdates )}
				}
			HS.get =function( s ){ return Strategies[ s ]}
			HS.addStrategy =function( s, o ){
				if( o.getContents && o.getLine && o.getLines && o.update )
					return Strategies[ s ] = o
				var oP = o.prototype
				if( oP.getContents && oP.getLine && oP.getLines && oP.update )
					return Strategies[ s ] = o
				throw new Error (
					'"'+ s +'" highlighting strategy is not valid.'
					 + ( o.getContents ? '' : '\n getContents undefined.' )
					 + ( o.getLine ? '' : '\n getLine undefined.' )
					 + ( o.getLines ? '' : '\n getLines undefined.' )
					 + ( o.update ? '' : '\n update undefined.' ) 
					)
				}
			return HS
			})()
		}
	var Padding=function(){
		var o={ bottom:0, top:0, left:0, right:0 }
		return {
			add :function( s, n ){
				o[s]==undefined ? (o[s]=n) : (o[s]+=n)
				if( this.onchange ) this.onchange()
				return o[s]
				},
			get :function( s ){ return o[s]||0 }
			}
		}
	var _Syntax = {PHP:'HTML',HTM:'HTML',HTML:'HTML',XML:'HTML',JS:'JS',JSON:'JS',CSS:'CSS',INI:'INI'}
	var Document =(function(){
		var _generateHTML =function(){
			var e
			this.HTML ={
				textZoneControl: e=Tag( 'DIV', { className:'textZoneControl', innerHTML:
					'<div class="gutter"><ul>1</ul></div>'
					+'<div class="currentLine"></div>'
					+'<div class="caret"></div>'
					+'<dl class="lines"></dl>'
					+'<dl class="cols"></dl>'
					+'<dl class="selection"></dl>'
					+'<dl class="highlight"></dl>'
					+'<pre class="textZone"></pre>'
					}),
				gutter: e=e.firstChild,
				currentLine: e=e.nextSibling,
				caret: e=e.nextSibling,
				lines: e=e.nextSibling,
				cols: e=e.nextSibling,
				selection: e=e.nextSibling,
				highlight: e=e.nextSibling,
				textZone: e=e.nextSibling
				}
			this.eTZC = this.HTML.textZoneControl
			this.eGutter = this.HTML.gutter
			this.eCurrentLine = this.HTML.currentLine
			this.eCaret = this.HTML.caret
			this.eLines = this.HTML.lines
			this.eCols = this.HTML.cols
			this.eSelections = this.HTML.selection
			this.eHighlight = this.HTML.highlight
			this.eTZ = this.HTML.textZone

			var D=this, E=D.oEditor
			Events.add(
				this.eTZC,
					'mousedown', (evt)=> E.placeHandle(evt),
					'focus', (evt)=> E.focus(evt),
					'scroll', ()=> D.oView.refresh()
				)
			return this.HTML.textZoneControl
			}
		var _initContents =function( sSource ){
			var D=this, E=D.oEditor
			if( E.ondocumentinit ) E.ondocumentinit( D )
			var S=D.oSelection, C=D.oCaret
			if( S && S.exist()) S.collapse()
			if( C ) C.setIndex(0)
			D.layOut('_initContents')
			D.oSource.setValue( sSource )
			}
		return class {
			constructor( oEditor, sDocName, sSource, oSettings ){
				var D = this
				D.bContentEditable = Modules.Selection && 1
				D.sName = sDocName
				D.Padding = Padding()
				oEditor.oActiveDocument = D
				oEditor.oDocuments[ sDocName ] = D
				D.setFileName( sDocName )
				D.acquire( oSettings
					? oSettings.acquire( oEditor.oDefaultSettings, true )
					: oEditor.oDefaultSettings
					)
				if( D.bContentEditable ) Editor.loadModules( 'UndoStack,Commands,Selection' ) // Pas super réactif le mode asynchrone...
				var E  = D.oEditor = oEditor
				var V  = D.oView = new Modules.View(D)
				var T  = D.oSource = new Modules.Source(D, sSource )
				_generateHTML.call( D )
				var Ch = D.oCharacter = new HTMLZone.Character(D)
				var Ta = D.oTabulation = new Modules.Tabulation(D) // Character requis
				var P  = D.oPositions = new Modules.Positions(D)
				var RS = D.oRender = new Strategy.Render(D)
						 D.oTextZoneControl = new HTMLZone.TextZoneControl(D)
				var G  = D.oGutter = new HTMLZone.Gutter(D)
				var CL = D.oCurrentLine = new HTMLZone.CurrentLine(D, D.bCurrentLine)
						 D.oColumns = new HTMLZone.Cols(D)
						 D.oLines = new HTMLZone.Lines(D)
				var C  = D.oCaret = new HTMLZone.Caret(D)

				Events.preventSelection( true, D.eTZ )
				Events.add(
					window, 'resize', ()=> D.layOut(), // cas utilisation % pour la largeur
					V, 'change', ( sAction )=>{
						D.oRender.execAction( sAction )
						oEditor.onviewchange( V )
						},
					C, 'change', ()=> oEditor.oncaretchange( C.position ),
					D, 'update', ()=>{
						D.oSyntax.update()
						V.refresh('editing')
						D.layOut('oDocument.onupdate')
						oEditor.oncontentchange( D.oUpdates )
						}
					)

				// fait à l'initialisation... normalement
				if( D.sFontSize!='13px' || D.nLineHeight!=1.3 )
					D.setAttribute( 'lineHeight', D.nLineHeight )
				if( ! D.bGutter ) D.oGutter.hide()

				D.setSyntax( D.sFileExt )

				this.elementIn =function ( sName ){
					return (e)=>{
						while( e ){
							if( e===this[sName]) return true
							e = e.parentNode
							}
						return false
						}
					}
				this.elementInContents = this.elementIn('eTZ')
				this.elementInTextZone = this.elementIn('eTZC')
				}
			setFileName ( sDocName ){
				var D=this, a=sDocName.split('/')
				D.sName = sDocName
				D.sFileName = a.pop()
				D.sFilePath = a.length ? a.join('/') +'/' : ''
				D.sFileExt = D.sFileName.indexOf('.')>-1 ? D.sFileName.split('.').pop().toUpperCase() : ''
				}
			setAttribute ( sAttr, mValue ){
				var D=this, E=D.oEditor, C=D.oCaret, S=D.oSelection, oTMP={}
				var propagateChange =function( sName, mValue ){
					var oConfig = Editor.oConfig[ sName ]
					if( oConfig ){
						D[ oConfig.type + sName ] = mValue
						var sEventName = 'on'+sName+'Change'
						if( E[sEventName]) E[sEventName]()
						}
					return mValue
					}
				var _style =function( sAttr, sValue ){
					var a = E.oTabMenu.o[ D.sName ]
					if( ! a ) return ;
					var oStyle = a[1].style
					if( sValue===undefined ) return oStyle[sAttr]=oTMP[sAttr]
					oTMP[sAttr] = oStyle[sAttr]
					return oStyle[sAttr] = sValue
					}
				_style('display','')
				var f ={
					'contentEditable':function(){
						propagateChange( 'ContentEditable', mValue )
						},
					'syntax':function(){
						Tag.className( D.eTZ , D.sSyntax, 'delete' )
						var sSyntax = _Syntax[ mValue ] || 'TXT'
						propagateChange( 'Syntax', sSyntax )
						D.setSyntax( sSyntax )
						},
					'fontSize':function(){
						Tag.className( D.eTZC, D.sFontClass, 'delete' )
						D.eTZC.style.fontSize = propagateChange( 'FontSize', mValue )
						var aNewSize = str_replace( /([\d\.]+)(\w+)/, '$1,$2', mValue ).split( ',' )
						var sLineHeight = parseInt( aNewSize[0]*D.nLineHeight ) + aNewSize[1]
						var s = str_replace( ['%','.'], ['percent','_'], 'size'+mValue+'_'+ D.nLineHeight*10 )
						D.sFontClass = s
						Tag.className( D.eTZC, s, 'add' )
						s = '.'+s
						s = s+' .textZone, '+s+' .gutter LI, '+s+' .currentLine, '+s+' .charSizeTest, '+s+' .caret, '+s+' .caret2, '+s+' .bracket, '+s+' DT'
						CssRules.add( s +'{ height: '+sLineHeight+'; line-height: '+sLineHeight+'; }' )
						D.refreshView()
						if( D.bSoftTab ) D.oRender.execAction( 'initialize' )
						},
					'tabSize':function(){
						D.oTabulation.setMaxSize( mValue )
						propagateChange( 'TabSize', mValue )
						if( D.bSoftTab ) D.oRender.execAction( 'initialize' )
						C.setIndex( C.position.index )
						},
					'lineHeight':function(){
						propagateChange( 'LineHeight', mValue )
						D.setAttribute( 'fontSize', D.eTZC.style.fontSize || D.sFontSize || '13px' )
						return true
						},
					'softTab':function(){
						if( ! D.oSyntax || D.oSyntax.sName == 'Default' ) mValue = false
						var b1 = D.oTabulation.bSoftTab
						, b2 = mValue!==undefined ? mValue : ! D.bSoftTab
						if( b1==b2 ) return;
						D.oTabulation.bSoftTab = b2
						propagateChange( 'SoftTab', b2 )
						D.oRender.execAction( 'initialize' )
						},
					'language':function(){
						E.sLanguage = mValue
						Editor.loadFile( 'src/js/L10N/'+ mValue +'.js?'+ (new Date).valueOf(), function(){
							if( Modules.Dialog ) Modules.Dialog.setLanguage( E )
							})
						},
					'whiteSpaces':function(){
						mValue = propagateChange( 'WhiteSpaces', mValue!==undefined ? mValue : ! D.bWhiteSpaces )
						Tag.className( D.eTZ , 'invisible', mValue ? 'delete' : 'add' )
						var o = E.oTopMenu
						if( o ) o.MenuItem.set( 'SHOW_INVISIBLES', D.bWhiteSpaces ? 'down' : 'up' )
						},
					'gutter':function(){
						mValue = propagateChange( 'Gutter', mValue!==undefined ? mValue : ! D.bGutter )
						D.oGutter[ D.bGutter ? 'show' : 'hide' ]( true )
						},
					'lines':function(){
						mValue = propagateChange( 'Lines', mValue!==undefined ? mValue : ! D.bLines )
						D.oLines.refreshDimension( null, mValue )
						},
					'columns':function(){
						mValue = propagateChange( 'Columns', mValue!==undefined ? mValue : ! D.bColumns )
						D.oColumns.refreshDimension( null, mValue )
						}
					}[ sAttr ]
				C.refresh()
				if( S && S.exist()) S.set( S.start, S.end )
				if( f && !f()) D.layOut('setAttribute')
				_style('display')
				this.oEditor.focus()
				}
			setContents ( sSource, bPreventHistory ){
				var oSource = new Modules.Source( this, sSource )
				this.updateContents({
					start:0,
					added:oSource.getValue(),
					deleted:this.oSource.getValue()
					}, bPreventHistory )
				}
			setSyntax ( sSyntax ){
				var D = this
				if( sSyntax ) D.sSyntax = _Syntax[ sSyntax.toUpperCase() ] || 'TXT'
				var sHighlightingStrategy
				if( Strategy.Highlighting.get('Syntax') && D.sSyntax != 'TXT' ){
					sHighlightingStrategy = 'Syntax'
					Tag.className( D.eTZ, D.sSyntax, 'add' )
					}
				D.oSyntax = new Strategy.Highlighting( D, sHighlightingStrategy )
				_initContents.call( D, D.oSource.getValue())
				D.oRender.execAction( 'initialize' )
				}
			// Utilisé par Caret, Selection, UndoStack et this.setContents
			updateContents ( o, bPreventHistory ){ // o == { start,  added [, deleted] }
				if( ! o || o.start==undefined || ! ( o.added || o.deleted )) return ;
				var D=this, H=D.oUndoStack
				if( ! D.bContentEditable ) return null
				D.oUpdates = D.oSource.updateValue( o )
				if( H && ! bPreventHistory ) H.push( o )
				D.onupdate( D.oUpdates )
				D.oUpdates = null
				}
			layOut ( s ){
				var D=this, E=D.oEditor
				if( ! D.oCharacter.nWidth ) return ;

				D.nLinesMaxWidth = Math.max(
					E.nTextZoneViewWidth-D.Padding.get('left'),
					(D.oPositions.nColumnMax+2) * D.oCharacter.nWidth // ! getColumnMax()
					) // +2 = new_line showed
				D.oTextZoneControl.refresh()
				if( D.onlayout ) D.onlayout( s )
				if( s=='setAttribute' ) D.oCaret.setIndex( D.oCaret.position.index )
				}
			scrollToPosition ( o ){
				var D=this
				, e = D.eTZC
				, Ch = D.oCharacter
				, Tzc = D.oTextZoneControl
				o = o || D.oCaret.position
				var nLeft = D.Padding.get('left') + (o.col-1)*Ch.nWidth
				, nTop = (o.viewLine-1)*Ch.nHeight
				o = Tzc.oVisibleArea
				if( nLeft < o.left ) e.scrollLeft -= o.left - nLeft
				else if( o.right < nLeft+Ch.nWidth ) e.scrollLeft += nLeft+Ch.nWidth - o.right
				if( nTop < o.top ) e.scrollTop -= o.top - nTop
				else if( o.bottom < nTop+Ch.nHeight ) e.scrollTop += nTop+Ch.nHeight - o.bottom
				Tzc.getVisibleArea()
				}
			refreshView (){
				var D=this
				D.oCharacter.onsizechange() // important
				D.oTextZoneControl.refresh()
				D.scrollToPosition()
				D.oView.refresh(/* 'initialize' */)
				D.layOut('refreshView')
				D.oCaret.showInfo()
				D.oSource.showInfo()
				if( D.oSelection ) D.oSelection.showInfo()
				D.setAttribute( 'whiteSpaces', D.bWhiteSpaces )
				}
			write ( sText, fCallBack ){
				var C=this.oCaret, ni=sText.length, E=this.oEditor
				this.bContentEditable = 1
				var _writeChar =function( i ){
					var sChar = sText.charAt(i)
					setTimeout( function(){
						C.insert( sChar, false )
						if( i<ni ) return _writeChar(i+1)
						if( fCallBack ) fCallBack()
						E.bPreventUserInteraction = 0
						}, 40 )
					}
				E.bPreventUserInteraction = 1
				_writeChar(0)
				}
			}
		})()
	return (function(){
		var Editor =function( eEditor, oSettings ){
		//	if( eEditor.nodeName=='TEXTAREA' ) return Editor.replaceElement( eEditor, oSettings )
			Editor.bContentEditable = Modules.Selection && 1
			Editor.aInstances.push( this )
			if( ! Editor.sBasePath ) Editor.sBasePath = FileSystem.pathOf( 'src/js/Editor.js' )
			this.acquire(
				this.oDefaultSettings = oSettings
					? oSettings.acquire( Editor.oDefaultSettings, true )
					: Editor.oDefaultSettings
				)
			this.id = Widgets.getId( 'Editor' )
			this.oDocuments = {}
			this.oPadding = Padding()
			this.eEditor = eEditor
			Tag.className( eEditor,'editor','add' )

			var eInner = document.createDocumentFragment()
			eInner.appendChild( this.eStatus 	= Tag('DIV', { className:'status' }))
			eInner.appendChild( this.eClipboard = Tag('TEXTAREA'))
			eInner.appendChild( this.eTextarea 	= Tag('TEXTAREA'))
			eInner.appendChild( this.eDialogs	= Tag('DIV', { className:'dialogs' }))
			eInner.appendChild( this.eIFRAME 	= Tag('IFRAME'))
			eEditor.appendChild( eInner )
			var o = Tag.dimension( eEditor )
			this.acquire( o )
			this.oFixedDim = o
			this.oFixedDim.height +=6
			this.oFixedDim.width

			Editor.loadFile( 'src/js/L10N/'+ this.sLanguage +'.js' )

			this.oTopMenu = new HTMLZone.TopMenu (this)
			this.oTabMenu = new HTMLZone.TabMenu (this)
			this.oStatus = new HTMLZone.Status (this, 6, this.bStatus)
			this.oGrip = new HTMLZone.Grip (this, this.bGrip)
			if( this.bTabMenu ) this.oTabMenu.show()

			var nTimeOut
			Events.add( 
				document, 'mousedown', (evt)=> this.blur(evt),
				window, 'resize', ()=>{
					if( nTimeOut ) clearTimeout( nTimeOut )
					var D = this.oActiveDocument
					setTimeout( function(){ D.layOut()}, 200 )
					}
				)
			if( Modules.KeyBoard ) this.oKeyBoard = new Modules.KeyBoard (this)
			}
		Editor.acquire({
			aInstances: [],
			HTMLZones: HTMLZone,
			Modules: Modules,
			Strategies: Strategy,
			sBasePath:'',
			oAvailableSyntaxes: _Syntax,
			oConfig:{
				Syntax:			{type:'s', list:'CSS/HTML/INI/JS/TXT'},
				Language:		{type:'s', list:'fr/en'},
				FontSize:		{type:'s', list:'9px/10px/11px/12px/13px/15px/17px/19px'},
				TabSize:		{type:'n', list:'2/3/4/5/6/7/8/16'},
				LineHeight:		{type:'n', list:'1/1.1/1.2/1.3/1.5/2'},
				Columns:		{type:'b' },
				ContentEditable:{type:'b', disabled:function(){ return ! Modules.Selection }},
				Gutter:			{type:'b' },
				Lines:			{type:'b' },
				SoftTab:		{type:'b' },
				WhiteSpaces:	{type:'b', command:'SHOW_INVISIBLES' }
				},
			oDefaultSettings:{
				bColumns: 0,
				bCurrentLine: 1,
				bContentEditable: 1,
				bGrip: 1,
				bGutter: 1,
				bTopMenu: 1,
				bTabMenu: 1,
				bStatus: 1,
				bLines: 0,
				bSoftTab: 0,
				bWhiteSpaces: 0,
				nLineHeight: 1.3,
				nTabSize: 4,
				sFontSize: '13px',
				sLanguage: 'fr',
				sTheme: 'default',
				sTopMenu: '',
				sSyntax:'HTML'
				},
			addModule :function( sName, o ){ Modules[sName]=o },
			loadModules :function( sNames, fCallBack ){
				var a = sNames.split(',')
				for(var i=0, ni=a.length; i<ni; i++ )
					if( ! Modules[ a[i]])
						Editor.loadFile( 'src/js/'+ a[i] +'.js', fCallBack )
				},
			loadFile :function( sFilePathFromRoot, fCallBack ){
				FileSystem.load( Editor.sBasePath + sFilePathFromRoot, fCallBack )
				},
			mapDocuments :function( f ){
				for(var i=0, a=Editor.aInstances, ni=a.length; i<ni; i++ )
					a[i].mapDocuments( f )
				},
			mapEditors :function( f ){
				var sDocName
				for(var i=0, a=Editor.aInstances, ni=a.length; i<ni; i++ ) f(a[i])
				},
			replaceElement :function( e, oSettings ){
				var eEditor = Tag( 'DIV', { className:'editor' })
				var s
				var o = Tag.dimension(e), oStyle = eEditor.style
				switch( e.nodeName ){
					case 'TEXTAREA':
					case 'PRE':
						s = e.value || e.innerHTML.trim()
						oStyle.height = o.height-6 +'px'
						oStyle.width = o.width-2 +'px'
						break;
					default:
						s = e.firstChild.nodeType==8
							? e.firstChild.data.trim()
							: e.innerHTML.trim()
						break;
					}
				e.parentNode.replaceChild( eEditor, e )
				var E = new Editor ( eEditor, oSettings || { bTabMenu:0, bStatus:0, /* bGrip:e.nodeName=='TEXTAREA', */ bContentEditable:e.nodeName=='TEXTAREA', sSyntax:e.className })
				E.newDoc( 'source', s )
				if( e.nodeName!='TEXTAREA' ){
					E.fitDocument( '100%' )
					E.oFixedDim = Tag.dimension( E.eEditor )
					}
				return E
				},
			extend :function( sModule, oExtension ){
				var oModule = Editor.Modules[ sModule ]
				if( oModule && oModule.extend ) oModule.extend( oExtension )
				return oExtension
				},
			addStrategy :function( sType, sName, o ){
				Strategy[ sType ].addStrategy( sName, o )
				},
			getUniqueId :function( sLabel ){
				// Utilisé dans l'historique pour eviter la "concaténation" des actions lors de l'exécution
				return sLabel + '@' + (new Date()).valueOf()
				},
			insertTextFromTextarea :function( e, sAction ){
				e = e || this.eTextarea
				var E=this, D=E.oActiveDocument, S=D.oSelection
				Modules.Interval.push( 50, function(){
					var s = e.value || E.sClipBoardValue
					E.eTextarea.value = ''
					if( S ){
						if( S.exist()) S.remove( false, sAction||'' )
						D.oCaret.insert( s, false, sAction||'' )
						}
					})
				return true
				},
			addInHistory :function( sAction, sCallback, start, end, index ){ // sCallback = 'Undo'|'Redo'
				var D=this.oActiveDocument
				, o ={
					action: sAction,
					detail:[ start, end, index!=undefined?index:end ] // Juste pour info !
					}
				if( D.oUndoStack ) D.oUndoStack.push( o )
				return o[ sCallback ] =function(){
					D.oSelection.set( start, end )
					D.oCaret.setIndex( index!=undefined ? index : end )
					}
				}
			})
		Editor.prototype ={
			nDocID:1,
			sClipBoardValue: '', // Utilisé que si les touches raccourcie ne sont pas utilisées
			ondocumentinit: null,
			onFontSizeChange :function(){},
			onLineHeightChange :function(){},
			oncontentchange :function( oUpdates ){},
		//¤	onselectionchange :function( S ){},
			onviewchange :function(){},
			onhistorychange :function(){},
			oncaretchange :function(){},
		//¤	oncommand :function( sCommand ){},
			execCommand :function( sAction, bCallBack ){
				var o=Editor.Modules.Commands, that = this
				if( o ){
					var f = o[ sAction ]
					if( f ){
						var D=this.oActiveDocument
						if( D ) var C=D.oCaret, S=D.oSelection, T=D.oSource, V=D.oView
						var fCommand = ()=>{
							if( this.oncommand ) this.oncommand( sAction )
							var sResult = f.call( this, D,C,S,T,V )
							setTimeout(function(){ that.focus()}, 10 )
							return sResult
							}
						return bCallBack
							? fCommand
							: fCommand()
						}
						else throw new Error ( 'Command '+sAction+' undefined !' )
					}
				return bCallBack ? function(){} : null
				},
			mapDocuments :function( f ){
				var sDocName
				for( sDocName in this.oDocuments ){
					var D = this.oDocuments[ sDocName ]
					if( D && D.oSource ) f( D )
					}
				},
			newDoc :function( sDocName, sSource, oSettings ){
				var sDocName = sDocName || 'doc'+(this.nDocID++)
				, D =this.oDocuments[ sDocName ]
				, TbM = this.oTabMenu
				if( ! D || D.oSource.getValue( true )!=sSource ){
					this.remove( sDocName )
					D = new Document( this, sDocName, sSource || "\n", ( oSettings
						? oSettings.acquire( this.oDefaultSettings, true )
						: this.oDefaultSettings ))
					TbM.o[ sDocName ] = null
					}
				TbM.open( sDocName )
				return D
				},
			isDocClosed :function( sDocName ){
				var o = this.oTabMenu.o[ sDocName ]
				if( ! o ) return null
				return ! o[0].parentNode
				},
			close :function( sDocName ){
				var o = this.oTabMenu
				if( o ) o.close( sDocName )
				},
			remove :function( sDocName ){
				var D =this.oDocuments[ sDocName ]
				if( D ){
					var TbM = this.oTabMenu
					TbM.close( sDocName )
					TbM.o[ sDocName ] = this.oDocuments[ sDocName ] = null
					if( this.onclose ) this.onclose( sDocName )
					}
				},
			saveDoc :function(){
				var D=this.oActiveDocument
				if( D ){
					var US=D.oUndoStack
					if( this.onsave ) this.onsave( D.sName, D.oSource.getValue( true ))
					if( US ) US.markSaved()
					}
				},
			dialog :function( sDialogName ){
				var E=this, f=function(){ Modules.Dialog( E, sDialogName )}
				Modules.Dialog
					? f()
					: Editor.loadModules('Dialog', f )
				},
			rename :function( sOldFile, sNewFileName ){
				var D = this.oDocuments[ sOldFile ]
				if( D ){
					var sFileName = D.sFilePath + sNewFileName
					this.oDocuments[ sFileName ] = D
					this.oDocuments[ D.sName ] = null
					this.oTabMenu.rename( D.sName, sFileName )
					D.setFileName( sFileName )
					if( D.sFileExt && D.sSyntax != D.sFileExt ) D.setAttribute( 'syntax', D.sFileExt )
					}
				},
			resizeTo :function( mWidth, mHeight ){
				var E=this, D=E.oActiveDocument
				var o = E.eEditor.style
				if( mWidth ){
					if( ~mWidth.indexOf('px')){ if( parseInt(mWidth)>20 ) o.width = mWidth }
						else o.width = mWidth
					}
				if( mHeight ){
					if( ~mHeight.indexOf('px')){ if( parseInt(mHeight)>20 ) o.height = mHeight }
						else o.height = mHeight
					}
				/*
				var oDim = Tag.dimension( E.eEditor )
				E.width = oDim.width
				E.height = oDim.height
				*/
				if( D ){
					D.oTextZoneControl.refresh()
					D.oView.refresh()
					}
				},
			setDocActive :function( D ){
				this.oActiveDocument = D
				if( D ){
					D.refreshView()
					if( D.oUndoStack ) D.oUndoStack.onchange() // Mise à jour icônes TopMenu...
					this.oncaretchange( D.oCaret.position )
					if( Editor.ondocument ) Editor.ondocument( this )
					}
				},
			fitDocument :function( sWidth, sHeight ){
				var D = this.oActiveDocument
				if( D )
					this.resizeTo( 
						sWidth ? sWidth : D.Padding.get('left') + D.nLinesMaxWidth + D.oCharacter.nWidth +'px',
						sHeight ? sHeight : this.oPadding.get('top') + this.oPadding.get('bottom') + ( D.oSource.nLines ) * D.oCharacter.nHeight +'px'
						)
				},
			focus :function( evt ){
				var D=this.oActiveDocument
				if( D ){
					var C=D.oCaret
					if( Editor.oneditor ) Editor.oneditor( this, D )
					if( C ) C.setActive( true )
					var S=D.oSelection
					this[ S && S.exist() ? 'eClipboard' : 'eTextarea' ].focus()
					}
				},
			blur :function( evt ){
				var b=null, D=this.oActiveDocument
				if( ! D ) return ;
				if( evt ) b = D.elementInTextZone( Events.element( evt )) || null
				D.oCaret.setActive( b )
				if( ! b ){
					this.eClipboard.blur()
					this.eTextarea.blur()
					} else this.focus()
				},
			getLine :function( evt ){ // return n
				var D=this.oActiveDocument, V=D.oView
				, e = D.eTZC
				, oMouse = Mouse.position( evt )
				, oTag = Tag.position( e )
				, nLine = Math.ceil( ( oMouse.top - oTag.top + e.scrollTop ) / D.oCharacter.nHeight )
				if( V.haveHiddenRange())
					nLine = V.aVisibleLines[ nLine-1 ]
				return Math.max( 1, Math.min( nLine, D.oSource.nLines ))
				},
			placeHandle :function( evt ){
				if( this.bPreventUserInteraction ) return;
				var e = Events.element( evt )
				var D=this.oActiveDocument, S=D.oSelection, C=D.oCaret
				if( ! D.elementInTextZone( e )) return this.blur( evt )
				if( D.elementInContents( e )){
					var o=D.oPositions.getFromEvent( evt )
					if( S ){
						var nIndex = C.position.index
						Keyboard.code( evt )
						if( Keyboard.shift ){
							S.set(
								! S.exist() 
									? nIndex
									: nIndex==S.start
										? S.end
										: S.start
								, o.index
								)
							C.setPosition( o )
							return false
							}
						if( o && S.includesIndex( o.index )){
							// initialise le D&D de la la sélection
							if( ! D.oGutter.sLineSelected ){
								S.bDragging = true
								Tag.className( D.eTZ, 'drag', 'add' )
								Tag.className( D.eCaret, 'drag', 'add' )
								}
							}
						else{
							S.collapse()
							this.focus()
							}
						C.setPosition( o )
						return false // IMPORTANT : pour empécher la sélection par défaut
						}
					else{
						C.setPosition( o )
						this.focus()
						}
					}
				},
			setAttribute :function( sAttr, mValue ){ return this.oActiveDocument.setAttribute( sAttr, mValue )},
			getContents :function( sDocName ){
				if( ! sDocName ) return this.oActiveDocument.oSource.getValue( true )
				var D = this.oDocuments[ sDocName ]
				if( D ) return D.oSource.getValue( true )
				return null
				},
			setContents :function( sSource ){return this.oActiveDocument.setContents( sSource )},
			setValue :function( sFileName, sContents ){
				var D = this.oActiveDocument, TBM = this.oTabMenu
				if( ! TBM.isOpened( sFileName )){
					TBM.rename( D.sName, sFileName )
					D.setFileName( sFileName )
					D.oSource.setValue( sContents )
					D.setSyntax( D.sFileExt )
					}
				TBM.setActive( sFileName )
				}
			}
		return Editor
		})()
	})()