Editor.addModule('TextMarker',(function(){
	var _={
		markstyle :function( sStyle ){ return function(D,C,S){ if( S.exist()) D.oTextMarker.mark( sStyle, S.cloneContents())}},
		unmarkstyle :function( sStyle ){ return function(D){ D.oTextMarker.unmark( sStyle )}}
		}
	Editor.extend( 'Commands', {
		MARK_STYLE_1:_.markstyle('style1'),
		MARK_STYLE_2:_.markstyle('style2'),
		MARK_STYLE_3:_.markstyle('style3'),
		MARK_STYLE_4:_.markstyle('style4'),
		MARK_STYLE_5:_.markstyle('style5'),
		UNMARK_ALL:_.unmarkstyle(''),
		UNMARK_STYLE_1 :_.unmarkstyle('style1'),
		UNMARK_STYLE_2 :_.unmarkstyle('style2'),
		UNMARK_STYLE_3 :_.unmarkstyle('style3'),
		UNMARK_STYLE_4 :_.unmarkstyle('style4'),
		UNMARK_STYLE_5 :_.unmarkstyle('style5')
		})
	Editor.extend( 'KeyBoard', {
		'CTRL+1':'MARK_STYLE_1',
		'CTRL+2':'MARK_STYLE_2',
		'CTRL+3':'MARK_STYLE_3',
		'CTRL+4':'MARK_STYLE_4',
		'CTRL+5':'MARK_STYLE_5',
		'CTRL+SHIFT+1':'UNMARK_STYLE_1',
		'CTRL+SHIFT+2':'UNMARK_STYLE_2',
		'CTRL+SHIFT+3':'UNMARK_STYLE_3',
		'CTRL+SHIFT+4':'UNMARK_STYLE_4',
		'CTRL+SHIFT+5':'UNMARK_STYLE_5',
		'CTRL+SHIFT+6':'UNMARK_ALL'
		})

	var Layers =function(){
		return {
			oLists: {},
			aNames: [],
			add :function( sLayer ){
				this.aNames.push( sLayer )
				return this.oLists[ sLayer ]=[]
				},
			get :function( sLayer ){
				return this.oLists[ sLayer ]||this.add( sLayer )
				},
			remove :function( sLayer ){
				delete this.oLists[ sLayer ]
				this.aNames.remove( sLayer )
				},
			init :function(){
				this.oLists = { smart:this.oLists.smart }
				this.aNames = [ 'smart' ]
				}
			}
		}
	var TM =function( D ){
		this.oDocument = D
		this.oLayers = new Layers()
		var f= ()=> this.refresh()
		Events.add(
			D.eTZC, 'dblclick', f,
			D.oCaret, 'change', f,
			D.oSelection, 'change', f,
			D.oView,
				'change', f,
				'update', ()=> this.update()
			)
		}
	TM.prototype={
		add :function( sLayer, nStart, nEnd ){
			var P=this.oDocument.oPositions
			this.oLayers.get( sLayer ).push({
				start: P.getFromIndex( nStart ),
				end: P.getFromIndex( nEnd )
				})
			},
		smartHighLighting :function( s, bBoundaries ){
			var sBound = bBoundaries ? '\\b' : ''
			this.oLayers.remove('smart')
			if( ! /\s+/.test( s ))
				this.oDocument.oSource.getValue().replace(
					new RegExp ( sBound + RegExp.escape( s ) + sBound, 'gi' ),
					( sMatched, nIndex )=> this.add( 'smart', nIndex, nIndex + sMatched.length )
					)
			},
		mark :function( sLayer, m ){
			var nCount = 0
			this.oDocument.oSource.getValue().replace(
				m.constructor==String
					? new RegExp ( RegExp.escape( m ), 'g' )
					: m ,
				sLayer=='count'
					? function(){ nCount++ }
					: ( sMatched, nIndex )=> this.add( sLayer, nIndex, nIndex + sMatched.length )
				)
			this.refresh()
			return nCount
			},
		unmark: function( sLayer ){
			this.oLayers[sLayer?'remove':'init']( sLayer )
			this.oDocument.eHighlight.innerHTML = ''
			this.refresh()
			},
		refresh :function(){
			var D=this.oDocument, V=D.oView, S=D.oSelection
			if( S && ! S.exist()) this.oLayers.remove('smart')
			if( V ) this.displayLines( V.nLineStart, V.nLineEnd )
			},
		displayLines :function( nStart, nEnd ){
			if( isNaN( nStart ) || isNaN( nEnd )) return ;
			var D=this.oDocument, P=D.oPositions, V=D.oView, S=D.oSelection
			, nLineHeight = D.oCharacter.nHeight
			, nCharWidth = D.oCharacter.nWidth
			, e = D.eHighlight
			, oLayers = this.oLayers
			e.style.marginLeft = D.Padding.get('left')+'px'
			e.innerHTML = ''
			if( S && S.exist()) this.smartHighLighting( S.cloneContents(), true )
			for(var i=0, sLayer; sLayer=oLayers.aNames[i]; i++ ){
				for(var j=0, a=oLayers.get( sLayer ), nj=a.length, o; j<nj ; j++ ){
					o=a[j]
					if( ! o || o.start.line > nEnd || o.end.line < nStart ) continue;
					for( var k=Math.max( o.start.line, nStart ), nk=Math.min( o.end.line, nEnd ); k<=nk ; k++ ){
						var bSameLine = o.start.line==o.end.line
						if( ! bSameLine ){
							var sLine = D.oSource.getLine( k )
							, nWidth = k==o.start.line
								? P.getFromIndex( sLine.index+sLine.length-1 ).col - o.start.col + 1
								: k==o.end.line
									? o.end.col-1
									: P.getFromIndex( sLine.index+sLine.length-1 ).col
							}
						var nViewLine = V.getLine( k )
						if( nViewLine )
							e.appendChild( Tag('DT',{
								className: sLayer,
							//	innerHTML: D.oSource.getValue().substring( o.start.index, o.end.index ),
								style:{
									left: ( k==o.start.line ? o.start.col-1 : 0 ) * nCharWidth +'px',
									top: (nViewLine-1)*nLineHeight+2 +'px',
									width: ( bSameLine ? o.end.col - o.start.col : nWidth ) * nCharWidth +'px',
									height: nLineHeight-4 +'px'
									}
								}))
						}
					}
				}
			},
		update :function(){
			var D=this.oDocument, P=D.oPositions, S=D.oSelection
			if( ! D.oUpdates ) return ;
			var n0 = D.oUpdates.oAdded.text.length - D.oUpdates.oDeleted.text.length
			, n1 = D.oUpdates.nIndex
			, n2 = n1 + D.oUpdates.oDeleted.text.length
			, oLayers = this.oLayers
			for(var i=0, sLayer; sLayer=oLayers.aNames[i]; i++ ){
				for(var j=0, a=oLayers.get( sLayer ), nj=a.length, o; j<nj ; j++ ){
					o=a[j]
					if( o ){
						if( o.end.index < n1 ) continue;
						if( o.start.index > n2 ){
							o.start = P.getFromIndex( o.start.index + n0 )
							o.end = P.getFromIndex( o.end.index + n0 )
							}
						else a[j] = null
						}
					}
				}
			}
		}

	var newinstance =function( D ){ D.oTextMarker = new TM(D)}
	Events.add( Editor.prototype, 'documentinit', newinstance )
	Editor.mapDocuments( newinstance )
	return TM
	})())