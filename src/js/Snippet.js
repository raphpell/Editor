Editor.addModule('Snippet',(function(){
	var oModuleSyntax = Editor.Strategies.Highlighting.get('Syntax')
	if( ! oModuleSyntax ) return
	var Scanner =function( sSnippet ){
		return to_array( oModuleSyntax.Lexer( sSnippet, 'ZEN' ).childNodes )
		}
	var Parser =(function(){
		var EPSILON = '&epsilon;'
		var ENGINE ={
			START:"s1",
			END:"END_TOKENS",
			SYMBOLS:{"ARGUMENT_PREFIX":1,"ELT":2,"ELTCLASS":3,"ELTID":4,"EQUAL":5,"GTHAN":6,"LBRACK":7,"LPAREN":8,"MULTIPLICATION":9,"NUMBER":10,"PLUS":11,"RBRACK":12,"RPAREN":13,"STRING":14,"TEXT":15,"UP":16,"ZEN":17,"INSTRUCTION":18,"REPEAT":19,"GROUPING":20,"DEFINITION":21,"ARGS":22,"ATTRS":23,"ATTR":24,"CATTRS":25,"CATTR":26,"VALUE":27,"END_TOKENS":28},
			PRODUCTIONS:{1:["ZEN",["INSTRUCTION"]],2:["ZEN",["REPEAT"]],3:["INSTRUCTION",["REPEAT","GTHAN","ZEN"]],4:["INSTRUCTION",["REPEAT","PLUS","ZEN"]],5:["INSTRUCTION",["REPEAT","UP","ZEN"]],6:["REPEAT",["GROUPING","MULTIPLICATION"]],7:["REPEAT",["GROUPING"]],8:["GROUPING",["ELT"]],9:["GROUPING",["ELT","DEFINITION"]],10:["GROUPING",["ELT","DEFINITION","TEXT"]],11:["GROUPING",["ELT","TEXT"]],12:["GROUPING",["TEXT"]],13:["GROUPING",["LPAREN","RPAREN"]],14:["GROUPING",["LPAREN","ZEN","RPAREN"]],15:["DEFINITION",["ARGS","ATTRS"]],16:["DEFINITION",["ARGS"]],17:["DEFINITION",["ATTRS"]],18:["DEFINITION",["ATTRS","ARGS"]],19:["ARGS",["ARGS","ARGUMENT_PREFIX","VALUE"]],20:["ARGS",["ARGUMENT_PREFIX","VALUE"]],21:["ATTRS",["ATTRS","ATTR"]],22:["ATTRS",["ATTR"]],23:["ATTR",["ELTID"]],24:["ATTR",["ELTCLASS"]],25:["ATTR",["LBRACK","CATTRS","RBRACK"]],26:["CATTRS",["CATTRS","CATTR"]],27:["CATTRS",["CATTR"]],28:["CATTR",["ELT","EQUAL","VALUE"]],29:["CATTR",["ELT"]],30:["VALUE",["ELT"]],31:["VALUE",["STRING"]],32:["VALUE",["NUMBER"]]},
			MATRICE:{1:[,,'s6',,,,,,'s8',,,,,,,'s7',,'g2','g3','g4','g5'],2:[,,,,,,,,,,,,,,,,,,,,,,,,,,,,'a'],3:[,,,,,,,,,,,,,'r1',,,,,,,,,,,,,,,'r1'],4:[,,,,,,'s9',,,,,'s10',,'r2',,,'s11',,,,,,,,,,,,'r2'],5:[,,,,,,'r7',,,'s12',,'r7',,'r7',,,'r7',,,,,,,,,,,,'r7'],6:[,'s17',,'s20','s19',,'r8','s21',,'r8',,'r8',,'r8',,'s14','r8',,,,,'g13','g15','g16','g18',,,,'r8'],7:[,,,,,,'r12',,,'r12',,'r12',,'r12',,,'r12',,,,,,,,,,,,'r12'],8:[,,'s6',,,,,,'s8',,,,,'s22',,'s7',,'g23','g3','g4','g5'],9:[,,'s6',,,,,,'s8',,,,,,,'s7',,'g24','g3','g4','g5'],10:[,,'s6',,,,,,'s8',,,,,,,'s7',,'g25','g3','g4','g5'],11:[,,'s6',,,,,,'s8',,,,,,,'s7',,'g26','g3','g4','g5'],12:[,,,,,,'r6',,,,,'r6',,'r6',,,'r6',,,,,,,,,,,,'r6'],13:[,,,,,,'r9',,,'r9',,'r9',,'r9',,'s27','r9',,,,,,,,,,,,'r9'],14:[,,,,,,'r11',,,'r11',,'r11',,'r11',,,'r11',,,,,,,,,,,,'r11'],15:[,'s29',,'s20','s19',,'r16','s21',,'r16',,'r16',,'r16',,'r16','r16',,,,,,,'g28','g18',,,,'r16'],16:[,'s17',,'s20','s19',,'r17','s21',,'r17',,'r17',,'r17',,'r17','r17',,,,,,'g30',,'g31',,,,'r17'],17:[,,'s33',,,,,,,,'s35',,,,'s34',,,,,,,,,,,,,'g32'],18:[,'r22',,'r22','r22',,'r22','r22',,'r22',,'r22',,'r22',,'r22','r22',,,,,,,,,,,,'r22'],19:[,'r23',,'r23','r23',,'r23','r23',,'r23',,'r23',,'r23',,'r23','r23',,,,,,,,,,,,'r23'],20:[,'r24',,'r24','r24',,'r24','r24',,'r24',,'r24',,'r24',,'r24','r24',,,,,,,,,,,,'r24'],21:[,,'s38',,,,,,,,,,,,,,,,,,,,,,,'g36','g37'],22:[,,,,,,'r13',,,'r13',,'r13',,'r13',,,'r13',,,,,,,,,,,,'r13'],23:[,,,,,,,,,,,,,'s39'],24:[,,,,,,,,,,,,,'r3',,,,,,,,,,,,,,,'r3'],25:[,,,,,,,,,,,,,'r4',,,,,,,,,,,,,,,'r4'],26:[,,,,,,,,,,,,,'r5',,,,,,,,,,,,,,,'r5'],27:[,,,,,,'r10',,,'r10',,'r10',,'r10',,,'r10',,,,,,,,,,,,'r10'],28:[,,,'s20','s19',,'r15','s21',,'r15',,'r15',,'r15',,'r15','r15',,,,,,,,'g31',,,,'r15'],29:[,,'s33',,,,,,,,'s35',,,,'s34',,,,,,,,,,,,,'g40'],30:[,'s29',,,,,'r18',,,'r18',,'r18',,'r18',,'r18','r18',,,,,,,,,,,,'r18'],31:[,'r21',,'r21','r21',,'r21','r21',,'r21',,'r21',,'r21',,'r21','r21',,,,,,,,,,,,'r21'],32:[,'r20',,'r20','r20',,'r20','r20',,'r20',,'r20',,'r20',,'r20','r20',,,,,,,,,,,,'r20'],33:[,'r30','r30','r30','r30',,'r30','r30',,'r30',,'r30','r30','r30',,'r30','r30',,,,,,,,,,,,'r30'],34:[,'r31','r31','r31','r31',,'r31','r31',,'r31',,'r31','r31','r31',,'r31','r31',,,,,,,,,,,,'r31'],35:[,'r32','r32','r32','r32',,'r32','r32',,'r32',,'r32','r32','r32',,'r32','r32',,,,,,,,,,,,'r32'],36:[,,'s38',,,,,,,,,,'s41',,,,,,,,,,,,,,'g42'],37:[,,'r27',,,,,,,,,,'r27'],38:[,,'r29',,,'s43',,,,,,,'r29'],39:[,,,,,,'r14',,,'r14',,'r14',,'r14',,,'r14',,,,,,,,,,,,'r14'],40:[,'r19',,'r19','r19',,'r19','r19',,'r19',,'r19',,'r19',,'r19','r19',,,,,,,,,,,,'r19'],41:[,'r25',,'r25','r25',,'r25','r25',,'r25',,'r25',,'r25',,'r25','r25',,,,,,,,,,,,'r25'],42:[,,'r26',,,,,,,,,,'r26'],43:[,,'s33',,,,,,,,'s35',,,,'s34',,,,,,,,,,,,,'g44'],44:[,,'r28',,,,,,,,,,'r28']},
			AST:function( sProd, LHS, RHS ){
				var f =function ( esuParent, aeChild ){
					var e = ! esuParent
						? document.createDocumentFragment()
						:( esuParent.appendChild ? esuParent : document.createElement( esuParent ) 
						)
					if( ! e.className ) e.className = 'myNode'
					if( ! e.title ) e.title = e.nodeName
					if( aeChild.constructor==Array ){
						for(var i=0, ni=aeChild.length; i<ni; i++ )
							if( aeChild[i]) e.appendChild( aeChild[i])
						}
					else e.appendChild( aeChild )
					return e
					}
				var g =function( eParent ){
					eParent.firstChild.oValue.value = ''
					return eParent.childNodes.length == 3
						? eParent.firstChild.nextSibling
						: eParent.firstChild
					}
				switch( sProd ){
					case "(0) ZEN' -> ZEN END_TOKENS":
					case "(1) ZEN -> INSTRUCTION":
					case "(2) ZEN -> REPEAT":
						return RHS[0].nodeType!=11 
							? f( document.createDocumentFragment(), RHS[0])
							: RHS[0]
					case "(3) INSTRUCTION -> REPEAT GTHAN ZEN":
						if( RHS[0].nodeName!='MULTIPLICATION') return f( RHS[0], RHS[2])
						f( RHS[0].lastChild, RHS[2])
						return RHS[0]
					case "(4) INSTRUCTION -> REPEAT PLUS ZEN": return f( null, [RHS[0],RHS[2]])
					case "(5) INSTRUCTION -> REPEAT UP ZEN": return f( null, RHS )
					case "(6) REPEAT -> GROUPING MULTIPLICATION": return f( RHS[1], RHS[0])
					case "(7) REPEAT -> GROUPING": return RHS[0];
					case "(8) GROUPING -> ELT": return RHS[0];
					case "(9) GROUPING -> ELT DEFINITION": return f( RHS[0], RHS[1])
					case "(10) GROUPING -> ELT DEFINITION TEXT": return f( RHS[0], [ RHS[1], g( RHS[2]) ])
					case "(11) GROUPING -> ELT TEXT": return f( RHS[0], g( RHS[1]) )
					case "(12) GROUPING -> TEXT": return g( RHS[0])
					case "(13) GROUPING -> LPAREN RPAREN": return null
					case "(14) GROUPING -> LPAREN ZEN RPAREN": return RHS[1]
					case "(15) DEFINITION -> ARGS ATTRS": return f( null, [ f('ARGUMENTS',RHS[0]), f('ATTRIBUTES',RHS[1])])
					case "(16) DEFINITION -> ARGS": return f('ARGUMENTS', RHS[0])
					case "(17) DEFINITION -> ATTRS": return f('ATTRIBUTES', RHS[0])
					case "(18) DEFINITION -> ATTRS ARGS": return f( null, [ f('ARGUMENTS',RHS[1]), f('ATTRIBUTES',RHS[0])])
					case "(19) ARGS -> ARGS ARGUMENT_PREFIX VALUE": return f( null, [RHS[0],RHS[2]])
					case "(20) ARGS -> ARGUMENT_PREFIX VALUE": return RHS[1]
					case "(21) ATTRS -> ATTRS ATTR": return f( null, RHS )
					case "(22) ATTRS -> ATTR":
					case "(23) ATTR -> ELTID":
					case "(24) ATTR -> ELTCLASS": return RHS[0];
					case "(25) ATTR -> LBRACK CATTRS RBRACK": return RHS[1]
					case "(26) CATTRS -> CATTRS CATTR": return f( null, RHS )
					case "(27) CATTRS -> CATTR": return RHS[0];
					case "(28) CATTR -> ELT EQUAL VALUE": return f( RHS[0], RHS[2])
					case "(29) CATTR -> ELT": return RHS[0];
					case "(30) VALUE -> ELT": return RHS[0];
					case "(31) VALUE -> STRING": return g( RHS[0])
					case "(32) VALUE -> NUMBER": return RHS[0];
					}
				}
			}
		var ParserLR =function( aTokens, ENGINE ){
			aTokens.push( ParserLR.Node( ENGINE.END ))
			var aStack = [ ENGINE.START ]
			, aSymbols = [ ]
			, TreeBuilder = ENGINE.AST || ParserLR.ParseTree
			, i=0, nState1, nState2, Token, o, action
			, M = ENGINE.MATRICE
			, ACTIONS={
				s:function(){
					aStack.push( action )
					aSymbols.push( Token )
					i++
					return false
					},
				r:function(){
					var prodID = action.substring(1)
					, p = ENGINE.PRODUCTIONS[ prodID ]
					, LHS = p[0], RHS = p[1]
					, nPop = RHS.length==1 && RHS[0]==EPSILON ? 0 : RHS.length
					if( nPop ) aStack = aStack.slice( 0, -nPop )
					if( aStack.length ){
						nState2 = aStack[ aStack.length-1 ].substring(1)
						var goto_ = M[ nState2 ] ? M[ nState2 ][ ENGINE.SYMBOLS[ LHS ]] : null
						if( goto_ ){
							aStack.push( goto_.replace( 'g', 's' ))
							aSymbols.push(
								TreeBuilder(
									'('+ prodID +') '+ LHS +' -> '+ RHS.join(' '),
									LHS,
									aSymbols.splice( aSymbols.length-nPop, nPop )
									)
								)
							}
						}
					return false
					},
				a:function(){
					return aSymbols.pop() // || document.createElement(ERROR_PARSING)
					}
				}
			do{
				nState1 = aStack[aStack.length-1].substring(1)
				Token = aTokens[i]
				var sTokenName = Token.nodeName.toUpperCase()
				while( ParserLR.sIgnoredToken.indexOf( '|'+sTokenName+'|' )> -1 ){
					i++
					Token = aTokens[i]
					var sTokenName = Token.nodeName.toUpperCase()
					}
				action = M[ nState1 ] ? M[ nState1 ][ ENGINE.SYMBOLS[ sTokenName ]] : null
				if( ! action ) throw new Error ( 'Erreur de syntaxe\n token: "'+ sTokenName +'"\n index: '+ i +'\n état: '+ nState1 )
				var f = ACTIONS[ action[0]]
				if( f ){
					var result = f()
					if( result ) return result
					} else throw new Error ( "Erreur parsing ... action "+ action )
			}while( i<aTokens.length && aStack.length )
			throw new Error ( 'Phrase incomplète...' )
			}
		ParserLR.sIgnoredToken = '|WHITE_SPACES|NEW_LINE|TAB|SPACES|SPACE|SLC|MLC|'
		ParserLR.Node =function( X ){
			var e = document.createElement( X )
			e.className = 'myNode'
			e.toString =function(){return X}
			return e
			}
		return function( aTokens ){ return ParserLR( aTokens, ENGINE )}
		})()

	Editor.extend( 'KeyBoard', {
		'CTRL+E': 'EXPAND_SNIPPET'
		})
	Editor.extend( 'Commands', {
		'EXPAND_SNIPPET': function(D,C,S,T){
			Editor.Modules.Snippet.replace(this,D,C,S,T)
			}
		})

	var Sn ={
		getIndentation :function( s ){
			return (s.match(/^(\s+)/)||[''])[0]
			},
		getContext :function( D ){
			var CP = D.oCaret.position
			, getElementAtIndex =function( e ){
				var a = e.getElementsByLine( CP.line )
				for(var i=0, ni=a.length; i<ni; i++ ){
					var nStart = a[i].oValue.index
					if( CP.index < nStart ){
						var sValue = a[i].oValue.value
						if( sValue && nStart+sValue.length <= CP.index ){
							
							}
						else i--
						break
						}
					}
				e = a[i] || a[i-1]
				return e && e.childNodes.length ? getElementAtIndex( e ) : e
				}
			var e = getElementAtIndex( D.oSyntax )
			var sContext = ''
			while( ! sContext && e ){
				sContext = {css:'CSS',js:'JS',php:'PHP'}[ e.oValue.css ]
				e = e.parentNode
				}
			sContext = sContext || D.sSyntax
			return sContext
			},
		extract :function( C,S,T ){
			// TODO: extraire automatiquement la portion de texte avant un index pouvant être compilé
			var nIndex = C.position.index
			var soLine = T.lineAt( nIndex )
			var sIndentation = this.getIndentation( soLine )
			if( S && S.exist()){
				var nStart = S.start
				, nEnd = S.end
				, sSnippet = S.cloneContents()
				}
			else{
				var nStart = soLine.index + sIndentation.length
				, nEnd = soLine.index + soLine.length - 1
				, sSnippet = soLine.slice( sIndentation.length, -1 )
				}
			return {
				nStart: nStart,
				nEnd: nEnd,
				sIndentation: sIndentation,
				sSnippet: sSnippet
				}
			},
		compile :function( sSnippet, sContext ){
			var oResult
			try{
				return Compiler( Parser( Scanner( sSnippet )), sContext )
			}catch(e){
				throw e
				return {
					nIndex: sSnippet.length,
					sText: sSnippet
					}
				}
			// retourne la portion de texte générée
			},
		replace :function( E,D,C,S,T ){
			var sAction = Editor.getUniqueId('EXPAND_SNIPPET')
			var o = this.extract( C,S,T )
			if( o.sSnippet.indexOf('\n')>-1 ) return
			if( o.sSnippet ){
				var sContext = this.getContext(D)
				var oResult = this.compile( o.sSnippet, sContext )
			//	console.warn( 'Résultat: ' + JSON.stringify( oResult ))
				if( oResult.sText == o.sSnippet ) return;
				
				// Ajoute l'indentation et recalcule la position de l'index du curseur texte
				oResult.nIndex = oResult.sText.substr( 0, oResult.nIndex ).replace( /\n/g, '\n'+ o.sIndentation ).length
				oResult.sText = oResult.sText.replace( /\n/g, '\n'+ o.sIndentation )
				
				Editor.addInHistory.call( E, sAction, 'Undo', o.nStart, o.nEnd, o.nEnd )()
				S.replace( oResult.sText, true, sAction )
				Editor.addInHistory.call( E, sAction, 'Redo', null, null, o.nStart + oResult.nIndex )()
				}
			}
		}
	Editor.loadFile( 'Analyses/src/zenLike/compiler.js' ,function(){ Sn.oSnippets = oSnippets })
	return Sn
	})())