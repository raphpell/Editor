Editor.addModule('Fold',(function(){
	Editor.oDefaultSettings.bFold = 1
	var _={
		foldLevel :( nLevel )=>{ return (E,D,C,S)=> D.oFold.foldLevel( nLevel ) },
		unfoldLevel :( nLevel )=>{ return (E,D,C,S)=> D.oFold.unfoldLevel( nLevel ) }
		}
	Editor.extend( 'Commands', {
		FOLD_ALL :_.foldLevel(0),
		FOLD_LEVEL_1 :_.foldLevel(1),
		FOLD_LEVEL_2 :_.foldLevel(2),
		FOLD_LEVEL_3 :_.foldLevel(3),
		FOLD_LEVEL_4 :_.foldLevel(4),
		FOLD_LEVEL_5 :_.foldLevel(5),
		FOLD_LEVEL_6 :_.foldLevel(6),
		FOLD_LEVEL_7 :_.foldLevel(7),
		FOLD_LEVEL_8 :_.foldLevel(8),
		UNFOLD_ALL :_.unfoldLevel(0),
		UNFOLD_LEVEL_1 :_.unfoldLevel(1),
		UNFOLD_LEVEL_2 :_.unfoldLevel(2),
		UNFOLD_LEVEL_3 :_.unfoldLevel(3),
		UNFOLD_LEVEL_4 :_.unfoldLevel(4),
		UNFOLD_LEVEL_5 :_.unfoldLevel(5),
		UNFOLD_LEVEL_6 :_.unfoldLevel(6),
		UNFOLD_LEVEL_7 :_.unfoldLevel(7),
		UNFOLD_LEVEL_8 :_.unfoldLevel(8)
		})
	Editor.extend( 'KeyBoard', {
		'ALT+SHIFT+F': (E,D)=> D.oFold.toggle(),
		'ALT+0': 'FOLD_ALL',
		'ALT+1': 'FOLD_LEVEL_1',
		'ALT+2': 'FOLD_LEVEL_2',
		'ALT+3': 'FOLD_LEVEL_3',
		'ALT+4': 'FOLD_LEVEL_4',
		'ALT+5': 'FOLD_LEVEL_5',
		'ALT+6': 'FOLD_LEVEL_6',
		'ALT+7': 'FOLD_LEVEL_7',
		'ALT+8': 'FOLD_LEVEL_8',
		'ALT+SHIFT+0': 'UNFOLD_ALL',
		'ALT+SHIFT+1': 'UNFOLD_LEVEL_1',
		'ALT+SHIFT+2': 'UNFOLD_LEVEL_2',
		'ALT+SHIFT+3': 'UNFOLD_LEVEL_3',
		'ALT+SHIFT+4': 'UNFOLD_LEVEL_4',
		'ALT+SHIFT+5': 'UNFOLD_LEVEL_5',
		'ALT+SHIFT+6': 'UNFOLD_LEVEL_6',
		'ALT+SHIFT+7': 'UNFOLD_LEVEL_7',
		'ALT+SHIFT+8': 'UNFOLD_LEVEL_8'
		})

	var Range =function( m2/* nLineEnd|sError */, nLevel ){
		var a = [m2,nLevel]
		a.toString =function(){ return a[0]+'|'+a[1] }
		return a
		}
	, _highlight=function( a, s ){
		if( a ){
			if( a[2]) Tag.className( a[2], 'in', s )
			if( a[3]) Tag.className( a[3], 'in', s )
			}
		}
	, _actionGroup =function( sAction ){ // fold | unfold
		return function( nLevel ){
			var D=this.oDocument, V=D.oView, S = D.oSelection
			, a=this.aBuffer, i=1, ni=a.length
			if( D.oFold.bVisible ){
				if( nLevel ){
					for(; i<ni; i++ )
						if( a[i] && nLevel==a[i][1])
							this[ sAction ]( i, false )
					}
				else
					for(; i<ni; i++ )
						if( a[i])
							this[ sAction ]( i, false )
				V.refresh()
				var f = V[ sAction=='fold'?'onhide':'onshow']
				if( f ) f()
				D.oTextZoneControl.refresh()
				if( S.exist()) S.set( S.start, S.end )
				}
			}
		}
	, _actionSingle =function( sAction ){ // hideRange | showRange
		return function( nFoldID, bWithoutFlow ){
			var m = this.aBuffer[ nFoldID ]
			if( m && m[1]){
				var D=this.oDocument
				D.oView[ sAction ]( nFoldID+1, m[0], bWithoutFlow )
				if( ! bWithoutFlow ) D.oTextZoneControl.refresh()
				}
			}
		}
	, _refreshDim =function(){
		var D=this.oDocument, o=this.e.style
		o.left = D.Padding.get('left')-this.nWidth-2 +'px'
		o.height = D.oView.nLinesHeight +'px'
		o.width = this.nWidth +'px'
		}
	, _refreshHBarDim =function(){
		var D=this.oDocument, Ch=D.oCharacter
		, sWidth = D.nLinesMaxWidth +'px'
		CssRules.add( '.editor .fold DIV { width: '+sWidth+' !important; }' )
		}
	, _refreshControlPointDim =function(){
		var D=this.oDocument, Ch=D.oCharacter
		, nHeight = Math.max( 0, Ch.nWidth )
		, sDim = nHeight +'px'
		, sLineHeight = nHeight*3/4 +'px'
		, sLeft = Math.floor( Ch.nWidth/2-1 ) +'px'
		CssRules.add(
			'.editor .fold DT { left:'+ sLeft +';height:'+ sDim +';line-height:'+ sLineHeight +';width:'+ sDim +'; }'+
			'.editor .fold DD { width:'+ sDim +'; }' )
		}
		
	var F =function( D ){
		this.oDocument = D
		this.aBuffer = []
		this.e = D.eTZC.appendChild( Tag( 'DIV', { className:'fold', innerHTML:'<DL></DL>' }))
		Events.preventSelection( true, this.e )
		Events.add(
			this.e, 'mousedown', ( evt )=>{
				var e = Events.element(evt)
				if( e.nodeName=='DIV' ) this.unfold( e.previousSibling )
				if( e.nodeName=='DT' ){
					switch( e.innerHTML ){
						case '-':this.fold( e.nFoldID )
							break;
						case '+':this.unfold( e.nFoldID )
							break;
					//	default:throw new Error ( e.title )
						}
					}
				// Needed tant que 'e' n'a plus de parent (il est effacé!)
				setTimeout( function(){ D.oEditor.focus()}, 50 )
				}
			,D
				,'update', ()=> this.getBrackets()
				,'layout', ()=>{
					if( this.bVisible ){
						_refreshDim.call( this )
						_refreshHBarDim.call( this )
						this.refresh()
						}
					}
			,D.oCaret, 'change', ()=>{
				if( this.bVisible ) this.highlight()
				}
			,D.oCharacter, 'sizechange', ()=>{
				var b = this.bVisible
				if( b ){
					D.Padding.add( 'left', -this.nWidth )
					this.bVisible = false
					}
				_refreshControlPointDim.call( this )
				this.nWidth = D.oCharacter.nWidth*2
				D.oView.refresh()
				if( ! this.bInitialized || b ) this.show()
				}
			)
		}
	F.prototype={
		aBuffer: null,
		aPaired:[
			['S_PHP','E_PHP'],
			['LBRACE','RBRACE'],
			['LBRACK','RBRACK'],
			['S_MLC','E_MLC'],
			['S_HTML_SCRIPT','END_HTML_SCRIPT'],
			['S_HTML_STYLE','END_HTML_STYLE'],
			['S_HTML_COMMENT','E_HTML_COMMENT'],
			['S_ELT','END_ELT', 'value', 'META|IMG|LINK|BR|HR|INPUT' ]	// oValue.value , excluded values
			],
		bInitialized: false,
		bVisible: false,
		nCurrentFoldID: -1,
		nWidth:0,
		highlight :function(){
			var a=this.aBuffer, nLine=this.oDocument.oCaret.position.line, nFoldID=-1
			if( ! a ) return;
			for(var i=1, ni=a.length; i<ni ; i++ ){
				var m=a[i]
				if( ! m || ! m[1] || nLine<i || m[0]<nLine ) continue;
				if( nLine<=m[0] ) nFoldID = i
				}
			_highlight( a[this.nCurrentFoldID], 'delete' )
			_highlight( a[nFoldID], 'add' )
			this.nCurrentFoldID = nFoldID
			},
		// TODO: à optimiser impérativement
		getBrackets :function(){
			if( ! this.bVisible ) return;
			var D=this.oDocument, V=D.oView, Sy=D.oSyntax, o=D.oUpdates
			if( o ){
				// Affiche une ligne caché : utile lors de l'édition quand le curseur est dans un bloque replié
				var nLine=D.oCaret.position.line
				if( ! V.isLineVisible( nLine )) V.showLine( nLine )
				}
			var aBefore = this.aBuffer
			, aBuffer = []
			, _populate =function( sLPair, sRPair, aNodes ){
				var aLPAIR = [], n1, n2, bHidden, oRange
				aNodes.sortBy( 'oValue.index' )
				for(var j=0, oNode; oNode=aNodes[j]; j++ ){
					if( oNode.nodeName==sLPair ) aLPAIR.push( oNode )
					else if( aLPAIR.length ){
						n1 = aLPAIR.pop().oValue.lineStart
						n2 = oNode.oValue.lineStart
						if( n1==n2 || ( aBuffer[n1] && aBuffer[n1][0]>n2)) continue;
						aBuffer[n1] = Range( n2, 1 )
						// Marquage des intervalles pouvant-être réaffichés
						if( bHidden = V.isHiddenRange( n1+1, n2 ))
							V.aHiddenRanges[ bHidden-1 ][2] = true 
						// recup du buffer
						if( aBefore[n1]){
							aBuffer[n1][2] = aBefore[n1][2]
							aBuffer[n1][3] = aBefore[n1][3]
							}
						}
					else aBuffer[oNode.oValue.lineStart] = Range( sLPair +' ?', 0 )
					}
				for(var j=0, oNode; oNode=aLPAIR[j]; j++ )
					aBuffer[oNode.oValue.lineStart] = Range( sRPair +' ?', 0 )
				}
			if( Sy && Sy.getElementsByTagName ){
				var f=function( s ){ return to_array( Sy.getElementsByTagName( s ))}
				// Marque à faux tous les intervalles. sera égale aux intervalles sans point de controle
				for(var i=0, a; a=V.aHiddenRanges[i]; i++ ) a[2] = false
				// Recherche les paires
				for(var i=0; aPair=this.aPaired[i]; i++ ){
					var sAttr=aPair[2], sLPair=aPair[0], sRPair=aPair[1]
					if( ! sAttr ) _populate( sLPair, sRPair, Array.merge( f(sLPair), f(sRPair)))
					else{
						var aNodesGroup = [], oGroup = {}
						var a = Array.merge( f(sLPair), f(sRPair))
						for(var j=0; e=a[j]; j++ ){
							var sGroup = e.oValue[ sAttr ].toUpperCase()
							if( aPair[3].indexOf( sGroup ) > -1 ) continue;
							if( ! oGroup[ sGroup ]){
								oGroup[ sGroup ] = []
								aNodesGroup.push( sGroup )
								}
							oGroup[ sGroup ].push( e )
							}
						for(var j=0, nj=aNodesGroup.length; j<nj; j++ )
							_populate( sLPair, sRPair, oGroup[ aNodesGroup[j] ])
						}
					}
				// Affiche les intervalles ne pouvant plus être réaffiché
				for(var i=0, a; a=V.aHiddenRanges[i]; i++ ) if( ! a[2]) V.showRange( a[0], a[1])
				// Calcul du "Level"
				var a1, a2
				for(var i=0, ni=aBuffer.length; i<ni; i++ ){
					if( (a1=aBuffer[i]) && a1[1])
						for(var j=i+1; j<ni; j++ )
							if( (a2=aBuffer[j]) && a2[1]){
								if( j>=a1[0]) break;
								// Mise à jour du "Level"
								if( i<=j && a2[0]<=a1[0]) a2[1]=a1[1]+1
								}
					}
				}
			this.aBuffer = aBuffer
			// Met à jour l'affichage si et seulement si il diffère
			if( aBefore.toString() != this.aBuffer.toString()) this.refresh()
			},
		refresh :function(){ // TODO : éviter les calcul inutile lors de l'édition
			var D=this.oDocument, C=D.oCaret, Ch=D.oCharacter, eParent=this.e, V=D.oView, F=this
			var eParent = this.e.removeChild( this.e.firstChild )
			// 1- Efface les éléments
		//	while( eParent.childNodes.length ) eParent.removeChild( eParent.firstChild )
			eParent.innerHTML= ''
			var nVAlign = (Ch.nHeight-Ch.nWidth)/2-1
			, _markError =function( nLine, sError ){
				var n = V.getLine( nLine )
				if( n ){
					this.aBuffer[ nLine ][2] = eParent.appendChild( Tag('DT', { title:sError, className:'error', style:{
						top: (n-1)*Ch.nHeight +nVAlign+'px'
						}}))
					}
				}
			for(var i=1, ni=this.aBuffer.length; i<ni ; i++ ){
				var m=this.aBuffer[i]
				if( ! m ) continue;
				if( ! m[1]){
					_markError.call( this, i, m[0] )
					continue;
					}
				var n1=i, n2=m[0], n1ViewLine=V.getLine(n1)
				if( ! n1ViewLine || n2<V.nLineStart || V.nLineEnd<n1 ) continue ;
				var bHidden = V.isHiddenRange( n1+1, n2 )
				, sTop = (n1ViewLine-1)*Ch.nHeight +nVAlign+'px'
				
				// POINT DE CONTRÔLE DE L'INTERVALLE
				if( ! m[2] || ! m[2].nFoldID ) m[2]=Tag('DT')
				m[2].innerHTML = bHidden?'+':'-'
				m[2].nFoldID = i
				m[2].style.top = sTop
				// LIGNE HORIZONTALE
			 	if( bHidden ){
					if( ! m[3] || m[3].nodeName != 'DIV' ) m[3]=Tag('DIV')
					var o = m[3].style
					o.top = n1ViewLine*Ch.nHeight +'px'
					o.left = F.nWidth +'px'
					}
				// LIGNE VERTICALE
				else{
					if( ! m[3] || m[3].nodeName != 'DD' ) m[3]=Tag('DD')
					var o = m[3].style
					o.top = sTop
					o.height = (V.getLine(n2)-n1ViewLine+0.5)*Ch.nHeight-nVAlign +'px'
					o.left = Ch.nWidth-1 +'px'
					o.zIndex = m[1]
					}
				eParent.appendChild( m[2])
			 	eParent.appendChild( m[3])
				}
			_refreshHBarDim.call( this )
			this.highlight()
			this.e.appendChild( eParent )
			// Replace le curseur : utile lors de l'ouverture d'un bloque au dessus du curseur
			if( ! D.oUpdates ) C.setIndex( C.position.index, 'noScrollToPosition' )
			},
		fold :_actionSingle('hideRange'),
		foldLevel :_actionGroup('fold'),
		unfold :_actionSingle('showRange'),
		unfoldLevel :_actionGroup('unfold'),
		toggle: function(){
			this[ this.bVisible?'hide':'show' ]()
			},
		hide: function(){
			var D=this.oDocument, C=D.oCaret
			if( this.bVisible ) D.Padding.add( 'left', -this.nWidth )
			D.oEditor.execCommand('UNFOLD_ALL')
			this.bVisible = !( this.e.style.display="none" )
			C.refresh()
			},
		show: function(){
			this.bInitialized = true
			var D=this.oDocument
			if( ! this.bVisible ) D.Padding.add('left', this.nWidth )
			this.bVisible = !( this.e.style.display="" )
			this.getBrackets() // important pour l'initialisation
			 _refreshDim.call( this )
			this.refresh()
			D.oTextZoneControl.oTextZone.refresh()
			}
		}
	
	var newinstance =function( bShow ){
		return function( D ){
			if( D.oFold ) D.oFold.hide()
			D.oFold = new F(D)
			if( bShow ){
				D.bFold = 1
				D.oFold.show()
				if( D.oEditor.oActiveDocument==D ) D.refreshView()
				}
			else if( ! D.bFold )
				D.oFold.bInitialized = true
			}
		}
	Events.add( Editor.prototype, 'documentinit', newinstance(1))
	Editor.mapDocuments( newinstance('show') )
	return F
	})())