if( AutomatonLexer.addCSSClass ){
AutomatonLexer.addCSSClass('whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
AutomatonLexer.insert(function(o,f,g,h){

// WHITESPACES
o.addTokens([
	["SPACES",{A:g(" "),M:[,[2]],F:[,,1]}],
	["TAB",{A:g("\t"),M:[,[2]],F:[,,1]}],
	["L_NEW_LINE",{A:g("\n","\f","\r"),M:[,[3,3,2],[3]],F:[,,1,1]}]
	])
o.addCSSClass("space=SPACES&tab=TAB&linefeed=L_NEW_LINE")
o.setTokensTranslation('L_NEW_LINE=NEW_LINE')

// NUMBER
o.addTokens([
	["NUMBER",{A:g("0","1","[234567]","[89]","[Ee]",".","b","[+-]","[ABCDFacdf]","[Xx]"),R:[[2,f("234567",1)],[3,f("89",1)],[4,f("Ee",1)],[7,f("+-",1)],[8,f("ABCDFacdf",1)],[9,f("Xx",1)]],M:[,[2,5,5,5,,10,,8],[5,5,5,5,7,6,13,,,3],h(9,4,5,0,7,0),h(9,4,5,0,7,0),[5,5,5,5,7,6],h(5,6,4,7),[9,9,9,9,,,,11],[2,5,5,5,,10],h(4,9),h(4,6),h(4,9),[12,12],[12,12]],F:[,,1,,1,1,1,,,1,,,1]}]
	])
o.addCSSClass("number=NUMBER")

// STRINGS & COMMENTS
o.addTokens([
	["SSQ",{A:g("<","=","?","[^\t\n\f\r '\\p<?=h]","\\","h","p","'","\n","\t","\f","\r"," "),M:[,[6,4,4,4,3,4,4,14,11,12,11,10,13],h(8,4),h(8,4),h(7,4,4,2),h(7,4,4,2),h(7,4,2,7,4,2),[4,5,4,4,2,4,8],h(7,4,4,2,5,9),h(7,4,4,2,6,5),{8:11}],F:[,,,7,5,6,5,5,5,5,2,2,1,3,4],R:[[3,f("\t\n\f\r '\\p<?=h")]],TokensTable:',TAB,L_NEW_LINE_IN_STRING,SPACES,E_SSQ,SSQ_IN,S_PHP,BACKSLASH'.split(',')}],
	["SDQ",{A:g("<","=","?","[^\t\n\f\r \"\\p<?=h]","\\","h","p","\"","\n","\t","\f","\r"," "),M:[,[6,4,4,4,3,4,4,14,11,12,11,10,13],h(8,4),h(8,4),h(7,4,4,2),h(7,4,4,2),h(7,4,2,7,4,2),[4,5,4,4,2,4,8],h(7,4,4,2,5,9),h(7,4,4,2,6,5),{8:11}],F:[,,,7,5,6,5,5,5,5,2,2,1,3,4],R:[[3,f("\t\n\f\r \"\\p<?=h")]],TokensTable:',TAB,L_NEW_LINE_IN_STRING,SPACES,E_SDQ,SDQ_IN,S_PHP,BACKSLASH'.split(',')}],
	["MLC",{A:g("*","/","<","=","?","[^\t\n\f\r */p<?=h]","h","p","\n","\t","\f","\r"," "),M:[,[3,2,5,2,2,2,2,2,12,14,12,11,15],h(8,2,0,10),h(8,9,0,3,1,13),h(8,2,0,10),h(8,2,0,10,4,6),[10,2,2,4,2,2,2,7],h(8,2,0,10,6,8),h(8,2,0,10,7,4),h(8,9,1,0),[10,13],{8:12}],F:[,,4,4,6,4,4,4,4,4,4,2,2,5,1,3],R:[[5,f("\t\n\f\r */p<?=h")]],TokensTable:',TAB,L_NEW_LINE,SPACES,MLC_IN,E_MLC,S_PHP'.split(',')}],
	["SLC",{A:g("<","=","?","[^\t\n\f\r p<?=h]","h","p","\t"," "),M:[,[2,3,3,3,3,3,8,9],h(6,3,2,5),h(6,3),h(6,3,4,6),[3,7,3,3,3,4],h(6,3,5,7),h(6,3)],F:[,,3,3,3,3,3,4,1,2],R:[[3,f("\t\n\f\r p<?=h")]],TokensTable:[,'TAB','SPACES','SLC_IN','S_PHP']}]
	])
o.addCSSClass("undefined=BACKSLASH&linefeed=L_NEW_LINE_IN_STRING&string=SSQ|SDQ&comment=MLC|SLC")
o.setPreviousTokenOf("L_NEW_LINE_IN_STRING","BACKSLASH")
o.setTokensTranslation('L_NEW_LINE_IN_STRING=NEW_LINE&SSQ=STRING&S_SSQ=SINGLE_QUOTE&E_SSQ=SINGLE_QUOTE&SDQ=STRING&S_SDQ=DOUBLE_QUOTE&E_SDQ=DOUBLE_QUOTE&MLC=COMMENT&SLC=COMMENT')

// SUPER SCRIPT
o.addTokens([
	["S_PHP",{A:g("p","<","?","=","h"),M:[,[,3],[4,,,6],[,,2],{4:5},[6]],F:{6:1}}]
	])
o.addCSSClass("tag=S_PHP&elt=E_HTMLScript")

// INI
o.addTokens([
["INI",{A:g("[^\t\n\f\r !\"&();=[]^{|}~flnseouatry]","a","e","f","l","n","o","r","s","t","u","y","\n","\t","\f","\r"," ",";","=","[","[!\"&()]^{|}~]"),M:[,[2,2,2,5,2,8,12,2,2,14,2,16,19,20,19,18,21,22,23,24,25],h(12,2),h(12,2),h(12,2,2,3),h(12,2,1,6),h(12,2,4,7),h(12,2,8,4),h(12,2,6,9,10,10),h(12,2,5,4),h(12,2,4,11),h(12,2,4,3),h(12,2,3,13,5,3),h(12,2,3,3),h(12,2,7,15),h(12,2,10,4),h(12,2,2,17),h(12,2,8,3),{12:19}],F:[,,8,9,8,8,8,8,8,9,8,8,8,8,8,8,8,8,2,2,1,3,4,5,6,7],R:[[0,f("\t\n\f\r !\"&();=[]^{|}~flnseouatry")],[20,f("!\"&()]^{|}~",1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,S_INI_COMMENT,S_INI_VALUE,S_INI_SECTION,INI_TMP,INI_VAR,INI_KEYWORD'.split(',')}],
["INI_COMMENT",{A:g("[\t ]","[^\n\f\r \t]"),M:[,[2,2],[2,2]],F:[,,1],R:[[0,f("\t ",1)],[1,f("\n\f\r \t")]],TokensTable:[,'INI_COMMENT_IN']}],
["INI_SECTION",{A:g("[^\t\n\f\r ]]","\t"," ","]"),M:[,[2,3,4,5],[2]],F:[,,3,1,2,4],R:[[0,f("\t\n\f\r ]")]],TokensTable:[,'TAB','SPACES','INI_SECTION_IN','E_INI_SECTION']}],
["INI_VALUE",{A:g("[^\t\n\f\r \"';]","\t"," ","\"","'"),M:[,[2,3,4,5,6],[2]],F:[,,5,1,2,3,4],R:[[0,f("\t\n\f\r \"';")]],TokensTable:[,'TAB','SPACES','S_INI_SDQ','S_INI_SSQ','INI_VALUE_IN']}],
["INI_SDQ",{A:g("[^\t\n\f\r \"\\]","\\","\"","\t"," "),M:[,[3,2,6,4,5],[3,3,3],[3,2]],F:[,,,4,1,2,3],R:[[0,f("\t\n\f\r \"\\")]],TokensTable:[,'TAB','SPACES','E_INI_SDQ','INI_SDQ_IN']}],
["INI_SSQ",{A:g("\n","[^\t\n\f\r ']","\t","\f","\r"," ","'"),M:[,[5,3,4,5,2,6,7],[5],[,3]],F:[,,2,5,1,2,3,4],R:[[1,f("\t\n\f\r '")]],TokensTable:[,'TAB','L_NEW_LINE','SPACES','E_INI_SSQ','INI_SSQ_IN']}]
])
o.addCSSClass("keyword=INI_KEYWORD&var=INI_VAR&undefined=INI_TMP&comment=INI_COMMENT&section=INI_SECTION_IN&value=INI_VALUE&punctuator=S_INI_VALUE&string=INI_SDQ|INI_SSQ")
o.setTokensTranslation('INI_COMMENT=COMMENT&INI_SECTION_IN=SECTION&INI_VALUE=VALUES&S_INI_VALUE=OPERATOR&INI_SDQ=STRING&INI_SSQ=STRING')

// CSS
var s="GHIJKLMNOPQRSTUVWXYZ"
,b=[
	"ABCDEFabcdef",
	"0123456789",
	s+"_ghijklmnopqrstuvwxyz",
	s+"_gijklmnoqrstuvwxyz",
	"\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b",
	"\u000b\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f",
	"�����������������������������������������������������������������������������"
	]
o.addTokens([
["BIG_CSS",(function(a0,a1,a2,a3){return {A:g("�","-","p","["+a0+"]","h","["+a1+"]","["+a2+"]","\\","/","<","=","?","[^�-ph\\/<=?*:\t #,.@[{\n\f\r"+a0+a1+a2+a3+"]","*",":","\t"," ","#",",",".","@","[","["+a3+"]","{","\n","\f","\r"),M:[,[6,7,11,10,11,11,11,2,8,16,10,10,10,27,23,28,29,15,30,18,19,34,27,35,26,26,22],h(24,11),h(24,12),h(24,13),h(24,14),[6,6,11,6,11,11,11,2,10,10,10,10,10],h(13,10,0,6,2,11,4,11,5,11,6,11,7,2),[10,10,,10,,,,,10,10,10,10,10,31],[10,10,24,10,,,,,10,10,17,10,10],h(13,10,2,0,4,0,5,0,6,0,7,0),h(8,11,7,2),h(8,12,7,3),h(8,13,7,4),h(8,14,7,5),h(8,14,7,5),[10,10,,10,,,,,10,10,10,9,10],h(13,10,2,0,4,0,5,0,6,0,7,0),h(8,12,1,20,3,0,7,3),h(8,13,1,21,3,0,7,4),h(8,12,1,0,3,0,7,3),h(8,13,1,0,3,0,7,4),{24:26},{14:32},{4:25},[,,33]],F:[,,,,,,8,7,7,7,7,8,9,13,4,,7,12,,,,,2,11,,,2,5,1,3,6,10,11,12,14,15],R:[[3,f(a0,1)],[5,f(a1,1)],[6,f(a2,1)],[12,f("�-ph\\/<=?*:\t #,.@[{\n\f\r"+a0+a1+a2+a3+"")],[22,f(a3,1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,HASH,COMBINATOR,ELISION,CSS_ERROR,IDENT,CLASS,S_MLC,S_PSEUDO,S_PHP,ATKEYWORD,S_ATTRIBUTE_SELECTOR,S_RULE_SET'.split(',')}})
(
	"0123456789",
	"ABCDEFabcdef",
	"GHIJKLMNOPQRSTUVWXYZ_gijklmnoqrstuvwxyz",
	"+>~"
)],
["ATTRIBUTE_SELECTOR",(function(a0,a1,a2,a3){return {A:g("["+a0+"]","["+a1+"]","\\","�","-","=","\"","'","["+a2+"]","["+a3+"]","]","[^\\�-=\"']"+a0+a1+a2+a3+"]"),M:[,[3,3,2,3,4,8,6,7,,5,9],h(12,3),[3,3,2,3,3,,,,3],[3,3,2,3],{5:8}],F:[,,,3,,,1,2,4,5],R:[[0,f(a0,1)],[1,f(a1,1)],[8,f(a2,1)],[9,f(a3,1)],[11,f("\\�-=\"']"+a0+a1+a2+a3+"")]],TokensTable:[,'S_SDQ','S_SSQ','IDENT','ATTRIBUTE_OPERATOR','E_ATTRIBUTE_SELECTOR']}})
(
	"ABCDEFabcdef",
	"GHIJKLMNOPQRSTUVWXYZ_ghijklmnopqrstuvwxyz",
	"0123456789",
	"$*^|~"
)],
["RULE_SET",(function(a0,a1,a2){return {A:g("p","h","["+a0+"]","["+a1+"]","\\","�","-","\t","\n"," ","["+a2+"]","*","/",":","<","=","?","}","\f","\r","[^ph\\�-\t\n */:<=?}\f\r"+a0+a1+a2+"]"),M:[,[3,3,3,3,2,3,4,13,11,14,,,7,16,8,,,17,11,6],h(21,3,8,0,18,0,19,0),[3,3,3,3,2,3,3,,,,3],h(6,3,4,2),{0:9,15:12},{8:11},{11:15},{16:5},[,10],[12]],F:[,,,4,,,2,,,,,2,7,1,3,5,6,8],R:[[2,f(a0,1)],[3,f(a1,1)],[10,f(a2,1)],[20,f("ph\\�-\t\n */:<=?}\f\r"+a0+a1+a2+"")]],TokensTable:',TAB,L_NEW_LINE,SPACES,IDENT,S_MLC,S_PROP_VALUE,S_PHP,E_RULE_SET'.split(',')}})
(
	"ABCDEFabcdef",
	"GHIJKLMNOPQRSTUVWXYZ_gijklmnoqrstuvwxyz",
	"0123456789"
)],
["PROP_VALUE",(function(a0,a1,a2){return {A:g("["+a0+"]","m","h","p","c","d","e","g","r","s","i","k","x","a","n","t","z","-","["+a1+"]","["+a2+"]","\\","l","u","�",".","%","(","/","\t"," ","!","\"","#","'","*","+",",",";","<","=","?","[^mhpcdegrsikxantz-\\lu�.%(/\t !\"#'*+,;<=?"+a0+a1+a2+"]"),M:[,[12,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,4,4,2,4,5,4,29,38,,33,40,41,42,43,9,44,,38,45,47,34],h(42,4),h(42,8),h(27,4,20,2,24,0,25,0,26,37),h(27,4,8,6,20,2,24,0,25,0,26,37),h(27,4,20,2,21,7,24,0,25,0,26,37),h(27,4,20,2,24,0,25,0,26,48),h(24,8,20,3),h(24,8,20,3),h(25,4,0,12,17,0,20,2,24,29),[11,18,23,15,24,25,17,26,22,21,27,28,,,,,,,,,,,,,30,21],[12,18,23,15,24,25,17,26,22,21,27,28,,,,,,,,,,,,,29,21],[13,18,23,15,24,25,17,26,22,21,27,28,,,,,,,,,,,,,,21],[14,18,23,15,24,25,17,26,22,21,27,28,,,,,,,,,,,,,,21],{4:21,12:21,15:21},{0:11,17:19,24:30},{1:21,12:21},{1:21,9:21},{0:11,24:30},{3:35,39:39},{27:16},{13:32},{16:21},[,21],{6:31},{8:22},{14:21},[,,23],[13],[14],{7:21},{5:21},{34:46},{40:20},[,,36],{3:39}],F:[,,,,11,11,11,11,5,,6,,9,9,,,,,,,,10,,,,,,,,,,,,,,,,12,6,15,1,2,3,4,7,8,13,14,16],R:[[0,f(a0,1)],[18,f(a1,1)],[19,f(a2,1)],[41,f("mhpcdegrsikxantz-\\lu�.%(/\t !\"#'*+,;<=?"+a0+a1+a2+"")]],TokensTable:',TAB,SPACES,S_IMPORTANT,S_SDQ,HASH,CSS_PHP_BUG,S_SSQ,ELISION,NUMBER,DIMENSIONS,IDENT,S_FUNCTION,S_MLC,E_PROP_VALUE,S_PHP,S_URL'.split(',')}})
(
	"0123456789",
	"ABCDEFbf",
	"GHIJKLMNOPQRSTUVWXYZ_joqvwy"
)],
["PSEUDO",(function(a0,a1,a2){return {A:g("["+a0+"]","["+a1+"]","\\","�","-","(","["+a2+"]","[^\\�-("+a0+a1+a2+"]"),M:[,[3,3,2,3,4],h(8,3),h(7,3,2,2,5,5),[3,3,2,3]],F:[,,,1,,2],R:[[0,f(a0,1)],[1,f(a1,1)],[6,f(a2,1)],[7,f("\\�-("+a0+a1+a2+"")]],TokensTable:[,'IDENT','S_FUNCTION']}})
(
	"ABCDEFabcdef",
	"GHIJKLMNOPQRSTUVWXYZ_ghijklmnopqrstuvwxyz",
	"0123456789"
)],
["IMPORTANT",{A:g("\n","t","\t","\f","\r"," ","/","*","i","m","p","o","r","a","n"),M:[,[12,,13,12,2,14,3,,4],[12],{7:15},{9:5},{10:6},{11:7},{12:8},[,9],{13:10},{14:11},[,16]],F:[,,2,,,,,,,,,,2,1,3,4,5],TokensTable:[,'TAB','L_NEW_LINE','SPACES','S_MLC','E_IMPORTANT']}],
["URL",(function(a0,a1){return {A:g("<","=","?","["+a0+"]","["+a1+"]","\\","h","p","�","\t","\n"," ","\"","'",")","\f","\r","[^<=?\\hp�\t\n \"')\f\r"+a0+a1+"]"),M:[,[5,3,3,3,3,2,3,3,3,11,10,12,13,14,15,10,9],h(18,3,5,2,10,0,15,0,16,0),h(9,3,5,2),h(9,3,5,2),h(9,3,2,6,5,2),h(9,3,1,4,5,2,7,7),h(9,3,5,2,6,8),h(9,3,5,2,7,4),{10:10}],F:[,1,1,1,8,1,1,1,1,3,3,2,4,5,6,7],R:[[3,f(a0,1)],[4,f(a1,1)],[17,f("<=?\\hp�\t\n \"')\f\r"+a0+a1+"")]],TokensTable:',PATH,TAB,L_NEW_LINE,SPACES,S_SDQ,S_SSQ,E_URL,S_PHP'.split(',')}})
(
	"!#$%&*+,-./:;>@GHIJKLMNOPQRSTUVWXYZ[]^_`gijklmnoqrstuvwxyz{|}~",
	"0123456789ABCDEFabcdef"
)],
["FUNCTION",(function(a0,a1,a2,a3){return {A:g("p","h","-","["+a0+"]","["+a1+"]","["+a2+"]","\\","�","=","?","\t"," ",")",",","<","[^\n\f\r0123456789ABCDEFabcdefGHIJKLMNOPQRSTUVWXYZ_ghijklmnopqrstuvwxyz-�\\\t ,<?=)"+a3+"]","[{}]","\n","\f","\r"),M:[,[5,5,7,6,5,5,4,5,14,14,16,17,18,19,10,14,,13,13,9],h(17,5),h(17,6),h(17,5),h(8,5,6,2),h(8,6,6,3),[5,5,6,6,5,5,2,5],{0:11,8:15},{17:13},{9:8},[,12],[15]],F:[,,,,8,7,6,6,,2,8,,,2,8,9,1,3,4,5],R:[[3,f(a0,1)],[4,f(a1,1)],[5,f(a2,1)],[15,f("ph-\\�=?\t ),<\n\f\r"+a0+a1+a2+a3+"")],[16,f(a3,1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,E_FUNCTION,ELISION,NAME,IDENT,FUNCTION_ARG,S_PHP'.split(',')}})
(
	"0123456789",
	"ABCDEFabcdef",
	"GHIJKLMNOPQRSTUVWXYZ_gijklmnoqrstuvwxyz",
	"{}"
)]
])
o.addRules([["CSS","BIG_CSS|NOT_WHITE_SPACES"]])
o.addCSSClass("punctuator=ELISION|S_RULE_SET|E_RULE_SET|S_PROP_VALUE|E_PROP_VALUE&undefined=CSS_ERROR|ATTRIBUTE_SELECTOR_ERROR&attribute_selector=ATTRIBUTE_SELECTOR&operator=ATTRIBUTE_OPERATOR&ruleset=RULE_SET&value=PROP_VALUE&combinator=COMBINATOR&id=ATKEYWORD|HASH&name=NAME&selector=IDENT&class=CLASS&pseudo=PSEUDO&important=IMPORTANT&number=NUMBER&dimension=DIMENSIONS&url=URL&url_delimiter=S_URL|E_URL&function=FUNCTION&argument=FUNCTION_ARG")
o.setTokensTranslation('S_ATTRIBUTE_SELECTOR=LBRACK&E_ATTRIBUTE_SELECTOR=RBRACK&S_RULE_SET=LBRACE&E_RULE_SET=RBRACE&S_PROP_VALUE=COLON&E_PROP_VALUE=SEMI')

// HTML Lexer
var s = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnoqrstuvwxyz"
o.addTokens([
	["E_HTMLStyle",{A:g("<","/","[Ss]","[Tt]","[Yy]","[Ll]","[Ee]",">"),M:[,[2],[,3],[,,4],{3:5},{4:6},{5:7},{6:8},{7:9}],F:{9:1},R:[[2,f("Ss",1)],[3,f("Tt",1)],[4,f("Yy",1)],[5,f("Ll",1)],[6,f("Ee",1)]]}],
	["E_HTMLScript",{A:g("<","/","[Ss]","[Cc]","[Rr]","[Ii]","[Pp]","[Tt]",">"),M:[,[2],[,3],[,,4],{3:5},{4:6},{5:7},{6:8},{7:9},{8:10}],F:{10:1},R:[[2,f("Ss",1)],[3,f("Cc",1)],[4,f("Rr",1)],[5,f("Ii",1)],[6,f("Pp",1)],[7,f("Tt",1)]]}],
	["HTML",{A:g("-","A","C","D","T","[","p","!","/","=","?","E","O","P","Y","h","\n","[^\t\n\f\r <-DCT[Ap!OYPE/?=h]","\t","\f","\r"," ","<"),M:[,h(23,2,16,22,19,22,18,24,20,6,21,25,22,3),h(18,2,16,0),{7:4,8:29,10:5},[7,,,8,,14],{6:20,9:23},{16:22},[26],{12:9},[,,10],{4:11},{14:12},{13:13},{11:27},[,,15],{3:16},[,17],{4:18},[,19],{5:28},{15:21},{6:23}],F:[,,4,5,,,2,,,,,,,,,,,,,,,,2,10,1,3,6,7,8,9],R:[[17,f("\t\n\f\r <-DCT[Ap!OYPE/?=h")]],TokensTable:',TAB,L_NEW_LINE,SPACES,HTML_TEXT,S_TAG,S_HTML_COMMENT,S_DOCTYPE,S_CDATA,S_END_TAG,S_PHP'.split(',')}],
	["TAG",{A:g("[0123456789ABDFGHJKMNOQUVWXZabdfghjkmnoquvwxz]","[Cc]","[Ee]","[Ii]","[Ll]","[Pp]","[Rr]","[Ss]","[Tt]","[Yy]",">"),M:[,h(11,2,7,3,10,13),h(10,2),h(10,2,1,4,8,9),h(10,2,6,5),h(10,2,3,6),h(10,2,5,7),h(10,2,8,8),h(10,2),h(10,2,9,10),h(10,2,4,11),h(10,2,2,12),h(10,2)],F:h(14,1,0,0,8,3,12,4,13,2),R:[[0,f("0123456789ABDFGHJKMNOQUVWXZabdfghjkmnoquvwxz",1)],[1,f("Cc",1)],[2,f("Ee",1)],[3,f("Ii",1)],[4,f("Ll",1)],[5,f("Pp",1)],[6,f("Rr",1)],[7,f("Ss",1)],[8,f("Tt",1)],[9,f("Yy",1)]],TokensTable:[,'S_ELT','E_TAG','S_HTML_SCRIPT','S_HTML_STYLE']}],
	["DOCTYPE",{A:g("\n","[^\t\n\f\r \"'>]","\t","\f","\r"," ","\"","'",">"),M:[,[5,3,4,5,2,6,7,8,9],[5],[,3]],F:[,,2,7,1,2,3,4,5,6],R:[[1,f("\t\n\f\r \"'>")]],TokensTable:',TAB,L_NEW_LINE,SPACES,S_HTML_SDQ,S_HTML_SSQ,E_DOCTYPE,DOCTYPE_IN'.split(',')}],
	["CDATA",{A:g("<","=","?","[^\t\n\f\r ]>p<?=h]","]","h","p",">","\n","\t","\f","\r"," "),M:[,[6,2,2,2,10,2,2,2,14,15,14,13,16],h(8,2,4,4),h(8,3,7,2),h(8,2,4,12),h(8,2,4,4),h(8,2,2,7,4,4),[2,5,2,2,4,2,8,2],h(8,2,4,4,5,9),h(8,2,4,4,6,5),h(8,2,4,11),h(8,3,7,17),h(7,3),{8:14}],F:[,,4,4,,5,4,4,4,4,6,,,2,2,1,3,7],R:[[3,f("\t\n\f\r ]>p<?=h")]],TokensTable:',TAB,L_NEW_LINE,SPACES,CDATA_IN,S_PHP,RBRACK,E_CDATA'.split(',')}],
	["HTML_COMMENT",{A:g("-","[^\t\n\f\r ->]",">","\t"," ","\n","\f","\r"),M:[,[7,12,12,16,17,15,15,14],h(5,2,0,5),[4,3,12,3,3],h(5,4,2,2),h(5,2,0,11),[6,4,10,4,4],h(5,2,0,8),[9,3,18,3,3],[6,3,13,3,3],h(5,2,0,5),[3,3,,3,3],[5,12,12],[5,12,12],{5:15}],F:[,,4,4,4,,4,,,4,5,,4,5,2,2,1,3,5],R:[[1,f("\t\n\f\r ->")]],TokensTable:[,'TAB','L_NEW_LINE','SPACES','HTML_COMMENT_IN','E_HTML_COMMENT']}],
	["ELT",(function(a0){return {A:g("p","h","\n","=","["+a0+"]","\t","\f","\r"," ","<","?"),M:[,[2,2,8,12,2,10,8,4,11,5],[2,2,,,2],[6,,,9],[,,8],{10:3},[,7],[9]],F:[,,6,,2,,,,2,4,1,3,5],R:[[4,f(a0,1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,S_PHP,S_TAG_ATTR_VALUE,TAG_ATTR'.split(',')}})(s)],
	["END_TAG",{A:g("[^\t\n\f\r >]",">"),M:[,[2,3],[2]],F:[,,2,1],R:[[0,f("\t\n\f\r >")]],TokensTable:[,'E_END_TAG','END_ELT']}],
	["TAG_ATTR_VALUE",{A:g("\n","p","\t","\f","\r"," ","\"","'","<","?","=","h"),M:[,[7,,9,7,3,10,11,12,4],{1:5,10:8},[7],{9:2},{11:6},[,8]],F:[,,,2,,,,2,6,1,3,4,5],TokensTable:',TAB,L_NEW_LINE,SPACES,S_HTML_SDQ,S_HTML_SSQ,S_PHP'.split(',')}],
	["HTML_SSQ",{A:g("<","=","?","[^\t\n\f\r 'p<?=h]","h","p","\n","\t","\f","\r"," ","'"),M:[,[4,2,2,2,2,2,9,10,9,8,11,12],h(6,2),h(6,2),h(6,2,2,5),[2,3,2,2,2,6],h(6,2,4,7),h(6,2,5,3),{6:9}],F:[,,5,6,5,5,5,5,2,2,1,3,4],R:[[3,f("\t\n\f\r 'p<?=h")]],TokensTable:',TAB,L_NEW_LINE,SPACES,E_HTML_SSQ,HTML_SSQ_IN,S_PHP'.split(',')}],
	["HTML_SDQ",{A:g("<","=","?","[^\t\n\f\r \"p<?=h]","h","p","\n","\t","\f","\r"," ","\""),M:[,[4,2,2,2,2,2,9,10,9,8,11,12],h(6,2),h(6,2),h(6,2,2,5),[2,3,2,2,2,6],h(6,2,4,7),h(6,2,5,3),{6:9}],F:[,,5,6,5,5,5,5,2,2,1,3,4],R:[[3,f("\t\n\f\r \"p<?=h")]],TokensTable:',TAB,L_NEW_LINE,SPACES,E_HTML_SDQ,HTML_SDQ_IN,S_PHP'.split(',')}],
	["HTML_STYLE",(function(a0){return {A:g("p","h","\n","=","["+a0+"]","\t","\f","\r"," ","<","?",">"),M:[,[2,2,8,12,2,10,8,4,11,5,,13],[2,2,,,2],[6,,,9],[,,8],{10:3},[,7],[9]],F:[,,7,,2,,,,2,4,1,3,5,6],R:[[4,f(a0,1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,S_PHP,S_TAG_ATTR_VALUE,S_HTMLStyle,TAG_ATTR'.split(',')}})(s)],
	["HTML_SCRIPT",(function(a0){return {A:g("p","h","\n","=","["+a0+"]","\t","\f","\r"," ","<","?",">"),M:[,[2,2,8,12,2,10,8,4,11,5,,13],[2,2,,,2],[6,,,9],[,,8],{10:3},[,7],[9]],F:[,,7,,2,,,,2,4,1,3,5,6],R:[[4,f(a0,1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,S_PHP,S_TAG_ATTR_VALUE,S_HTMLScript,TAG_ATTR'.split(',')}})(s)]
	])
o.addRules([["HTMLStyle","E_HTMLStyle|BIG_CSS"],["HTMLScript","E_HTMLScript|BIG_JS"]])
o.addCSSClass("html=HTML&elt=TAG|END_TAG|S_HTMLStyle|E_HTMLStyle|HTML_SCRIPT|S_HTMLScript|E_HTMLScript&doctype=DOCTYPE&cdata=CDATA&punctuator=RBRACK&comment=HTML_COMMENT&attr=TAG_ATTR&value=TAG_ATTR_VALUE&equal=S_TAG_ATTR_VALUE&string=HTML_SSQ|HTML_SDQ&css=HTMLStyle&js=HTMLScript")
o.setTokensTranslation('S_TAG_ATTR_VALUE=EQUAL&S_HTML_SSQ=SINGLE_QUOTE&E_HTML_SSQ=SINGLE_QUOTE&S_HTML_SDQ=DOUBLE_QUOTE&E_HTML_SDQ=DOUBLE_QUOTE&E_HTMLStyle=END_HTML_STYLE&E_HTMLScript=END_HTML_SCRIPT')


// JS
o.addTokens([
	["BIG_JS",{A:g("0","1","[234567]","[89]","E","e","C","b","c","p","[ABDF]","a","d","f","[Xx]","I","P","R","S","T","h","i","r","s","t","N","[GHJKLMOQUVWYZgjmqz]","k","l","n","o","u","v","w","y","[$_]","=",".",">","+","-","&","/","<","?","|","\t"," ","!","\"","%","'","(",")","*",",",":",";","[","]","{","}","~","[^\n\f\r*/[\\]ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789=01.>+-&<|\t !%?~'\",{}();:$_]","\\","\n","\f","\r"),M:[,[104,105,105,105,8,47,8,28,32,8,8,8,39,49,8,19,8,8,8,8,8,62,73,77,80,26,8,8,8,70,8,86,94,97,8,8,136,113,125,106,107,121,5,114,155,127,143,144,133,145,129,146,147,148,129,149,152,153,156,157,158,159,140,,,138,138,132],h(65,2,42,101,58,3,64,4),h(65,3,59,2,64,6),h(65,2),h(65,2,36,7,42,151,54,150,58,3,64,4),h(65,3),h(65,2,42,101,58,3,64,4),h(36,8),h(36,8),h(36,8),h(36,8,5,9),h(36,8,8,13),h(36,8,20,9),h(36,8,5,10),h(36,8,22,9),h(36,8,29,9),h(36,8,5,68),h(36,8,33,9),h(36,8,29,20),h(36,8,13,21),h(36,8,21,22),h(36,8,29,23),h(36,8,21,24),h(36,8,24,25),h(36,8,34,10),h(36,8,11,27),h(36,8,25,10),h(36,8,22,29),h(36,8,5,30),h(36,8,11,31),h(36,8,27,9),h(36,8,11,33,30,34),h(36,8,23,11,24,12),h(36,8,29,35),h(36,8,24,36),h(36,8,21,37),h(36,8,29,38),h(36,8,31,11),h(36,8,5,40,30,9),h(36,8,13,41,28,45),h(36,8,11,42),h(36,8,31,43),h(36,8,28,44),h(36,8,24,9),h(36,8,5,46),h(36,8,24,11),h(36,8,28,48),h(36,8,23,11),h(36,8,11,50,21,52,30,15,31,57),h(36,8,28,51),h(36,8,23,14),h(36,8,29,53),h(36,8,11,54),h(36,8,28,55),h(36,8,28,56),h(36,8,34,9),h(36,8,29,58),h(36,8,8,59),h(36,8,24,60),h(36,8,21,61),h(36,8,30,16),h(36,8,13,9,29,63),h(36,8,23,64),h(36,8,24,65),h(36,8,11,66),h(36,8,29,67),h(36,8,8,17),h(36,8,30,69),h(36,8,13,9),h(36,8,5,18,31,71),h(36,8,28,72),h(36,8,28,10),h(36,8,5,74),h(36,8,24,75),h(36,8,31,76),h(36,8,22,16),h(36,8,33,78),h(36,8,21,79),h(36,8,24,12),h(36,8,20,81,22,84,34,85),h(36,8,21,82,22,83),h(36,8,23,9),h(36,8,30,18),h(36,8,31,14,34,9),h(36,8,9,17),h(36,8,29,87),h(36,8,12,88),h(36,8,5,89),h(36,8,13,90),h(36,8,21,91),h(36,8,29,92),h(36,8,5,93),h(36,8,12,10),h(36,8,11,15,30,95),h(36,8,21,96),h(36,8,12,9),h(36,8,20,98,21,100),h(36,8,21,99),h(36,8,28,11),h(36,8,24,13),h(35,101,0,0,1,0,2,0,3,0),h(14,102,9,0),h(14,102,9,0),{0:105,1:105,2:105,3:105,4:109,5:109,7:122,14:103,37:108},{0:105,1:105,2:105,3:105,4:109,5:109,37:108},{0:104,1:105,2:105,3:105,36:137,37:111,39:140},{0:104,1:105,2:105,3:105,36:137,37:111,40:140},h(6,108,4,109,5,109),{0:110,1:110,2:110,3:110,39:112,40:112},h(4,110),h(4,108),h(4,110),h(4,108),{36:139,42:123,43:131,44:124},[115,115],{6:117,8:117},{17:118,22:118},{15:119,21:119},{9:120,16:120},{19:130,24:130},{36:137,41:141},[115,115],{18:116,23:116},{9:134,36:142},{36:139,38:126},{36:137,38:131},{36:137,45:141},{36:139},{36:137},{38:154},{36:137},{65:138},{36:128},{20:135},{9:142},{36:128}],F:[,,,,,7,,8,24,28,25,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,28,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,16,13,,13,13,7,7,13,,13,,,15,5,13,,,,,,,,,,5,,,5,7,,,2,4,,,8,8,2,5,4,9,22,1,3,6,10,11,12,14,17,18,19,20,21,23,26,27,29,30],R:[[2,f("234567",1)],[3,f("89",1)],[10,f("ABDF",1)],[14,f("Xx",1)],[26,f("GHJKLMOQUVWYZgjmqz",1)],[35,f("$_",1)],[63,f("\n\f\r*/[\\]ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789=01.>+-&<|\t !%?~'\",{}();:$_")]],TokensTable:',TAB,L_NEW_LINE,SPACES,UNARY_OPERATOR,COMPARISON_OPERATOR,S_SDQ,ARITHMETIC_OPERATOR,ASSIGNMENT_OPERATOR,LOGICAL_OPERATOR,S_SSQ,LPAREN,RPAREN,NUMBER,ELISION,DOT,R_REGULAR_EXPRESSION,S_MLC,S_SLC,COLON,SEMI,E_HTMLScript,S_PHP,QUESTION,JS_IDENTIFIER,JS_LITERAL,LBRACK,RBRACK,JS_KEYWORD,LBRACE,RBRACE'.split(',')}],
	["REGULAR_EXPRESSION",{A:g("[^\t ]","\t"," "),M:[,[2,3,4],[2]],F:[,,3,1,2],R:[[0,f("\t ")]],TokensTable:[,'TAB','SPACES','REGULAR_EXPRESSION_IN']}]
	])
o.addRules([["JS","BIG_JS|NOT_WHITE_SPACES"]])
o.addCSSClass("js=JS&regexp=R_REGULAR_EXPRESSION&keyword=JS_KEYWORD&literal=JS_LITERAL&identifier=JS_IDENTIFIER&operator=ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|COMPARISON_OPERATOR|LOGICAL_OPERATOR|UNARY_OPERATOR&elision=ELISION&punctuator=LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK|DOT|SEMI|QUESTION|COLON")
o.setPreviousTokenOf("R_REGULAR_EXPRESSION","ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|BITWISE_OPERATOR|COMPARISON_OPERATOR|LOGICAL_OPERATOR|ELISION|DOT|LPAREN|LBRACE|LBRACK|COLON|SEMI|QUESTION|JS_KEYWORD")
o.setTokensTranslation('R_REGULAR_EXPRESSION=REGULAR_EXPRESSION')

// PHP
o.addTokens([
	["BIG_PHP",{A:g("0","1","=","[234567]","[89]","a","o","e","b",".","E",">","r","f","n","c","+","-","d","\n","&",")","l","t","i","*","[ABCDF]","x","/","<","|","\t","\f","\r"," ","!","\"","%","'","(","y","j","s","g","X",",",":",";","?","@","[","]","{","}","~"),M:[,[4,5,20,5,5,52,28,,,11,,21,,,,,6,7,,58,18,65,,,,26,,54,15,16,22,60,58,29,61,30,62,26,63,10,,,,,,66,69,70,51,72,73,74,75,76,77],[2,2,,2,2,2,,2,2,,2,,,2,,2,,,2,,,,,,,,2],[2,2,,2,2,2,,2,2,,2,,,2,,2,,,2,,,,,,,,2],{0:5,1:5,3:5,4:5,7:9,8:19,9:8,10:9,27:3,44:3},[5,5,,5,5,,,9,,8,9],[4,5,55,5,5,,,,,13,,,,,,,59],[4,5,55,5,5,,,,,13,,,,,,,,59],[8,8,,8,8,,,9,,,9],[12,12,,12,12,,,,,,,,,,,,14,14],{5:31,6:42,8:35,13:38,24:41,42:46},h(5,8,2,55),h(5,12,2,0),[8,8,,8,8],h(5,12,2,0),{2:55,25:67,28:68},{2:56,11:56,29:27},[17,17],{2:55,20:57},[17,17],{2:25,11:55},{2:56,11:27},{2:55,30:57},{21:64},{23:23},[,,56],[,,55],[,,55],{12:57},{19:58},[,,25],{12:32},{12:33},{5:34},{40:23},{6:36},{6:37},{22:23},{22:39},{6:40},{5:24},{14:24},{8:43},{41:44},{7:45},{15:24},{23:47},{12:48},{24:49},{14:50},{43:23},{11:71},{14:53},{18:57},{6:28}],F:[,,14,,14,14,7,7,14,,11,16,14,,,7,5,14,9,,8,5,9,,,5,7,9,,2,4,,,,,,,,,,,,,,,,,,,,,21,,,,8,5,4,2,7,1,3,6,10,12,13,15,17,18,19,20,22,23,24,25,26,27,9],R:[[3,f("234567",1)],[4,f("89",1)],[26,f("ABCDF",1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,LOGICAL_OPERATOR,COMPARISON_OPERATOR,S_SDQ,ARITHMETIC_OPERATOR,ASSIGNMENT_OPERATOR,BITWISE_OPERATOR,S_SSQ,LPAREN,TYPE_OPERATOR,RPAREN,NUMBER,ELISION,STRING_OPERATOR,S_MLC,S_SLC,COLON,SEMI,QUESTION,E_PHP,ERROR_CONTROL_OPERATOR,LBRACK,RBRACK,LBRACE,RBRACE'.split(',')}],
	["PHP_ID",{A:g("A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","Q","R","S","T","U","V","[JWXYZjz]","_","a","b","c","d","e","f","g","h","i","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","[0123456789]","$"),M:[,[2,2,2,2,2,60,2,2,2,2,2,2,63,2,2,2,2,2,66,2,2,2,68,87,93,97,107,116,137,146,2,151,2,173,2,175,2,179,2,193,201,206,208,209,211,2,2,,24],h(48,2),h(48,3),h(48,2),h(48,2),h(48,3),h(48,2,41,4),h(48,2,27,5),h(48,2,27,4),h(48,2),h(48,2,22,74),h(48,2,40,4),h(48,2,25,117),h(48,2,23,127),h(48,3,17,6),h(48,3,18,6),h(48,3,17,16),h(48,2,4,10),h(48,2,41,131),h(48,2,27,10),h(48,2,27,163),h(48,2,40,172),h(48,2,31,192),h(48,3,6,25,22,30,41,56),h(48,3,10,26),h(48,3,13,27),h(48,3,1,28),h(48,3,0,29),h(48,3,10,15),h(48,3,2,31,4,36,5,38,6,41,14,42,16,43,17,47),h(48,3,13,32),h(48,3,13,33),h(48,3,9,34),h(48,3,8,35),h(48,3,4,6),h(48,3,12,37),h(48,3,20,6),h(48,3,8,39),h(48,3,10,40),h(48,3,4,15),h(48,3,4,16),h(48,3,13,17),h(48,3,4,44),h(48,3,15,45),h(48,3,19,46),h(48,3,4,17),h(48,3,4,48),h(48,3,16,49,17,52),h(48,3,20,50),h(48,3,4,51),h(48,3,16,6),h(48,3,17,53),h(48,3,8,54),h(48,3,13,55),h(48,3,12,6),h(48,3,30,57),h(48,3,31,58),h(48,3,40,59),h(48,3),h(48,2,0,61),h(48,2,10,62),h(48,2,17,18),h(48,2,19,64),h(48,2,10,65),h(48,2,10,10),h(48,2,16,67),h(48,2,19,18),h(48,2,22,69),h(48,2,2,70,5,75,11,82),h(48,2,10,71),h(48,2,0,72),h(48,2,17,73),h(48,2,17,11),h(48,2,22,4),h(48,2,19,76),h(48,2,12,77),h(48,2,2,78),h(48,2,18,79),h(48,2,8,80),h(48,2,13,81),h(48,2,12,11),h(48,2,4,83),h(48,2,18,84),h(48,2,7,85),h(48,2,13,86),h(48,2,3,11),h(48,2,24,88,40,4),h(48,2,40,89),h(48,2,41,90),h(48,2,39,91),h(48,2,23,92),h(48,2,25,7),h(48,2,39,94),h(48,2,27,95),h(48,2,23,96),h(48,2,32,5),h(48,2,23,98,33,99,36,102),h(48,2,40,8),h(48,2,23,100,36,101),h(48,2,40,12),h(48,2,35,9),h(48,2,35,103),h(48,2,40,7,41,104),h(48,2,31,105),h(48,2,35,106),h(48,2,42,8),h(48,2,27,108,31,9,36,5),h(48,2,25,109,28,112),h(48,2,33,110),h(48,2,23,111),h(48,2,39,8),h(48,2,23,113),h(48,2,42,114),h(48,2,33,115),h(48,2,41,5),h(48,2,23,13,25,118,33,120,34,124,43,14,45,128),h(48,2,30,5),h(48,2,30,119),h(48,2,36,4),h(48,2,40,121),h(48,2,27,122),h(48,2,31,123),h(48,2,28,5),h(48,2,37,125),h(48,2,41,126),h(48,2,46,4),h(48,2,33,4),h(48,2,25,129,31,7,41,134),h(48,2,27,130),h(48,2,37,19),h(48,2,31,132),h(48,2,36,133),h(48,2,35,4),h(48,2,27,135),h(48,2,35,136),h(48,2,26,12),h(48,2,23,138,31,140,36,141,42,144),h(48,2,33,139),h(48,2,40,20),h(48,2,35,14),h(48,2,39,142),h(48,2,27,143),h(48,2,23,13),h(48,2,35,145),h(48,2,25,19),h(48,2,33,147,36,149),h(48,2,36,148),h(48,2,24,14),h(48,2,41,150),h(48,2,36,5),h(48,2,28,5,34,152,35,159,40,22),h(48,2,37,153),h(48,2,33,154),h(48,2,27,155),h(48,2,34,156),h(48,2,27,157),h(48,2,35,158),h(48,2,41,12),h(48,2,25,160,41,167),h(48,2,33,161),h(48,2,42,162),h(48,2,26,21),h(48,2,22,164),h(48,2,36,165),h(48,2,35,166),h(48,2,25,8),h(48,2,27,168),h(48,2,39,169),h(48,2,28,170),h(48,2,23,171),h(48,2,25,9),h(48,2,27,7),h(48,2,31,174),h(48,2,40,7),h(48,2,27,176,42,177),h(48,2,44,4),h(48,2,33,178),h(48,2,33,10),h(48,2,39,180,42,190),h(48,2,31,181,36,184),h(48,2,35,7,43,182),h(48,2,23,183),h(48,2,41,9),h(48,2,41,185),h(48,2,27,186),h(48,2,25,187),h(48,2,41,188),h(48,2,27,189),h(48,2,26,4),h(48,2,24,191),h(48,2,33,23),h(48,2,25,4),h(48,2,27,194),h(48,2,38,195,41,198),h(48,2,42,196),h(48,2,31,197),h(48,2,39,21),h(48,2,42,199),h(48,2,39,200),h(48,2,35,5),h(48,2,41,202,44,204),h(48,2,23,203),h(48,2,41,23),h(48,2,31,205),h(48,2,41,13),h(48,2,39,207),h(48,2,42,20),h(48,2,35,22,40,9),h(48,2,23,210),h(48,2,39,4),h(48,2,30,212),h(48,2,31,213),h(48,2,33,8)],F:h(214,4,0,0,1,0,24,0,3,1,15,1,16,1,17,1,25,1,26,1,27,1,28,1,29,1,30,1,31,1,32,1,33,1,34,1,35,1,36,1,37,1,38,1,39,1,40,1,41,1,42,1,43,1,44,1,45,1,46,1,47,1,48,1,49,1,50,1,51,1,52,1,53,1,54,1,55,1,56,1,57,1,58,1,4,3,59,3,5,6,122,6,142,6,163,6,6,2,10,5),R:[[21,f("JWXYZjz",1)],[47,f("0123456789",1)]],TokensTable:',PHP_IDENTIFIER,PHP_SPECIAL_VARS,PHP_RESERVED,PHP_FUNCTION,PHP_LITERAL,PHP_KEYWORD'.split(',')}]
	])
o.addRules([["PHP","S_PHP|BIG_PHP|PHP_ID|NOT_WHITE_SPACES"]])
o.addCSSClass("php=PHP&tag=E_PHP&function=PHP_FUNCTION&identifier=PHP_IDENTIFIER&special=PHP_SPECIAL_VARS&keyword=PHP_KEYWORD|PHP_RESERVED&literal=PHP_LITERAL&operator=ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|BITWISE_OPERATOR|COMPARISON_OPERATOR|ERROR_CONTROL_OPERATOR|LOGICAL_OPERATOR|STRING_OPERATOR|TYPE_OPERATOR&elision=ELISION&punctuator=LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK|DOT|SEMI|QUESTION|COLON")

// Regexp one level
o.addTokens([
	["REGEXP",{A:g("[0123456789]","[ABCDEFabdef]","c","}",",","^","[GHIJKLMNOPQRSTUVWXYZghijklmnopqrstvwyz]","u","x",".","[","[()]","[*+?]","[-]]","[^\\cxu0123456789ABCDEFabdefGHIJKLMNOPQRSTUVWXYZghijklmnopqrstvwyz()*+?-]}[^{,|c\\x.]","\\","{","|","[cx]"),R:[[0,f("0123456789",1)],[1,f("ABCDEFabdef",1)],[6,f("GHIJKLMNOPQRSTUVWXYZghijklmnopqrstvwyz",1)],[11,f("()",1)],[12,f("*+?",1)],[13,f("-]",1)],[14,f("\\cxu0123456789ABCDEFabdefGHIJKLMNOPQRSTUVWXYZghijklmnopqrstvwyz()*+?-]}[^{,|c\\x.")],[18,f("cx",1)]],M:[,h(19,14,9,16,10,11,11,18,12,19,13,17,15,2,16,12,17,15),h(18,20,2,3,7,4,8,8),[,20,20,,,,20,20,20],[5,5,5],[6,6,6],[7,7,7],[20,20,20],[7,7,7],[9,,,13,10],[10,,,13],{5:17},[9]],F:[,,2,7,7,,,,7,,,4,,8,2,9,3,4,5,6,7],TokensTable:',,CHAR,ANY,CHARSET,PUNCTUATOR,QUANTIFIER2,CHAR_ESCAPED,QUANTIFIER1,PIPE'.split(',')}]
	])
o.addRules([["RegExp","REGEXP"]])
o.addCSSClass("charset=CHARSET&punctuator=PIPE|PUNCTUATOR&repetition=QUANTIFIER1|QUANTIFIER2&character=CHAR_ESCAPED|ANY|CHAR")

// ZenLike
o.addTokens([
	["ZEN",{A:g("0","1","[234567]","[89]","[Ee]","b","[ABCDFacdf]","-","[Xx]","[$@GHIJKLMNOPQRSTUVWYZ_ghijklmnopqrstuvwyz]",".","+","^"," ","\"","#","'","(",")","*",":","=",">","[","]"),M:[,[2,2,2,2,6,6,6,3,6,6,11,18,26,27,28,10,29,30,31,23,32,33,34,35,36],[2,2,2,2,4,6,6,6,6,6,17],[2,2,2,2,6,6,6,6,6,6,22],h(12,6,10,0,11,21),h(12,7,10,0,11,21),h(10,6),h(10,7),h(10,8),[9,9,9,9,5,7,7,7,7,7],h(10,8),[9,9,9,9,7,7,7,7,7,7],[15,15,15,15,16,25,,,14,,17],h(7,13),h(7,13),[15,15,15,15,16,,,,,,17],[19,19,19,19,,,,21,,,,21],h(5,17,4,16),[12,15,15,15,,,,,,,22],h(4,19),h(4,20),h(4,19),h(4,17),h(4,20),[24,24],[24,24],{12:26}],F:[,,10,10,10,11,10,11,3,11,,,9,9,,9,,9,8,9,7,,,,9,,17,1,2,4,5,6,12,13,14,15,16],R:[[2,f("234567",1)],[3,f("89",1)],[4,f("Ee",1)],[6,f("ABCDFacdf",1)],[8,f("Xx",1)],[9,f("$@GHIJKLMNOPQRSTUVWYZ_ghijklmnopqrstuvwyz",1)]],TokensTable:',SPACES,S_SNIPPET_SDQ,ELTID,S_SNIPPET_SSQ,LPAREN,RPAREN,MULTIPLICATION,PLUS,NUMBER,ELT,ELTCLASS,ARGUMENT_PREFIX,EQUAL,GTHAN,LBRACK,RBRACK,UP'.split(',')}],
	["SNIPPET_SSQ",{A:g("[^\n\f\r'\\]","\\","'"),M:[,[3,2,4],[3,3,3],[3,2]],F:[,,,2,1],R:[[0,f("\n\f\r'\\")]],TokensTable:[,'E_SNIPPET_SSQ','SNIPPET_SSQ_IN']}],
	["SNIPPET_SDQ",{A:g("[^\n\f\r\"\\]","\\","\""),M:[,[3,2,4],[3,3,3],[3,2]],F:[,,,2,1],R:[[0,f("\n\f\r\"\\")]],TokensTable:[,'E_SNIPPET_SDQ','SNIPPET_SDQ_IN']}]
	])
o.addCSSClass("elt=ELT&id=ELTID&className=ELTCLASS&multiplication=MULTIPLICATION&punctuator=ARGUMENT_PREFIX|LPAREN|RPAREN|LBRACK|EQUAL|RBRACK&operator=PLUS|GTHAN|UP&space=SPACES|TAB&string=SNIPPET_SSQ|SNIPPET_SSQ_IN|SNIPPET_SDQ|SNIPPET_SDQ_IN")
o.setTokensTranslation('SNIPPET_SSQ=STRING&SNIPPET_SSQ_IN=STRING&SNIPPET_SDQ=STRING&SNIPPET_SDQ_IN=STRING')

});
}