Editor.addModule('Brackets',(function(){
	var Pair ={
		n: null,
		sStarts: '{[(',
		sEnds: '}])'
		}
	var B =function( D ){
		var B=this
		this.oDocument = D
		Events.preventSelection( true, this.eStart = Tag('DIV',{className:'bracket'}))
		Events.preventSelection( true, this.eEnd = Tag('DIV',{className:'bracket'}))
		Events.add(
			D, 'layout', CallBack( this, 'search' ), // BOURIN : cas suppression avec la touche SUPPR
			D.oCaret, 'change', CallBack( this, 'search' )
			)
		}
	B.prototype={
		reset :function(){
			var e=this.oDocument.eTZC
			if( this.eStart.parentNode ) e.removeChild( this.eStart )
			if( this.eEnd.parentNode ) e.removeChild( this.eEnd )
			this.nStart = this.nEnd = null
			},
		highlight :function( n1, n2 ){ // highlight position n1 and n2
			if( this.nStart==n1 && this.nEnd==n2 ) return ;
			this.nStart = n1
			this.nEnd = n2
			var D=this.oDocument, S=D.oSelection, T=D.oSource
			, P=D.oPositions, Ch=D.oCharacter
			, b = S && S.exist()
			, f =function( e, o ){
				if( ! o.viewLine ) return ;
				e.innerHTML = T.charAt( o.index )
				D.eTZC.appendChild( e )
				e.className = 'bracket'
				var oStyle = e.style
				oStyle.left = D.Padding.get('left')+(o.col-1)*Ch.nWidth +'px'
				oStyle.top = (o.viewLine-1)*Ch.nHeight+1 +'px'
				oStyle.height = Ch.nHeight-1 +'px'
				oStyle.lineHeight = Ch.nHeight-2 +'px'
				oStyle.width = Ch.nWidth +'px'
				if( b ) Tag.className( e, 'bracketSelection', 'add' )
				}
			f( this.eStart, P.getFromIndex( n1 ))
			f( this.eEnd, P.getFromIndex( n2 ))
			},
		getIndexes :function( sBracket1, sBracket2 ){ // Search all position of current brackets  ( OPTIMIZATION )
			var s = this.oDocument.oSource.getValue()
			for( var aStart=[], n=0; n!=-1; n++ ){
				n = s.indexOf( sBracket1, n )
				if( n!=-1 ) aStart.push( n )
					else break
				}
			for( var aEnd=[], n=0; n!=-1; n++ ){
				n = s.indexOf( sBracket2, n )
				if( n!=-1 ) aEnd.push( n )
					else break
				}
			return Array.merge( aStart, aEnd ).sort( function( n1, n2 ){ return n1<n2 ? -1 : ( n1==n2 ? 0 : 1 )})
			},
		search :function(){ // Search if character at n is a bracket, if true highlight matched brackets
			var n = this.oDocument.oCaret.position.index
			this.reset()
			var sContents = this.oDocument.oSource.getValue()
			var re = /\s+/
			var Bracket =function( sType ){
				return {
					sChar : Pair[ 's'+sType+'s' ].charAt( Pair.n ),
					isAt :function( n ){ // Test if the bracket is at the position n, the character \ must not be before
						var sChar = sContents.charAt( n )
						if( sChar==this.sChar )
							return n==0 ? true : sContents.charAt( n-1 )!='\\'
						return false
						}
					}
				}
			// Search in the current position n
			var s = sContents.charAt( n ).replace( re, '' )
			if( s ){
				var n1 = Pair.sStarts.indexOf( s )
				, n2 = Pair.sEnds.indexOf( s )
				s = n1>-1 ? 'end' : ( n2>-1 ? 'start' : '' )
				}
			// If not found, search in the position before n
			if( ! s ){
				n = n-1
				s = sContents.charAt( n )
				n1 = Pair.sStarts.indexOf( s )
				n2 = Pair.sEnds.indexOf( s )
				s = n1>-1 ? 'end' : ( n2>-1 ? 'start' : '' )
				}
				
			// If found, search the paired bracket (A bracket is not prefixed by the escape character ' \ ')
			if( s && sContents.charAt( n-1 )!='\\' ){
				Pair.n = s=='end' ? n1 : n2
				var nCount = 1
				, oStart = Bracket( 'Start' )
				, oEnd = Bracket( 'End' )
				, a = this.getIndexes( oStart.sChar, oEnd.sChar )
				switch( s ){
					//  search end bracket
					case "end":
						var nStart = n
						, nLength = sContents.length
						for( var i=0, ni=a.length; i<ni; i++ ){
							if( a[i]<=nStart ) continue
							n = a[i]
							if( oStart.isAt( n )) nCount++
							else if( oEnd.isAt( n )) nCount--
							if( nCount==0 ) return this.highlight( nStart, n )
							}
						break;
					//  search start bracket
					case "start":
						var nEnd = n
						a.reverse()
						for( var i=0, ni=a.length; i<ni; i++ ){
							if( nEnd<=a[i]) continue
							n = a[i]
							if( oStart.isAt( n )) nCount--
							else if( oEnd.isAt( n )) nCount++
							if( nCount==0 ) return this.highlight( n, nEnd )
							}
						break;
					}
				}
			}
		}

	var newinstance =function( D ){ D.oBrackets = new B(D)}
	Events.add( Editor.prototype, 'documentinit', newinstance )
	Editor.mapDocuments( newinstance )
	return B
	})())