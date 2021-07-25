// LexerNode requis

var MultiRegExpLexer =(function(){
	var LexerRules =(function(){
		var Groups ={
			list: {},
			get :function( ID ){
				var o = Groups.list[ID]
				if( ! o ) throw new Error ( 'Lexer: "'+ ID +'" is not a group.' )
				else return o
				},
			add :function( ID, m ){
				if( Groups.list[ID]) throw new Error ( 'Lexer group "'+ ID +'" already exist.' )
				return Groups.list[ID] = m
				}
			}
		var Tokens ={
			list: {},
			get :function( ID ){
				var o = Tokens.list[ID]
				if( ! o ) throw new Error ( 'Lexer: "'+ ID +'" is not a token.' )
				else return o
				},
			add :function( ID, m ){
				if( Tokens.list[ID]) throw new Error ( 'Lexer token "'+ ID +'" already exist.' )
				return Tokens.list[ID] = m
				}
			}
		return{
			addGroup :function( o ){
				var a = []
				for(var i=0; o.list[i]; i++ ){
					var ID = o.list[i]
					var oToken = Tokens.list[ID]
					if( oToken ) a.push( oToken )
					else {
						var aGroup = Groups.list[ID]
						a = Array.merge( a, aGroup )
						}
					}
				return Groups.add( o.name, a )
				},
			addGroups :function( a ){
				for(var i=0; a[i]; i++ ) LexerRules.addGroup( a[i])
				},
			getGroup :function( ID ){ return Groups.get( ID )},
			isGroup :function( ID ){ return Groups.list[ID]},
			addTokens :function( o ){
				for(var i=0, aToken; aToken = o.list[i]; i++ )
					Tokens.add( aToken[0], {
						name: aToken[0],
						re: new RegExp ( '^(?:'+ aToken[1].source +')' ),
						css: aToken[2]
						})
				},
			getToken :function( ID ){return Tokens.get( ID )}
			}
		})()

	;(function(){ // Languages definition
	// REGEXP LANGUAGE
	LexerRules.addTokens({ list:[
		['CHARSET',/\[\^?|\]|\-/],
		['PIPE',/\|/],
		['PUNCTUATOR',/\(|\)/],
		['QUANTIFIER1',/\{\d+(\,\d*)?\}/],
		['QUANTIFIER2',/\*|\+|\?/],
		['CHAR_ESCAPED',/\\./],
		['ANY',/\./],
		['CHAR',/[^\(\)\\\|\.\[\]\*\+\?\{\-]/]
		]})
	LexerRules.addGroup({name:'RegExp', list:'CHARSET,PIPE,PUNCTUATOR,QUANTIFIER1,QUANTIFIER2,CHAR_ESCAPED,ANY,CHAR'.split(',')})
	// JS + PHP LANGUAGE
	LexerRules.addTokens({ list:[
		['ELISION',/,/],
		['UNARY_OPERATOR',/\+\+|\-\-|\~|\!/],
		['ARITHMETIC_OPERATOR',/[\+\-\*\%\/]/],
		['LOGICAL_OPERATOR',/&&|\|\|/],
		['COMPARISON_OPERATOR',/(?:[<>]|[=!]=)=?/],
		['ASSIGNMENT_OPERATOR',/=|\*=|\/=|\%=|\+=|\-=|<<=|>>=|>>>=|\&=|\^=|\|=/],
		['L_NEW_LINE',/[\n\r]/],
		['WHITE_SPACES',/[ \t]+/],
		['TAB',/\t/],
		['SPACES',/[ ]/],
		['NOT_WHITE_SPACES',/[^\s]+/],
		['BACKSLASH',/\\/],
		['S_SSQ',/'/],
		['SSQ_IN',/([^'\\\n\r\f \t]|\\[^\n\r\f \t])+/],
		['E_SSQ',/'/],
		['S_SDQ',/"/],
		['SDQ_IN',/([^"\\\n\r\f \t]|\\[^\n\r\f \t])+/],
		['E_SDQ',/"/],
		['S_SLC',/\/\//],
		['SLC_IN',/[^\n\r\f \t]+/],
		['S_MLC',/\/\*/],
		['MLC_IN',/[^\n\r\f \t\*]+\**|\*+[^\n\r\f \t\/]*/],
		['E_MLC',/[^\n\r\f \t\*]*\*+\//],
		['R_REGULAR_EXPRESSION',/\/(?:\\\/|[^\s\*\/])(?:\\\/| |	|[^\s\/])*\/[gim]*/],
		['REGULAR_EXPRESSION_IN',/[^\t ]+/],
		['NUMBER',/\d+/],
		['LBRACE',/\{/], ['RBRACE',/\}/],
		['LPAREN',/\(/], ['RPAREN',/\)/],
		['LBRACK',/\[/], ['RBRACK',/\]/],
		['DOT',/\./],
		['SEMI',/\;/],
		['QUESTION',/\?/],
		['COLON',/\:/],
		['JS_KEYWORD',/\b(?:break|c(?:ase|atch|ontinue)|d(?:efault|elete|o)|else|f(?:inally|or|unction)|i(?:f|n|nstanceof)|new|return|switch|t(?:his|hrow|ry|ypeof)|v(?:ar|oid)|w(?:hile|ith))\b/],
		['JS_LITERAL',/\b(?:true|false|null|undefined|Infinity|NaN)\b/],
		['JS_IDENTIFIER',/[\$\_a-zA-Z]([\$\_a-zA-Z]|\d)*/],
		['S_PHP',/\<\?(?:php\b|=)/],
		['E_PHP',/\?\>/],
		['PHP_SPECIAL_VARS',/(?:\$(?:GLOBALS|_(?:COOKIE|ENV|FILES|GET|(?:PO|REQUE)ST|SE(?:RVER|SSION))))\b/g],
		['PHP_KEYWORD',/(?:break|case|continue|declare|default|do|each|elseif|else|foreach|for|goto|if|include|include_once|require|require_once|return|switch|while)\b/],
		['PHP_LITERAL',/(?:true|TRUE|false|FALSE|null|NULL)\b/],
		['PHP_RESERVED',/(?:\@|and|or|xor|exception|as|var|class|const|declare|die|echo|empty|eval|exit|extends|function|global|isset|list|new|print|static|unset|use|__FUNCTION__|__CLASS__|__METHOD__|final|interface|implements|extends|public|private|protected|abstract|clone|\$this)\b/],
		['PHP_IDENTIFIER',/\$[\w_][\w\d_]*\b/],
		['PHP_FUNCTION',/\b\w[\w\d_]*\b/]
		]})
	LexerRules.addGroups([
		{name:'JS', list:[
			'L_NEW_LINE','SPACES','TAB',
			'JS_KEYWORD','JS_LITERAL','JS_IDENTIFIER',
			'LBRACE','RBRACE','LPAREN','RPAREN','LBRACK','RBRACK',
			'S_SSQ','S_SDQ',
			'S_MLC','S_SLC',
			'R_REGULAR_EXPRESSION',
			'NUMBER',
			'ELISION',
			'DOT','SEMI','COLON','QUESTION',
			'S_PHP',
			'LOGICAL_OPERATOR','COMPARISON_OPERATOR','ASSIGNMENT_OPERATOR','UNARY_OPERATOR','ARITHMETIC_OPERATOR',
			'NOT_WHITE_SPACES'
			]},
		{name:'REGULAR_EXPRESSION', list:['TAB','SPACES','REGULAR_EXPRESSION_IN']},
		{name:'PHP', list:[
			'L_NEW_LINE','SPACES','TAB',
			'E_PHP',
			'LBRACE','RBRACE','LPAREN','RPAREN','LBRACK','RBRACK',
			'ELISION',
			'S_SSQ','S_SDQ',
			'S_MLC','S_SLC',
			'NUMBER','SEMI',
			'PHP_KEYWORD','PHP_RESERVED','PHP_LITERAL','PHP_SPECIAL_VARS','PHP_IDENTIFIER','PHP_FUNCTION',
			'COMPARISON_OPERATOR','ASSIGNMENT_OPERATOR','ARITHMETIC_OPERATOR','UNARY_OPERATOR',
			'NOT_WHITE_SPACES'
			]},
		{name:'SSQ', list:'L_NEW_LINE,TAB,SPACES,SSQ_IN,E_SSQ,BACKSLASH'.split(',')},
		{name:'SDQ', list:'L_NEW_LINE,TAB,SPACES,SDQ_IN,E_SDQ,BACKSLASH'.split(',')},
		{name:'MLC', list:'L_NEW_LINE,TAB,SPACES,E_MLC,MLC_IN'.split(',')},
		{name:'SLC', list:'TAB,SPACES,SLC_IN'.split(',')}
		])
	})();

	var aMatch, nMatchLength, sToken, eNode, eNewParent, bNoSkip
	, Actions ={
		add :function(){
			this.previous.set( eNode.oValue.token )
			return this.appendNode( eNode )
			},
		endParent :function(){
			this.previous.set( this.eParent.oValue.token )
			this.appendNode( eNode )
			this.stack.pop()
			return eNode
			},
		newLine :function(){
			this.previous.set( eNode.oValue.token )
			this.nLine++
			return this.appendNode( eNode )
			},
		rescanToken :function(){
			this.nPos = eNode.oValue.index
			this.nLine = eNode.oValue.lineStart
			var sRescan = sToken.slice( 2 )
			, sTextRescan = eNode.oValue.value
			, nEnd = this.nPos + sTextRescan.length
			, sTMP = this.sText
			eNode.oValue.value = eNode.innerHTML = ''
			eNode.oValue.rule = sRescan
			var eParent = this.appendNode( eNode )
			this.stack.push( eNode )
			this.previous.set( eNode.oValue.token )
			this.sText = sTextRescan
			do{ this.readToken()}while( this.nPos < nEnd )
			this.sText = sTMP
			this.stack.pop()
			return eParent
			},
		startParent :function(){
			sToken=sToken.slice( 2 )
			eNewParent = LexerNode({
				token:Translation[sToken]||sToken,
				rule:sToken,
				value:'',
				css:CSS[sToken]||'',
				index:eNode.oValue.index,
				lineStart:this.nLine,
				parentToken:this.sSyntax
				})
			eNode.oValue.parentToken = eNewParent.oValue.rule
			if( eNode.setTitle ) eNode.setTitle()
			eNewParent.appendChild( eNode )
			this.previous.set( eNode.oValue.token )
			this.appendNode( eNewParent )
			this.stack.push( eNewParent )
			if( Skip.notFor[ this.sSyntax ])
				while( this.eParent==eNewParent && this.readToken());
			return eNewParent
			}
		}
	, CSS =(function(){
		var o={}
		o.add =function( aCLASSES ){
			for(var i=0, aClass; aClass=aCLASSES[i]; i++)
				for(var sCSS=aClass[0], aTOKENS=aClass[1].split('|'), j=0, sToken; sToken=aTOKENS[j]; j++)
					o[sToken] = o[sToken] ? o[sToken]+' '+sCSS : sCSS
			}
		o.add([ // ['css class','token1|token2|...'], 'add' ne doit pas �tre un nom de token
			['charset','CHARSET'],
			['punctuator','PIPE|PUNCTUATOR'],
			['repetition','QUANTIFIER1|QUANTIFIER2'],
			['character','CHAR_ESCAPED|ANY|CHAR'],
			['operator','UNARY_OPERATOR|LOGICAL_OPERATOR|ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|COMPARISON_OPERATOR'],
			['linefeed','L_NEW_LINE'],
			['whitespaces','WHITE_SPACES'],
			['tab','TAB'],
			['space','SPACES|TAB'],
			['undefined','NOT_WHITE_SPACES|BACKSLASH'],
			['string','SSQ|SDQ'],
			['comment','SLC|MLC'],
			['regexp','R_REGULAR_EXPRESSION'],
			['number','NUMBER'],
			['block','JS_BRACE|PHP_BRACE'],
			['punctuator','ELISION|LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK|DOT|SEMI|QUESTION|COLON'],
			['elision','ELISION'],
			['identifier','JS_IDENTIFIER|PHP_IDENTIFIER'],
			['keyword','JS_KEYWORD|PHP_KEYWORD|PHP_RESERVED'],
			['literal','JS_LITERAL|PHP_LITERAL'],
			['tag','S_PHP|E_PHP'],
			['php','PHP'],
			['special','PHP_SPECIAL_VARS'],
			['function','PHP_FUNCTION']
			])
		return o
		})()
	, Previous =(function(){
		var o =function(){
			var s = ''
			return {
				invalidFor :function( sToken ){
					return o.ofToken[sToken] && o.ofToken[sToken].indexOf(s)<0
					},
				set :function( sToken ){
					if( !o.excluded[sToken]) s = Translation[sToken]||sToken
					},
				get :function(){ return s }
				}
			}
		o.union({
			excluded :{
				WHITE_SPACES:1,SPACES:1,SPACE:1,TAB:1,
				S_SLC:1,SLC:1,SLC_IN:1,
				S_MLC:1,MLC:1,MLC_IN:1,E_MLC:1,
				COMMENT:1,
				REGULAR_EXPRESSION_IN:1
				},
			ofToken :{
				"R_REGULAR_EXPRESSION":"ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|BITWISE_OPERATOR|COMPARISON_OPERATOR|LOGICAL_OPERATOR|ELISION|DOT|LBRACK|LPAREN|LBRACE|COLON|SEMI|QUESTION|JS_KEYWORD"
				}
			})
		return o
		})()
	, Stack =function( that ){
		var a = []
		return {
		//	value: a,
			pop :function(){
				if( a.length ){
					var e = a.pop()
					e.oValue.lineEnd = e.lastChild && e.lastChild.oValue.lineEnd || 1
					if( e.setTitle ) e.setTitle()
					}
				if( a.length ){
					that.eParent = a[a.length-1]
					that.sSyntax = that.eParent.oValue.rule
					}
				return a.length
				},
			push :function( e ){
				a.push( that.eParent = e )
				that.sSyntax = e.oValue.rule
				return e
				}
			}
		}
	, Translation ={
		'L_NEW_LINE':'NEW_LINE',
		'R_REGULAR_EXPRESSION':'REGULAR_EXPRESSION',
		'SSQ':'STRING','S_SSQ':'SINGLE_QUOTE','E_SSQ':'SINGLE_QUOTE',
		'SDQ':'STRING','S_SDQ':'DOUBLE_QUOTE','E_SDQ':'DOUBLE_QUOTE',
		'SLC':'COMMENT','MLC':'COMMENT',
		'JS_BRACE':'BRACE','S_JS_BRACE':'LBRACE','E_JS_BRACE':'RBRACE',
		'PHP_BRACE':'BRACE','S_PHP_BRACE':'LBRACE','E_PHP_BRACE':'RBRACE'
		}
	, Skip =(function(){
		var o = function( that ){
			var f = that.bSkip
				? function( sToken ){
					return bNoSkip ? false : Previous.excluded[sToken]
					}
				: function(){ return false }
			f.set =function( bSkip ){
				that.bSkip = bSkip
				that.skip = Skip(that)
				}
			return f
			}
		o.notFor={SSQ:1,SDQ:1,MLC:1,SLC:1,REGULAR_EXPRESSION:1}
		return o
		})()
	, Lexer =function( sText, sSyntax ){
		if( sText ) return SINGLETON.scan( sText, sSyntax )
		}
	Lexer.union({
		CSS: CSS,
		Previous: Previous,
		Rules: LexerRules,
		Skip: Skip,
		Stack: Stack,
		Translation: Translation
		})
	Lexer.prototype ={
		sSyntax: null,
		end :function(){
			if( this.sText.length ) alert("Error Scanning !")
			return this.eRoot
			},

		bSkip: 0,
		eParent: null,
		action :function(){
			return Actions[
				sToken.charAt(1)=='_'
					? { E:'endParent',
						L:'newLine',
						R:'rescanToken',
						S:'startParent'
						}[ sToken.charAt(0)] || 'add'
					: 'add'
				].call( this )
			},
		appendNode :function( e ){
			return this.skip( e.oValue.token )
				? true
				: this.eParent.appendChild( e )
			},
		init :function( sText, sSyntax ){
			this.union({ nLine:1, nPos:0, sText:sText,
				stack:Stack(this),
				skip:Skip(this),
				previous:Previous()
				})
			sSyntax = sSyntax || 'RegExp'
			this.eRoot = this.stack.push( LexerNode({
				token:sSyntax,
				rule:sSyntax,
				value:'',
				css:sSyntax.toLowerCase(),
				index:0,
				lineStart:1
				}))
			},
		readToken :function(){
			var a = LexerRules.getGroup( this.sSyntax )
			bNoSkip = Skip.notFor[ this.sSyntax ]
			for(var i=0; a[i]; i++ ){
				if( ! a[i].re.test( this.sText ) || this.previous.invalidFor( a[i].name )) continue;
				aMatch = a[i].re.exec( this.sText )
				if( nMatchLength = aMatch[0].length ){
					sToken = a[i].name
					eNode = LexerNode({
						token:Translation[sToken]||sToken,
						rule:sToken,
						value:aMatch[0],
						css:CSS[sToken]||'',
						index:this.nPos,
						lineStart:this.nLine,
						lineEnd:this.nLine,
						parentToken:this.sSyntax
						})
					this.sText = this.sText.substr( nMatchLength )
					this.nPos += nMatchLength
					return this.action()
					}
				}
			return this.stack.pop() ? true : null
			},
		scan :function( sText, sSyntax ){
			this.init( sText, sSyntax )
			while( this.readToken());
			return this.end()
			}
		}
	SINGLETON = new Lexer
	return Lexer
	})()