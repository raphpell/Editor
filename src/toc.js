var oIndexes = {}
, aDecimalNumbers = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15'.split(',')
, aLowerRomanNumbers = 'i,ii,iii,iv,v,vi,vii,viii,ix,x,xi,xii,xiii,xiv,xv'.split(',')
, aUpperRomanNumbers = 'I,II,III,IV,V,VI,VII,VIII,IX,X,XI,XII,XIII,XIV,XV'.split(',')
, setTOC =function( sLink ){
	var sStart = oIndexes[ sLink ] || '0.'
	var sNumber, sTitle
	var eTOC = document.createElement('DL')
	eTOC.className = 'toc'
	var aH1 = document.getElementsByTagName('H1')
	var aH2 = document.getElementsByTagName('H2')
	if( aH1.length==1 ){
		var eH1 = aH1[0]
		eH1.innerHTML = sStart +' '+ eH1.innerHTML
		}
	if( aH2.length>0 ){
		eH1.parentNode.insertBefore( eTOC, eH1.nextSibling )
		}
	
	var fGenerate =function( eH, sNumber, eTocParent ){
		var eDTH = document.createElement('DT')
		eDTH.innerHTML = '<b>'+ sNumber + '</b><a href="#'+sNumber+'">' + eH.innerHTML.trim() + '</a>'
		eH.innerHTML = '<a href="#" class="up_arrow">\u25B2</a><a name="'+sNumber+'">' + sNumber +' '+ eH.innerHTML + '</a>'
		eTocParent.appendChild( eDTH )
		}
			
	for( var i=0, ni=aH2.length; i<ni; i++ ){
		var sChapitre = /* sStart + */ aUpperRomanNumbers[i] + '.'
		
		var eH2 = aH2[i]
		fGenerate( eH2, sChapitre, eTOC )
		
		var aH3 = eH2.parentNode.getElementsByTagName('H3')
		if( aH3.length==0 ) continue ;
		var eDDH3 = document.createElement('DD')
		
		for( var j=0, nj=aH3.length; j<nj; j++ ){
			var eH3 = aH3[j]
			fGenerate( eH3, sChapitre + aDecimalNumbers[j] + '.', eDDH3 )
			}
			
		eTOC.appendChild( eDDH3 )
		}
	}
, Item =function( sTitle, sLink, aChild ){
	var eLI = document.createElement('LI'), eA
	eLI.sTitle = sTitle
	eLI.sLink = sLink
	eLI.bIndexed = sTitle.charAt(0)!='<'
	eLI.nDepth = 0
	eLI.setIndex =function( s ){
		var eB, eFirst=this.firstChild
		if( eFirst.nodeName!='B' )
			this.insertBefore( eB=document.createElement('B'), eFirst )
		else
			eB = eFirst
		this.sIndex = s
		eB.innerHTML = s + eB.innerHTML
		if( this.lastChild.nodeName=="OL" ){
			var a = this.lastChild.childNodes
			for(var i=0, ni=a.length; i<ni ; i++)
				if( a[i].bIndexed )
					a[i].setIndex( s )
			}
		return oIndexes[ this.sLink ] = eB.innerHTML
		}
	if( sLink ){
		eA = document.createElement('A')
		eA.innerHTML = sTitle
		eA.href = sLink
		eLI.appendChild( eA )
		}
	else eLI.innerHTML = sTitle
	if( aChild && aChild.length ){
		var eOL = document.createElement('OL')
		for(var i=0, nIndex=1, ni=aChild.length; i<ni; i++ ){
			var eChild = aChild[i]
			eOL.appendChild( eChild )
			if( eChild.bIndexed ) eChild.setIndex( nIndex++ +'.')
			}
		eLI.appendChild( eOL )
		}
	return eLI
	}
, sSummary = Item('ROOT','',[
	 Item("Etude de cas",					'',
			[// Item("Superposition d'éléments",	'1.1.Superposition.htm'),
			Item("Le texte source",			'CaseStudy.Source.htm')
			,Item("La sélection native",	'CaseStudy.NativeSelection.htm')
			,Item("Le copier-coller",		'CaseStudy.Clipboard.htm')
			])
	,Item("L'éditeur",						'Editor.htm',
			[Item("Les documents",			'Document.htm')
	//		,Item("Les marges intérieurs",		'')
			,Item("Les bloques HTML",		'HTMLZone._.htm',
					[Item("<small>Editeur</small>" )
					,Item("Les onglets<i>TabMenu</i>",			'HTMLZone.TabMenu.htm')
					,Item("Le menu<i>TopMenu</i>",				'HTMLZone.TopMenu.htm')
					,Item("La barre de status<i>Status</i>",	'HTMLZone.Status.htm')
					,Item("La poignée dimension<i>Grip</i>",	'HTMLZone.Grip.htm')
					,Item( "<small>Document</small>" )
					,Item("Les caractères<i>Character</i>",		'HTMLZone.Character.htm')
					,Item("Le curseur<i>Caret</i>",				'HTMLZone.Caret.htm')
					,Item("Les numéros de ligne<i>Gutter</i>",	'HTMLZone.Gutter.htm')
					,Item("Les lignes<i>Lines</i>", 			'')
					,Item("Les colonnes<i>Cols</i>", 			'')
					,Item("La ligne courante<i>CurrentLine</i>",'HTMLZone.CurrentLine.htm')
					,Item("La zone texte<i>TextZoneControl</i>",'HTMLZone.TextZoneControl.htm')
					])
			,Item("Les modules",	'Module._.htm',
					[Item("<small>Base</small>" )
					,Item("Le texte source<i>Source</i>",			'Module.Source.htm')
					,Item("Les tabulations<i>Tabulation</i>",		'Module.Tabulation.htm')
					,Item("Les sauts de ligne<i>NewLine</i>",		'Module.NewLine.htm')
					,Item("Les positions<i>Positions</i>",			'Module.Positions.htm')
					,Item("Les lignes vues<i>View</i>",				'Module.View.htm')
			//		,Item("Les intervalles de temps<i>Interval</i>",'')
					,Item("<small>Extensions</small>" )
					,Item("Sélection simple<i>Selection</i>",		'Module.Selection.htm')
					,Item("Historique d'édition<i>UndoStack</i>",	'Module.UndoStack.htm')
					,Item("Les commandes",							'Module.Commands.htm')
					,Item("Le clavier",								'Module.KeyBoard.htm')
					,Item("Replie de bloque<i>Fold</i>",			'Module.Fold.htm')
					,Item("Surlignage<i>TextMarker</i>",			'Module.TextMarker.htm')
					,Item("Symboles opposés<i>Brackets</i>",		'Module.Brackets.htm')
					,Item("Snippet<i>Snippet</i>",					'Module.Snippet.htm')
					,Item("Modification des nombres<i>Numbers</i>",	'Module.Numbers.htm')
					,Item("Les fenêtres modales<i>Dialog</i>",		'Module.Dialog.htm' )
					,Item("Les thèmes",								'')
					])
			,Item("Les stratégies",			'',
					[Item("Affichage de la source<i>Render</i>",		'Strategy.Render.htm')
					,Item("Colorisation lexicale<i>Highlighting</i>",	'Strategy.Highlighting.htm',
							[Item("La stratégie Syntax",				'Strategy.Highlighting.Syntax.htm' )
							])
					])
			])
	]).lastChild.innerHTML