Editor.addStrategy( 'Highlighting', 'Syntax', (function(){
	var bNoTitle = true
	,replaceSpecialHTML =function( s ){
		return s.str_replace( ['&','<','>'], ['&amp;','&lt;','&gt;'])
		}
	,getHTMLStart =function( o, bNoTitle ){
		// Tabulations souples
		if( /\btab\b/.test( o.css ) && this.D.oTabulation.bSoftTab ){
			var nIndex = o.index-nLineIndex
			, nTabSize = this.D.oTabulation.size
			var n = nTabSize - ( nIndex + nShift ) % nTabSize
			nShift += n-1
			return '<b class="tab" title="'+valueToString( o )+'" style="width: '+(this.D.oCharacter.nWidth*n)+'px;">'
			}
		return bNoTitle || ! o.value
			? '<b class="'+ o.css +'">'
			: '<b class="'+ o.css +'" title="'+ valueToString(o) +'">'
		}
	,getHTMLEnd =function( o ){return'</b>'}
	,valueToString =function(o){
		return JSON.stringify( o, 'token,parentToken,css,index,lineStart,lineEnd'.split(','), " " ).str_replace('"', '')
		}
	,searchAnElementAtLine =function( nLine ){
		var a = this.childNodes
		, nStart = 0, nMiddle, nEnd = a.length-1
		
		// Recherche dichotomique d'un élément à la l igne
		if( a.length )
			do{
				nMiddle = Math.round( nStart + ( nEnd - nStart ) / 2 )
				var e = a[nMiddle]
				if( nLine < e.oValue.lineStart ) nEnd = nMiddle - 1
				else if( nLine > e.oValue.lineEnd ) nStart = nMiddle + 1
				else return e
			}while( nStart <= nEnd )
		return null
		}
	,getElementsByLine =function( nLine ){
 		var e = searchAnElementAtLine.call( this, nLine )
		for(var eFirst = e; eFirst; eFirst = eFirst.previousSibling ){
			if( nLine > eFirst.oValue.lineEnd ){
				eFirst = eFirst.nextSibling
				break
				}
			else if( ! eFirst.previousSibling ) break;
			}
		e = eFirst || e
		var a=[]
		for(/* var e=this.firstChild */; e; e=e.nextSibling )
			if( e.oValue.lineStart<=nLine && nLine<=e.oValue.lineEnd ) a.push(e)
			else if( e.oValue.lineEnd > nLine ) break;
		return a
		}

// Lexeme
var Lexeme =function( o ){
	var e = document.createElement( o.token||'NO_TOKEN_NAME' )
//	var e = new SimpleNode ( o.token||'NO_TOKEN_NAME' )
	e.oValue = o
	e.getElementsByLine = getElementsByLine
	return e
	}
// Lexer
var LexerClass =function(){
	var Lexer =function( sText, sSyntax ){
		if( sText!=undefined ){
			if( !Lexer.SINGLETON ) Lexer.SINGLETON = new Lexer
			return Lexer.SINGLETON.scan( sText, sSyntax )
			}
		}
	, LexerRules =(function(){
		var Dictionary =function( sId ){
			var sGetError = '"$1" is not a lexer '+ sId
			var sAddError = 'Lexer '+ sId +' "$1" already exist.'
			return {
				list: {},
				add :function( ID, m ){
					if( this.list[ID]) throw new Error ( sAddError.replace( '$1', ID ) +' ('+ Lexer.ID +')')
					return this.list[ID] = m
					},
				get :function( ID ){
					if( this.list[ID]) return this.list[ID]
					throw new Error ( sGetError.replace( '$1', ID ) +' ('+ Lexer.ID +')')
					},
				have :function( ID ){
					return this.list[ID]
					}
				}
			}
		, Rules=Dictionary('rule')
		, Tokens=Dictionary('token')
		return{
			CSS: {},
			Rules: Rules,
			Tokens: Tokens,
			Translation: {},
			addCSSClass :function( m ){
				var o = this.CSS
				var aCouples = m.constructor==Array ? m : m.split('&')
				for(var i=0, s ; s=aCouples[i]; i++){
					var aCouple = s.split('=')
					var sClassName = aCouple[0]
					var aTokens=aCouple[1].split('|')
					for(var j=0, sToken; sToken=aTokens[j]; j++){
						o[sToken] = o[sToken] ? o[sToken].split(' ') : []
						o[sToken].push( sClassName )
						o[sToken].sort()
						o[sToken] = Array.unique( o[sToken]).join(' ')
						}
					}
				},
			addRule :function( sName, sTokens ){
				return Rules.add( sName, this.makeRule( sName, sTokens ))
				},
			addRules :function( aRules ){
				for(var i=0; aRules[i]; i++ )
					aRules[i] = this.addRule( aRules[i][0], aRules[i][1])
				return aRules
				},
			addTokens :function( aTokens ){
				if( aTokens.length )
					for(var i=0; aTokens[i]; i++){
						var sName=aTokens[i][0]
						aTokens[i] = Tokens.add( sName, this.makeToken( sName, aTokens[i][1] ))
						}
				return aTokens
				},
			makeToken :function( sName, o ){
				o.name = sName
				return o
				},
			makeRule :function( sName, sTokens ){
				var aList = sTokens.split('|')
				var a = []
				for(var i=0; aList[i]; i++){
					var ID = aList[i]
					var oToken = this.Tokens.list[ID]
					if( oToken ) a.push( oToken )
					else {
						var aRule = this.Rules.list[ID]
						if( ! aRule ) throw Error ('Rule "'+ ID +'" Not Found !' )
						a = a.concat( aRule )
						}
					}
				return a
				},
			setPreviousTokenOf :function( sToken, sPreviousTokens ){
				return Previous.setPreviousTokenOf( sToken, sPreviousTokens )
				},
			setTokensTranslation :function( m ){
				var o = this.Translation
				var aCouples = m.constructor==Array ? m : m.split('&')
				for(var aCouple, sToken, i=0, ni=aCouples.length; i<ni ; i++ ){
					aCouple = aCouples[i].split('=')
					sToken = aCouple[0]
					if( o[sToken]) throw Error ( 'Token Translation of '+ sToken +' already defined with '+ o[sToken] +' !' )
					o[sToken] = aCouple[1]
					}
				}
			}
		})()
	, Actions =(function(){
		var Do =function( oInstance, oLexeme ){
			var s = oInstance.sToken
			return Do[ s.charAt(1)=='_' && Do.directive[ s.charAt(0)] || 'add' ].call( oInstance, oLexeme )
			}
		Do.union({
			add :function( oLexeme ){
				this.previous.set( oLexeme.token )
				return this.appendNode( Lexeme( oLexeme ))
				},
			endParent :function( oLexeme ){
				oLexeme.bParentLimit = true
				this.previous.set( this.eParent.oValue.token )
				var eNode = this.appendNode( Lexeme( oLexeme ))
				this.stack.pop()
				return eNode
				},
			newLine :function( oLexeme ){
				this.previous.set( oLexeme.token )
				this.nLine++
				return this.appendNode( Lexeme( oLexeme ))
				},
			rescanToken :function( oLexeme ){
				this.nPos = oLexeme.index
				this.nLine = oLexeme.lineStart
				var sRule = this.sToken.slice(2)
				, sTextRescan = oLexeme.value
				, nEnd = this.nPos + sTextRescan.length
				, sTMP = this.sText
				oLexeme.value = ''
				oLexeme.rule = sRule
				oLexeme.bParent = oLexeme.bRescan = true
				var eParent = this.appendNode( Lexeme( oLexeme ))
				this.stack.push( eParent )
				this.previous.set( oLexeme.token )
				this.sText = this.sText.slice( 0, nEnd )
				do{ this.readToken()}while( this.nPos<nEnd )
				this.sText = sTMP
				this.stack.pop()
				return eParent
				},
			startParent :function( oLexeme ){
				this.sToken = this.sToken.slice(2)
				var eNewParent = Lexeme({
					token: LexerRules.Translation[this.sToken]||this.sToken,
					css: LexerRules.CSS[this.sToken]||'',
					rule:this.sToken,
					value:'',
					index:oLexeme.index,
					lineStart:this.nLine,
					bParent:true
					})
				oLexeme.bParentLimit = true
				this.previous.set( oLexeme.token )
				var bSkip = this.skip( oLexeme.token )
				if( ! bSkip ) this.appendNode( eNewParent )
				this.stack.push( eNewParent )
				this.appendNode( Lexeme( oLexeme ))
				if( Skip.stepOf[ this.sSyntax ])
					do{ this.readToken()}while( this.eParent==eNewParent )
				return bSkip ? true : eNewParent
				}
			})
		Do.directive={
			E:'endParent',
			L:'newLine',
			R:'rescanToken',
			S:'startParent'
			}
		return Do
		})()
	, Previous =(function(){
		var o =function(){
			var s = ''
			return {
				get :function(){ return s },
				set :function( sToken ){
					return o.excluded[sToken]
						? false // doit impérativement retourner cette valeur
						: s = LexerRules.Translation[sToken]||sToken
					},
				validFor :function( sToken ){
					return o.ofToken[sToken] ? o.ofToken[sToken][s] || false : true
					}
				}
			}
		o.union({
			excluded :{
				WHITE_SPACES:1,SPACES:1,SPACE:1,TAB:1,// NEW_LINE:1,L_NEW_LINE:1,
				S_SLC:1,SLC:1,SLC_IN:1,
				S_MLC:1,MLC:1,MLC_IN:1,E_MLC:1,
				COMMENT:1,
				REGULAR_EXPRESSION_IN:1
				},
			ofToken :{},
			setPreviousTokenOf :function( sToken, sPreviousTokens ){
				if( Previous.ofToken[sToken]) throw new Error ( 'Previous token of '+ sToken +' already defined !' )
				var o = Previous.ofToken[sToken] = {}
				for(var i=0, a=sPreviousTokens.split('|'); a[i]; i++) o[ a[i]]= true
				return o
				}
			})
		return o
		})()
	, Stack =function( that ){
		var a =[0,0,0,0,0]
		var n = 0 // StackLength
		return {
			getSize :function(){ return n },
			pop :function(){
				if( that.bIncremental ){
					// Cas : Un parent est stoppé plus top
					if( that.eEndToken && that.eParent==that.eEndToken.parentNode ){
						// Efface tous les enfants du parent présent après sa nouvelle fin
						for(var e=that.eEndToken; e;){
							var eRemoved = e
							e = e.nextSibling
							that.removeToken( eRemoved )
							}
						// New End Token
						that.eEndToken = that.getTokenAfter( that.eParent )
						}
					}
				// A faire après suppression des éléments inutiles
				if( n ){
					var e = a[--n]
					e.oValue.lineEnd = e.lastChild && e.lastChild.oValue.lineEnd || 1
					if( e.setTitle ) e.setTitle()
					}
				if( n ){
					that.eParent = a[n-1]
					that.setSyntax( that.eParent.oValue.rule )
					}
				else {
					that.eParent = this.sSyntax = this.aRules = null
					}
				return n
				},
			push :function( e ){
				a[n++] = that.eParent = e
				that.setSyntax( e.oValue.rule )
				return e
				},
			top :function(){ return a[n-1] },
			unshift :function( e ){
				n++
				a.unshift(e)
				return e
				}
			}
		}
	, Skip =(function(){
		var o = function( that ){
			var f = that.bSkip
				? function( sToken ){ return Previous.excluded[sToken] || false }
				: function( sToken ){ return false }
			f.set =function( bSkip ){
				that.bSkip = bSkip
				return that.skip = Skip(that)
				}
			return f
			}
		o.stepOf={SSQ:1,SDQ:1,MLC:1,SLC:1,REGULAR_EXPRESSION:1}
		return o
		})()

	Lexer.ID = "LexerClass"
	Lexer.union({
		Actions: Actions,
		Previous: Previous,
		Rules: LexerRules,
		Skip: Skip,
		Stack: Stack,
		insert :function( fModule ){ fModule( Lexer.Rules )},
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			return Lexer.SINGLETON.rescan( eRoot, sSource, nPos, nDeleted, nAdded )
			}
		})
	Lexer.prototype ={
		bSkip: 0,
		sToken: null,
		sValue: null,
		appendNode: null,
		end :function(){
			return this.eRoot
			},
		init :function( sText, sSyntax ){
			sSyntax = sSyntax || 'TXT'
			this.union({
				nLine:1,
				nPos:0,
				sText:sText,
				skip:Skip(this),
				stack:Stack(this),
				previous:Previous()
				})
			this.eRoot = this.stack.push( Lexeme({
				value:'',
				token:sSyntax,
				rule:sSyntax,
				css:sSyntax.toLowerCase(),
				index:0,
				lineStart:1
				}))
			this.appendNode =function( eNode ){
				return this.skip( eNode.oValue.token )
					? true
					: this.eParent.appendChild( eNode )
				}
			},
		readToken :function(){
			for(var i=0, oLexeme; this.aRules[i]; i++ ){
				if( this.searchToken( this.aRules[i])){
					if( this.haveLexeme( oLexeme={
						value: this.sValue,
						token: LexerRules.Translation[this.sToken]||this.sToken,
						css: LexerRules.CSS[this.sToken]||'',
						rule:this.sSyntax,
						index:this.nPos,
						lineStart:this.nLine,
						lineEnd:this.nLine
						})) return false
					this.nPos += this.sValue.length
					return Actions( this, oLexeme )
					}
				}
			return this.stack.pop() ? true : null
			},
		scan :function( sText, sSyntax ){
			this.init( sText, sSyntax )
			while( this.readToken());
			return this.end()
			},
		searchToken :function( mTokenOrTokens ){ /* TODO */ },
		setSyntax :function( sSyntax ){
			this.aRules = LexerRules.Rules.list[ this.sSyntax = sSyntax ]
							|| [ LexerRules.Tokens.list[sSyntax] ]
			},
		getInfo :function(){
			console.info([
				'Lexer.ID :'+ Lexer.ID,
				'this.nPos :'+ this.nPos,
				'this.nLine :'+ this.nLine,
				'this.sSyntax :'+ this.sSyntax,
				'this.stack.getSize() :'+ this.stack.getSize(),
				'this.sToken :'+ this.sToken,
				'this.sValue :'+ this.sValue
				].join("\n"))
			
			}
		}

	// INCREMENTAL SCANNING only
	var sWSTokens ='|WHITE_SPACES|SPACES|SPACE|NEW_LINE|L_NEW_LINE|TAB|'
	Lexer.prototype.union({
		eEndToken:null,
		nShift:null,
		nLineShift:null,
		getTokenAfter :function( e ){
			var eNext
			do{ if( e===this.eRoot ) return null
				eNext = e.nextSibling
				e = e.parentNode
				}while( ! eNext )
			return eNext
			},
		getTokenBefore :function( e ){
			var ePrevious
			do{ if( e===this.eRoot ) return null
				ePrevious = e.previousSibling
				e = e.parentNode
				}while( ! ePrevious )
			return ePrevious
			},
		getNextEndToken :function(){
			var eNext = this.getTokenAfter( this.eEndToken )
			this.removeToken( this.eEndToken )
			this.eEndToken = eNext
			},
		haveLexeme :function( oLexeme ){
			if( ! this.eEndToken ) return false
			// Efface les éléments dépassés par le lexème trouvé
			while( this.eEndToken && this.eEndToken.oValue.index + this.nShift < oLexeme.index )
			// pas <= sinon autant faire une analyse totale
			// mais... a voir
				this.getNextEndToken()
			var o = this.eEndToken && this.eEndToken.oValue
			// Si le nouveau token est 'identique' à eEndToken
			if( o && oLexeme.token==o.token && oLexeme.value==o.value && oLexeme.index==o.index+this.nShift ){
				// 1. Contrôle si les tokens sont bien identique = ont le même parent
				if( this.eParent !== this.eEndToken.parentNode )
					this.getNextEndToken()
				// 2. FIN ANALYSE: Met à jour les éléments suivant ( index et ligne ) 
				else{
					this.nLineEnd = o.lineEnd
					this.nLineShift = oLexeme.lineStart - o.lineStart
					return true
					}
				}
			return false  // Continue l'analyse
			},
		isPartOfRange :function( e, nStart, nLength ){ // Intervalle ouvert
			var nEnd = nStart + (nLength||0) /* - 1 */
			, nTokenStart = e.oValue.index
			while( e.oValue.bParent ) e=e.lastChild
			var nTokenEnd = e.oValue.index + e.oValue.value.length
			return nStart <= nTokenStart && nTokenStart <= nEnd	// Le début du token est dans l'intervalle
				|| nTokenStart <= nStart && nEnd <= nTokenEnd	// L'intervalle est dans le token
				|| nStart <= nTokenEnd && nTokenEnd <= nEnd		// La fin du token est dans l'intervalle
			},
		isWhiteSpace :function( sToken ){
			return ~sWSTokens.indexOf( '|'+sToken+'|' )
			},
		nodeAt :function( nPos, eParent ){
			//initialisation
			eParent = eParent || this.eRoot
			var a = eParent.childNodes
			, nStart = 0, nMiddle, nEnd = a.length-1
			
			// Recherche dichotomique
			if( a.length )
				do{
					nMiddle = Math.round( nStart + ( nEnd - nStart ) / 2 )
					var e = a[nMiddle]
					if( this.isPartOfRange( e, nPos ))
						return e.oValue.bParent ? this.nodeAt( nPos, e ) : e
					else if( nPos < e.oValue.index ) nEnd = nMiddle - 1
					else nStart = nMiddle + 1
				} while ( nStart <= nEnd )
			return null
			},
		removeDeletedNodes :function( nPos, nDeleted ){
			var e = this.nodeAt( nPos, this.eRoot )
			, ePrevious
			, eNext 
			, remove =CallBack( this, function( e ){
				if( e.oValue.bParentLimit || e.parentNode.oValue.bRescan ){
					var eParent = e.parentNode
					ePrevious = eParent.previousSibling
					eNext = eParent.nextSibling
					return remove( eParent )
					}
				ePrevious = e.previousSibling
				eNext = e.nextSibling
				return this.removeToken( e )
				})
			// Efface le premier élément à la position nPos
			if( e ) remove( e )
			// Efface à gauche jusqu'au premier espace trouvé
			while( ePrevious ){
				if( this.isWhiteSpace( ePrevious.oValue.token )) break;
				remove( ePrevious )
				}
			// Efface à droite les éléments inclus dans l'intervalle effacé
			// et efface à droite jusqu'au premier espace trouvé
			while( eNext ){
				if( this.isWhiteSpace( eNext.oValue.token ) && ! this.isPartOfRange( eNext, nPos, nDeleted )) break;
				remove( eNext )
				}
			/* Normalement ePrevious et eNext ont les mêmes parents !!!
			if( ePrevious && eNext && ePrevious.parentNode != eNext.parentNode )
				throw Error( 'Pas le même parent ! final' )
			*/
			return {
				before: ! e ? this.eRoot.lastChild : ePrevious,
				after: eNext
				}
			},
		removeToken :function( e ){
			return e.parentNode.removeChild( e )
			},
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			if( ! nDeleted && ! nAdded ) return false;
			
			this.bIncremental = true
			this.appendNode =function( eNode ){
				if( this.skip( eNode.oValue.token )) return true
				return this.eEndToken && this.eEndToken.parentNode==this.eParent
					? this.eParent.insertBefore( eNode, this.eEndToken )
					: this.eParent.appendChild( eNode )
				}
			
			this.eRoot = eRoot
			this.sText = sSource
			this.previous = Previous()
			var nRootOldLineEnd = eRoot.oValue.lineEnd
			this.nShift = nAdded-nDeleted
			this.nLineShift = this.nLineEnd = null // ! important

			var oScanLimit = this.removeDeletedNodes( nPos, nDeleted )
			, eBefore = oScanLimit.before
			, eParent

			if( eBefore ){
				var o = eBefore.oValue
				eParent = eBefore.parentNode
				this.eEndToken = this.getTokenAfter( eBefore )
				// Calcul de la position courante
				for(var e = eBefore; e.oValue.bParent ; e = e.lastChild );
				this.nPos = e.oValue.index + e.oValue.value.length
				this.nLine = o.token=='NEW_LINE' ? o.lineEnd+1 : o.lineEnd
				// Recherche la valeur du "previous token"...
				for(
					var e = eBefore;
					e && ! this.previous.set( e.oValue.token );
					e = this.getTokenBefore( e )
					);
				}
			else{ // Start from beginning
				eParent = oScanLimit.after ? oScanLimit.after.parentNode : eRoot
				this.eEndToken = oScanLimit.after || eRoot.firstChild
				this.nPos = 0
				this.nLine = 1
				}

			var nLineStart = this.nLine
			
			// Création de la pile des ancêtres
			this.stack = Stack(this)
			this.stack.push( eParent )
			if( eParent!=eRoot )
				for(var e=eParent.parentNode; e; e=e.parentNode ){
					this.stack.unshift( e )
					if( e==eRoot ) break;
					}
			//	console.warn( this.eEndToken, this.eParent, this.sSyntax )
			
			// Analyse lexicale partielle
			while( this.readToken( true ));

			this.updateValues()

			this.eEndToken = this.bIncremental = null
			/* this.nShift = this.nLineShift = null */
			
			return {
				lineStart: nLineStart,
				lineEnd: this.nLineEnd || nRootOldLineEnd,
				lineShift: this.nLineShift || eRoot.oValue.lineEnd - nRootOldLineEnd 
				}
			},
		updateValues :function(){
			if( ! this.nShift || ! this.eEndToken ) return ;

			if( this.nLineShift ){
				// màj un elt + ceux suivants et les enfants des éléments parents
				var update =CallBack( this, function( eFirst ){
					for(var e=eFirst, o ; e ; e=e.nextSibling ){
						if( o=e.oValue ){
							o.index += this.nShift
							o.lineEnd += this.nLineShift
							o.lineStart += this.nLineShift
							if( e.setTitle ) e.setTitle()
							if( e.oValue.bParent ) update( e.firstChild )
							}
						}
					})
			
				update( this.eEndToken )
				for(var e=this.eEndToken.parentNode; e; e=e.parentNode ){
					e.oValue.lineEnd += this.nLineShift
					if( e.setTitle ) e.setTitle()
					if( e == this.eRoot ) break;
					update( e.nextSibling )
					}
				}
			else{
				// màj un elt + ceux suivants et les enfants des éléments parents
				var update =CallBack( this, function( eFirst ){
					for(var e=eFirst, o ; e ; e=e.nextSibling ){
						if( o=e.oValue ){
							o.index += this.nShift
							if( e.setTitle ) e.setTitle()
							if( e.oValue.bParent ) update( e.firstChild )
							}
						}
					})
			
				update( this.eEndToken )
				for(var e=this.eEndToken.parentNode; e; e=e.parentNode ){
					if( e == this.eRoot ) break;
					update( e.nextSibling )
					}
				}
			}
		})
	return Lexer
	}
var OneRegExpLexer =(function( Lexer ){
	Lexer.ID = "OneRegExpLexer"
	Lexer.Rules.makeToken =function( sName, o ){
		o = new RegExp ( o.source, 'g' )
		o.name = sName
		return o
		}
	Lexer.Rules.makeRule =function( sName, sTokens ){
		var aList = sTokens.split('|')
		for( var aRegExp=[], aRules=[], i=0, ni=aList.length, oToken; i<ni; i++ ){
			var ID = aList[i]
			oToken = this.Tokens.list[ ID ]
			if( oToken ){
				aRules.push( oToken )
				aRegExp.push( '('+ oToken.source +')' )
				}
			else{
				var aRule = this.Rules.list[ID]
				if( ! aRule ) throw Error ('Rule "'+ ID +'" Not Found !' )
				aRules = aRules.concat( aRule[0].tokens )
				aRegExp.push( aRule[0].source )
				}
			}
		var oRE = new RegExp ( aRegExp.join('|'), 'g' )
		oRE.sId = sName
		oRE.tokens = aRules
		return [oRE].concat( aRules )
		}
	Lexer.prototype.searchToken =function( oRE ){
		oRE.lastIndex = this.nPos
		var result = oRE.exec( this.sText )
		if( result === null || result.index != this.nPos || ! result[0].length )
			return null

		if( oRE.tokens ){
			/* ONLY FOR DEBUGGING PURPOSES
			if( result.length-1 != oRE.tokens.length ){
				console.warn( result.length , oRE.tokens.length )
				throw Error ( "WARN: no matching parenthesis is allowed in token regexp.\n Required non capturing parenthesis (?:regexp)" )
				}*/
			for(var i=1; result[i]===undefined; i++ );
			if( ! result[i] ) throw Error( 'Internal error' )
			this.sToken = oRE.tokens[i-1].name
			}
		else {
			this.sToken = oRE.name
			}

		return this.previous.validFor( this.sToken )
			? this.sValue = result[0]
			: false
		}
	
	// Analyse par défaut
	;(function(){
		var o = Lexer.Rules
		o.addTokens([
			// Espaces blancs
			['SPACES',/[ ]/],
			['TAB',/\t/],
			['L_NEW_LINE',/\n|\r\n?|\f/],
			['WHITE_SPACES',/[\t \n\r\f]+/],
			// Tout sauf un espaces blancs
			['NOT_WHITE_SPACES',/[^\t \n\r\f]+/],
			['TEXT',/[^\t \n\r\f]+/]
			])
		// Syntaxe par défaut
		o.addRule( 'TXT', 'TAB|L_NEW_LINE|SPACES|TEXT' )
		o.addCSSClass( 'space=SPACES&tab=TAB&linefeed=L_NEW_LINE&whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
		o.setTokensTranslation('L_NEW_LINE=NEW_LINE')
		})();
	
	return Lexer
	})( LexerClass()) 
OneRegExpLexer.insert( function(o){
	;(function(){// SimpleRegexp = Sample test
	o.addTokens([
		['CHARSET',/\[\^?|\]|\-/],
		['PIPE',/\|/],
		['PUNCTUATOR',/\(|\)/],
		['QUANTIFIER1',/\{\d+(?:\,\d*)?\}/],
		['QUANTIFIER2',/\*|\+|\?/],
		['CHAR_ESCAPED',/\\./],
		['ANY',/\./],
		['CHAR',/[^\(\)\\\|\.\[\]\*\+\?\{\-]/]
		])
	o.addRule('SimpleRegExp','CHARSET|PIPE|PUNCTUATOR|QUANTIFIER1|QUANTIFIER2|CHAR_ESCAPED|ANY|CHAR')
	})()
	;(function(){// Common
	o.addTokens([
		['BACKSLASH',/\\/],
		['SINGLE_QUOTE',/'/],
		['DOUBLE_QUOTE',/"/],
		['LBRACE',/\{/],['RBRACE',/\}/],
		['LPAREN',/\(/],['RPAREN',/\)/],
		['LBRACK',/\[/],['RBRACK',/\]/],
		['EQUAL',/\=/],
		['PLUS',/\+/],
		['ELISION',/\,/],
		['DOT',/\./],
		['SEMI',/\;/],
		['QUESTION',/\?/],
		['COLON',/\:/]
		])
	})()
	;(function(){// Number
	o.addTokens([
		['NUMBER',/[\+\-]?(?:(?:[1-9]\d*|0)|(?:0[xX](?:[0-9a-fA-F])+)|(?:0[0-7]+)|(?:0b[01]+)|(?:\d+\.\d*(?:[eE][\+\-]?\d+)?|\.?\d+(?:[eE][\+\-]?\d+)?))/]
		])
	})()
	;(function(){// SUPER SCRIPT
	o.addTokens([['S_PHP', /(?:\<\?(?:php\b|=))/]])
	o.addCSSClass("tag=S_PHP")
	})()
	;(function(){// STRINGS & COMMENTS	
	o.addTokens([
	// STRING
		['L_NEW_LINE_IN_STRING',/\r\n?|\n|\f/],
		['S_SSQ',/'/],['E_SSQ',/'/],['SSQ_IN',/(?:[^'\\\n\r\f \t]|\\[^\n\r\f \t])+/],
		['S_SDQ',/"/],['E_SDQ',/"/],['SDQ_IN',/(?:[^"\\\n\r\f \t]|\\[^\n\r\f \t])+/],
	// COMMENT
		['S_MLC',/\/\*/],['E_MLC',/[^\n\r\f \t]*\*\//],['MLC_IN',/(?:[^\*\n\r\f \t]|\*[^\/\n\r\f \t])+/],
		['S_SLC',/\/\//], ['SLC_IN',/[^\n\r\f \t]+/],
		])
	o.addRules([
		['SSQ','S_PHP|TAB|SPACES|L_NEW_LINE_IN_STRING|SSQ_IN|BACKSLASH|E_SSQ'],
		['SDQ','S_PHP|TAB|SPACES|L_NEW_LINE_IN_STRING|SDQ_IN|BACKSLASH|E_SDQ'],
		['MLC','S_PHP|E_MLC|L_NEW_LINE|TAB|SPACES|MLC_IN'],
		['SLC','S_PHP|TAB|SPACES|SLC_IN|NOT_WHITE_SPACES']
		])
	o.setPreviousTokenOf("L_NEW_LINE_IN_STRING","BACKSLASH")
	o.setTokensTranslation('L_NEW_LINE_IN_STRING=NEW_LINE&SSQ=STRING&S_SSQ=SINGLE_QUOTE&E_SSQ=SINGLE_QUOTE&SDQ=STRING&S_SDQ=DOUBLE_QUOTE&E_SDQ=DOUBLE_QUOTE&MLC=COMMENT&SLC=COMMENT')
	o.addCSSClass([
		'string=SSQ|SDQ',
		'comment=SLC|MLC',
		'linefeed=L_NEW_LINE_IN_STRING'
		])
	})()
	;(function(){// PHP
	o.addTokens([
		['E_PHP',/(?:\?\>)/],
		['PHP_SPECIAL_VARS',/(?:\$(?:GLOBALS|_(?:COOKIE|ENV|FILES|GET|POST|REQUEST|SE(?:RVER|SSION))))\b/],
		['PHP_IDENTIFIER',/\$[\w_][\w\d_]*\b/],
		['PHP_KEYWORD',/\b(?:break|case|continue|declare|default|do|each|elseif|else|foreach|for|goto|if|include|include_once|require|require_once|return|switch|while)\b/],
		['PHP_LITERAL',/\b(?:true|TRUE|false|FALSE|null|NULL)\b/],
		['PHP_RESERVED',/(?:\@|and|or|xor|exception|as|var|class|const|declare|die|echo|empty|eval|exit|extends|function|global|isset|list|new|print|static|unset|use|__FUNCTION__|__CLASS__|__METHOD__|final|interface|implements|extends|public|private|protected|abstract|clone|\$this)\b/],
		['PHP_FUNCTION',/\b\w[\w\d_]*\b/],
		
		['PHP_ARITHMETIC_OP',/\+\+?|\-\-?|\*|\%|\//],
		['PHP_ASSIGNMENT_OP',/\+=|\-=|\*=|\/=|\.=|\%=|\&=|\|=|\^=|<<=|>>=|=>?/],
		['PHP_BITWISE_OP',/&|\||\^|\~|<<|>>/],
		['PHP_COMPARISON_OP',/===?|!==?|<>|<=?|>=?/],
		['PHP_ERROR_CONTROL_OP',/@/],
		['PHP_LOGICAL_OP',/and|or|xor|!|&&|\|\|/],
		['PHP_STRING_OP',/\./],
		['PHP_TYPE_OP',/\((?:int|float|string|array|object|bool)\)/]
		])
	o.addRule( 'PHP',[
		'E_PHP|S_PHP',
		'NUMBER',
		'L_NEW_LINE|SPACES|TAB',
		'S_SLC|S_MLC',
		'PHP_COMPARISON_OP|PHP_ASSIGNMENT_OP|PHP_ARITHMETIC_OP|PHP_LOGICAL_OP|PHP_BITWISE_OP|PHP_ERROR_CONTROL_OP|PHP_STRING_OP|PHP_TYPE_OP',
		'S_SSQ|S_SDQ',
		'ELISION|LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK',
		'DOT|SEMI|COLON|QUESTION',
		'PHP_RESERVED|PHP_LITERAL|PHP_KEYWORD|PHP_SPECIAL_VARS|PHP_FUNCTION|PHP_IDENTIFIER',
		'NOT_WHITE_SPACES'
		].join('|'))
	o.addCSSClass([
		'operator=PHP_UNARY_OP|PHP_LOGICAL_OP|PHP_ARITHMETIC_OP|PHP_ASSIGNMENT_OP|PHP_COMPARISON_OP|PHP_STRING_OP|PHP_ERROR_CONTROL_OP',
		'special=PHP_SPECIAL_VARS',
		'function=PHP_FUNCTION',
		'block=PHP_BRACE',
		'identifier=PHP_IDENTIFIER',
		'keyword=PHP_KEYWORD|PHP_RESERVED',
		'literal=PHP_LITERAL'
		])
	o.setTokensTranslation([
		'PHP_BRACE=BRACE','S_PHP_BRACE=LBRACE','E_PHP_BRACE=RBRACE'
		])
	})()
	;(function(){// JS
	o.addTokens([
		['R_REGULAR_EXPRESSION',/\/(?:(?:[^\n\r\f\*\\\/\[]|(?:\\[^\n\r\f])|(?:\[(?:(?:[^\n\r\f\]\\]|(?:\\[^\n\r\f]))*)\]))(?:(?:[^\n\r\f\\\/\[]|(?:\\[^\n\r\f])|(?:\[(?:(?:[^\n\r\f\]\\]|(?:\\[^\n\r\f]))*)\]))*))\/(?:(?:[a-zA-Z])*)/],
		['REGULAR_EXPRESSION_IN',/[^\t ]+/],
		['JS_IDENTIFIER',/[\$\_a-zA-Z]+[\$_\w\d]*/],
		['JS_KEYWORD',/\b(?:break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)\b/],
		['JS_LITERAL',/\b(?:true|false|null|undefined|Infinity|NaN)\b/],
		['JS_UNARY_OP',/\+\+|\-\-|\~|\!/],
		['JS_ARITHMETIC_OP',/[\+\-\*\%\/]/],
		['JS_LOGICAL_OP',/&&|\|\|/],
		['JS_COMPARISON_OP',/(?:[<>]|[=!]=)=?/],
		['JS_ASSIGNMENT_OP',/=|\*=|\/=|\%=|\+=|\-=|<<=|>>=|>>>=|\&=|\^=|\|=/]
		])
	o.addRule( 'JS',['L_NEW_LINE|SPACES|TAB',
			'JS_KEYWORD|JS_LITERAL|JS_IDENTIFIER',
			'LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK',
			'S_SSQ|S_SDQ|S_MLC|S_SLC',
			'R_REGULAR_EXPRESSION',
			'NUMBER',
			'ELISION|DOT|SEMI|COLON|QUESTION',
			'S_PHP',
			'JS_LOGICAL_OP|JS_COMPARISON_OP|JS_ASSIGNMENT_OP|JS_UNARY_OP|JS_ARITHMETIC_OP',
			'NOT_WHITE_SPACES'
			].join('|'))
	o.addRule( 'REGULAR_EXPRESSION', 'TAB|SPACES|REGULAR_EXPRESSION_IN' )
	o.setPreviousTokenOf("R_REGULAR_EXPRESSION","JS_ARITHMETIC_OP|JS_ASSIGNMENT_OP|JS_COMPARISON_OP|JS_LOGICAL_OP|ELISION|DOT|LPAREN|LBRACE|LBRACK|COLON|SEMI|QUESTION|JS_KEYWORD")
	o.addCSSClass([
		'charset=CHARSET',
		'punctuator=PIPE|PUNCTUATOR',
		'repetition=QUANTIFIER1|QUANTIFIER2',
		'character=CHAR_ESCAPED|ANY|CHAR',
		'operator=JS_UNARY_OP|JS_LOGICAL_OP|JS_ARITHMETIC_OP|JS_ASSIGNMENT_OP|JS_COMPARISON_OP',
		'linefeed=L_NEW_LINE',
		'whitespaces=WHITE_SPACES',
		'tab=TAB',
		'space=SPACES|TAB',
		'undefined=NOT_WHITE_SPACES|BACKSLASH',
		'regexp=R_REGULAR_EXPRESSION',
		'number=NUMBER',
		'block=JS_BRACE',
		'punctuator=ELISION|LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK|DOT|SEMI|QUESTION|COLON',
		'elision=ELISION',
		'identifier=JS_IDENTIFIER',
		'keyword=JS_KEYWORD',
		'literal=JS_LITERAL',
		'tag=S_PHP|E_PHP',
		'php=PHP'
		])
	o.setTokensTranslation([
		'R_REGULAR_EXPRESSION=REGULAR_EXPRESSION',
		'JS_BRACE=BRACE','S_JS_BRACE=LBRACE','E_JS_BRACE=RBRACE'
		])
	})()
	;(function(){// CSS
	o.addTokens([
		['CSS_ERROR',/[^\r\n\f \t\\\[\,\@\#\.\:\+\>\*\~_a-zA-Z\{]+/],
		['S_ATTRIBUTE_SELECTOR',/\[/],
		['E_ATTRIBUTE_SELECTOR',/\]/],
		['ATTRIBUTE_OPERATOR',/[\^$~|*]?=/],
		['ATTRIBUTE_SELECTOR_ERROR',/[^\]\t\n\r\u000b\f          ]/],
		['S_RULE_SET',/\{/],
		['E_RULE_SET',/\}/],
		['S_PROP_VALUE',/:/],
		['E_PROP_VALUE',/;/],
		['CSS_PHP_BUG',/[\-+]|(?:deg|rad|grad|px|cm|mm|in|pt|pc|em|ex|ms|s|hz|khz|%)/],
		['COMBINATOR',/[+>*~]/],
		['ATKEYWORD',/@-?(?:[_a-zA-Z]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*/],
		['NAME',/(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))+/],
		['HASH',/#(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))+/],
		['IDENT',/-?(?:[_a-zA-Z]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*/],
		['CLASS',/\.-?(?:[_a-zA-Z]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*/],
		['S_PSEUDO',/::?/],
		['S_IMPORTANT',/!/],
		['E_IMPORTANT',/important/],
		['CSS_NUMBER',/-?(?:[0-9]+|[0-9]*\.[0-9]+)/],
		['DIMENSIONS',/-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:deg|rad|grad|px|cm|mm|in|pt|pc|em|ex|ms|s|hz|khz|%)(?:\/(?:-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:deg|rad|grad|px|cm|mm|in|pt|pc|em|ex|ms|s|hz|khz|%)))*/],
		['PATH',/(?:[!#$%&\*-\~]|é|\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F])*/],
		['S_URL',/url\(/],
		['E_URL',/\)/],
		['S_FUNCTION',/(?:-?(?:[_a-zA-Z]|é|\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F])(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*)\(/],
		['E_FUNCTION',/\)/],
		['FUNCTION_ARG',/[^\f\r\n \t,)}{]/]
		])
	o.addRules([
		['CSS','S_PHP|L_NEW_LINE|TAB|SPACES|S_MLC|S_ATTRIBUTE_SELECTOR|ELISION|ATKEYWORD|HASH|CLASS|S_PSEUDO|COMBINATOR|IDENT|S_RULE_SET|CSS_ERROR|NOT_WHITE_SPACES'],
		['ATTRIBUTE_SELECTOR','S_SDQ|S_SSQ|IDENT|ATTRIBUTE_OPERATOR|E_ATTRIBUTE_SELECTOR'],
		['RULE_SET','S_PHP|L_NEW_LINE|TAB|SPACES|S_MLC|IDENT|S_PROP_VALUE|E_RULE_SET'],
		['PROP_VALUE','S_PHP|TAB|SPACES|S_MLC|S_SDQ|S_SSQ|DIMENSIONS|CSS_NUMBER|ELISION|S_URL|IDENT|E_PROP_VALUE|S_FUNCTION|HASH|S_IMPORTANT|CSS_PHP_BUG'],
		['PSEUDO','S_FUNCTION|IDENT'],
		['IMPORTANT','L_NEW_LINE|TAB|SPACES|S_MLC|E_IMPORTANT'],
		['URL','L_NEW_LINE|TAB|SPACES|S_SDQ|S_SSQ|E_URL|S_PHP|PATH|S_PHP'],
		['FUNCTION','L_NEW_LINE|TAB|SPACES|ELISION|S_PHP|IDENT|NAME|FUNCTION_ARG|E_FUNCTION|S_PHP']
		])
	o.addCSSClass("punctuator=ELISION|S_RULE_SET|E_RULE_SET|S_PROP_VALUE|E_PROP_VALUE&undefined=CSS_ERROR|ATTRIBUTE_SELECTOR_ERROR&attribute_selector=ATTRIBUTE_SELECTOR&operator=ATTRIBUTE_OPERATOR&ruleset=RULE_SET&value=PROP_VALUE&combinator=COMBINATOR&id=ATKEYWORD|HASH&name=NAME&selector=IDENT&class=CLASS&pseudo=PSEUDO&important=IMPORTANT&number=CSS_NUMBER&dimension=DIMENSIONS&url=URL&url_delimiter=S_URL|E_URL&function=FUNCTION&argument=FUNCTION_ARG")
	o.setTokensTranslation('S_ATTRIBUTE_SELECTOR=LBRACK&E_ATTRIBUTE_SELECTOR=RBRACK&S_RULE_SET=LBRACE&E_RULE_SET=RBRACE&S_PROP_VALUE=COLON&E_PROP_VALUE=SEMI')
	})()
	;(function(){// HTML
	o.addTokens([
		['S_TAG',/</],
		['E_TAG',/>/],
		['S_DOCTYPE',/<\!DOCTYPE/],
		['E_DOCTYPE',/>/],
		['DOCTYPE_IN',/[^\n\r\f \t"'>]+/],
		['CDATA_IN',/(?:[^\n\r\f \t\]]+|\](?:[^\n\r\f \t\]]+|\][^\n\r\f \t\>]+))+/],
		['S_CDATA',/<\!\[CDATA\[/],
		['E_CDATA',/\]\]>/],
	//	['RBRACK',/\]/],
		['S_HTML_COMMENT',/<\!\-\-/],
		['E_HTML_COMMENT',/\-+\-\>/],
		['HTML_COMMENT_IN',/(?:[^\n\r\f \t\-]+|\-(?:[^\n\r\f\-]+|\-[^\n\r\f\>]+))+/],
		['HTML_TEXT',/[^<\r\n\f \t]+/],
		['S_ELT',/[a-zA-Z0-9]*/],
		['S_END_TAG',/<\//],
		['E_END_TAG',/>/],
		['END_ELT',/[^>\n\r\f \t]+/],
		['TAG_ATTR',/[a-zA-Z0-9\-]+/],
		['S_TAG_ATTR_VALUE',/\=/],
		['S_HTML_SSQ',/'/],
		['E_HTML_SSQ',/'/],
		['HTML_SSQ_IN',/[^'\n\r\f \t]+/],
		['S_HTML_SDQ',/"/],
		['E_HTML_SDQ',/"/],
		['HTML_SDQ_IN',/[^"\n\r\f \t]+/],
		['S_HTML_STYLE',/[Ss][Tt][Yy][Ll][Ee]/],
		['S_HTMLStyle',/>/],
		['E_HTMLStyle',/<\/[Ss][Tt][Yy][Ll][Ee]>/],
		['S_HTML_SCRIPT',/[Ss][Cc][Rr][Ii][Pp][Tt]/],
		['S_HTMLScript',/>/],
		['E_HTMLScript',/<\/[Ss][Cc][Rr][Ii][Pp][Tt]>/]
		])
	o.addRules([
		['HTML','S_PHP|L_NEW_LINE|TAB|SPACES|S_HTML_COMMENT|S_CDATA|S_DOCTYPE|S_END_TAG|S_TAG|HTML_TEXT'],
		['TAG','S_HTML_STYLE|S_HTML_SCRIPT|S_ELT|E_TAG'],
		['DOCTYPE','L_NEW_LINE|TAB|SPACES|S_HTML_SDQ|S_HTML_SSQ|DOCTYPE_IN|E_DOCTYPE'],
		['CDATA','S_PHP|L_NEW_LINE|TAB|SPACES|E_CDATA|CDATA_IN|RBRACK'],
		['HTML_COMMENT','L_NEW_LINE|TAB|SPACES|E_HTML_COMMENT|HTML_COMMENT_IN'],
		['ELT','S_PHP|L_NEW_LINE|TAB|SPACES|TAG_ATTR|S_TAG_ATTR_VALUE'],
		['END_TAG','END_ELT|E_END_TAG'],
		['TAG_ATTR_VALUE','S_PHP|L_NEW_LINE|TAB|SPACES|S_HTML_SDQ|S_HTML_SSQ'],
		['HTML_SSQ','S_PHP|TAB|SPACES|L_NEW_LINE|HTML_SSQ_IN|E_HTML_SSQ'],
		['HTML_SDQ','S_PHP|TAB|SPACES|L_NEW_LINE|HTML_SDQ_IN|E_HTML_SDQ'],
		['HTML_STYLE','S_PHP|L_NEW_LINE|TAB|SPACES|TAG_ATTR|S_TAG_ATTR_VALUE|S_HTMLStyle'],
		['HTML_SCRIPT','S_PHP|L_NEW_LINE|TAB|SPACES|TAG_ATTR|S_TAG_ATTR_VALUE|S_HTMLScript'],
		['HTMLStyle','E_HTMLStyle|CSS'],
		['HTMLScript','E_HTMLScript|JS'] // BIG_JS
		])
	o.addCSSClass("html=HTML&elt=ELT|TAG|END_TAG|S_HTMLStyle|E_HTMLStyle|HTML_SCRIPT|S_HTMLScript|E_HTMLScript&doctype=DOCTYPE&cdata=CDATA&punctuator=RBRACK&comment=HTML_COMMENT&attr=TAG_ATTR&value=TAG_ATTR_VALUE&equal=S_TAG_ATTR_VALUE&string=HTML_SSQ|HTML_SDQ&css=HTMLStyle&js=HTMLScript")
	o.setTokensTranslation('S_TAG_ATTR_VALUE=EQUAL&S_HTML_SSQ=SINGLE_QUOTE&E_HTML_SSQ=SINGLE_QUOTE&S_HTML_SDQ=DOUBLE_QUOTE&E_HTML_SDQ=DOUBLE_QUOTE&E_HTMLStyle=END_HTML_STYLE&E_HTMLScript=END_HTML_SCRIPT')
	})()
	;(function(){// INI
	o.addTokens([
		['INI_KEYWORD',/(?:null|yes|no(?:ne)?|true|false|on|off)\b/],
		['INI_VAR',/[^=!;{}"&|^~[\]()\r\n\f \t]+/],
		['INI_TMP',/[^\r\n\f \t;=]/],
		['S_INI_COMMENT',/;/],
		['INI_COMMENT_IN',/[^\r\n\f]+/],
		['S_INI_SECTION',/\[/],
		['E_INI_SECTION',/\]/],
		['INI_SECTION_IN',/[^\r\n\f \t\]]+/],
		['S_INI_VALUE',/\=/],
		['INI_VALUE_IN',/[^\r\n\f \t;"']+/],
		['S_INI_SDQ',/"/],
		['E_INI_SDQ',/"/],
		['INI_SDQ_IN',/(?:[^"\\\r\n\f \t]|\\[^\r\n\f \t])+/],
		['S_INI_SSQ',/'/],
		['E_INI_SSQ',/'/],
		['INI_SSQ_IN',/[^'\r\n\f \t]+/ ]
		])
	o.addRules([
		['INI', 'S_INI_SECTION|S_INI_COMMENT|INI_KEYWORD|INI_VAR|S_INI_VALUE|SPACES|TAB|L_NEW_LINE|INI_TMP'],
		['INI_COMMENT', 'INI_COMMENT_IN|SPACES|TAB'],
		['INI_SECTION', 'INI_SECTION_IN|E_INI_SECTION|SPACES|TAB'],
		['INI_VALUE', 'S_INI_SDQ|S_INI_SSQ|INI_VALUE_IN|SPACES|TAB'],
		['INI_SDQ', 'INI_SDQ_IN|E_INI_SDQ|SPACES|TAB'],
		['INI_SSQ', 'INI_SSQ_IN|E_INI_SSQ|SPACES|TAB|L_NEW_LINE']
		])
	o.addCSSClass("keyword=INI_KEYWORD&var=INI_VAR&undefined=INI_TMP&comment=INI_COMMENT&section=INI_SECTION_IN&value=INI_VALUE&punctuator=S_INI_VALUE&string=INI_SDQ|INI_SSQ")
	o.setTokensTranslation('INI_COMMENT=COMMENT&INI_SECTION_IN=SECTION_PART&INI_VALUE=VALUES&S_INI_VALUE=OPERATOR&INI_SDQ=STRING&INI_SSQ=STRING')
	})()
	;(function(){// ZenLike
	o.addTokens([
		['ELT',/[$@a-zA-Z\-_0-9]+/],
		['ELTID',/\#[$@a-zA-Z\-_0-9]+/],
		['ELTCLASS',/\.[$@a-zA-Z\-_0-9]+/],
		['MULTIPLICATION',/\*\d+/],
	//	['SPACES',/[ \t]+/],
		['ARGUMENT_PREFIX',/\:/],
		['GTHAN',/\>/],
		['UP',/\^+/],
		['S_SNIPPET_SSQ',/'/],
		['E_SNIPPET_SSQ',/'/],
		['SNIPPET_SSQ_IN',/(?:[^'\\\n\r\f]|\\[^\n\r\f])+/],
		['S_SNIPPET_SDQ',/"/],
		['E_SNIPPET_SDQ',/"/],
		['SNIPPET_SDQ_IN',/(?:[^"\\\n\r\f]|\\[^\n\r\f])+/]
		])
	o.addRules([
		['ZEN','ELT|ELTID|ELTCLASS|LPAREN|RPAREN|LBRACK|RBRACK|EQUAL|MULTIPLICATION|NUMBER|SPACES|ARGUMENT_PREFIX|PLUS|GTHAN|UP|S_SNIPPET_SSQ|S_SNIPPET_SDQ'],
		['SNIPPET_SSQ','SNIPPET_SSQ_IN|E_SNIPPET_SSQ'],
		['SNIPPET_SDQ','SNIPPET_SDQ_IN|E_SNIPPET_SDQ']
		])
	o.addCSSClass("elt=ELT&id=ELTID&className=ELTCLASS&multiplication=MULTIPLICATION&punctuator=ARGUMENT_PREFIX|LPAREN|RPAREN|LBRACK|EQUAL|RBRACK&operator=PLUS|GTHAN|UP&space=SPACES|TAB&string=SNIPPET_SSQ|SNIPPET_SSQ_IN|SNIPPET_SDQ|SNIPPET_SDQ_IN")
	o.setTokensTranslation('SNIPPET_SSQ=STRING&SNIPPET_SSQ_IN=STRING&SNIPPET_SDQ=STRING&SNIPPET_SDQ_IN=STRING')
	})()
	})


	var nLineIndex, nShift
	var getLine =function( eParent, nLine ){
		if( ! eParent ) return ''
		var s = getHTMLStart.call( this, eParent.oValue, bNoTitle )
		var a = eParent.getElementsByLine( nLine )
		if( a[0] && a[0].previousSibling && a[0].previousSibling.oValue.token=='NEW_LINE' || eParent==this.oRootNode ){
			nLineIndex = a[0] ? a[0].oValue.index : 0
			nShift = 0
			}
		for(var i=0, eNode; eNode=a[i]; i++){
			var o = eNode.oValue
			s += ( eNode.hasChildNodes()
					? getLine.call( this, eNode, nLine )
					: getHTMLStart.call( this, o, bNoTitle ) + replaceSpecialHTML( o.value ) + getHTMLEnd()
					)
			}
		return s + getHTMLEnd()
		}
	var getLines =function( nLineStart, nLineEnd ){
		var a=[]
		for(var i=nLineStart; i<=nLineEnd; i++ ) a.push( getLine.call( this, this.oRootNode, i ))
	//	console.info( JSON.stringify( a ))
		return a
		}

	var Syntax =function( D ){
		var sSource = D.oSource.getValue()
		this.D = D
		this.oRootNode = Syntax.Lexer( sSource, D.sSyntax )
		}
	Syntax.Lexer = OneRegExpLexer // AutomatonLexer
	Syntax.prototype ={
		getElementsByLine :function( nLine ){
			return this.oRootNode.getElementsByLine( nLine )
			},
		getElementsByTagName :function( sNodeName ){
			return this.oRootNode.getElementsByTagName( sNodeName )
			},
		getLine :function( nLine ){
			return getLine.call( this, this.oRootNode, nLine )
			},
		getLines :function( nLineStart, nLineEnd ){
			return getLines.call( this, nLineStart, nLineEnd )
			},
		getContents :function(){
			return getLines.call( this, 1, this.oRootNode.oValue.lineEnd )
			},
		update :function(){
		//	console.info( this.oRootNode )
			var o = this.D.oUpdates
			, oResult = Syntax.Lexer.rescan(
				this.oRootNode, 
				this.D.oSource.getValue(),
				o.nIndex,
				o.oDeleted.text.length,
				o.oAdded.text.length
				)
			o.nLineShift = oResult.lineShift
			o.nLineStart = oResult.lineStart
			o.nLineEnd = oResult.lineEnd
			}
		}
	return Syntax
	})())