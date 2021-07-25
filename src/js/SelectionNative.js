Editor.prototype.placeHandle =function( evt ){
	var e = Events.element( evt )
	var D=this.oActiveDocument, S=D.oSelection, C=D.oCaret
	if( ! D.elementInTextZone( e )) return this.blur()
	var o = S.get()
	if( o && o.start!=o.end ){
		if( o.start!=null ) C.setIndex( o.start )
		}
	else{
		C.setPosition( D.oPositions.getFromEvent( evt ))
		this.focus()
		}
	}

Editor.addModule( 'Selection', (function(){
	var S =function( D ){
		this.oDocument = D
		var timer, timeout=400, nIndex
		, E = D.oEditor
		, S = this
		, C = D.oCaret
		E.oSelection = this
		var executeTripleClickFunction =function( evt ){
			if( S.cancel ) S.cancel()
			S.set( nIndex, nIndex )
			S.expand()
			}
		Events.add(
			document,
				'click', CallBack( E, E.placeHandle ),
				'mouseup', CallBack( E, E.placeHandle ),
				'dblclick', CallBack( E, E.placeHandle ),
				'selectstart', CallBack( E, E.placeHandle ),
			E.eEditor,
				"dblclick", function( evt ){
					nIndex = C.position.index
					timer = setTimeout( function(){timer=null}, timeout )
					},
				"click", function( evt ){
					if( timer ) executeTripleClickFunction() // selectionne une ligne
					}
			)
		}
	S.prototype ={
		exist :function(){ return S.getRange() },
		collapse :function(){  },
		getIndex :function( e, nIndex ){ // Idéalement la position de début ou de fin d'une sélection
			if( ! e ) return null
			if( e===this.oDocument.eContent ) return nIndex
			var eParent = e.parentNode, n = nIndex
			while( e = e.previousSibling ){
				if( e.textContent ) n += e.textContent.length
				else if( e.data ) n += e.data.length
				}
			return ( eParent===this.oDocument.eTZ ) ? n : this.getIndex( eParent, n )
			},
		getPosition :function( e, nIndex, nTraveled ){ // Idéalement la zone d'édition et un index de la source
			var eParent = e
			, nTraveled = nTraveled || 0
			for( var e = eParent.firstChild, n ; e ; e = e.nextSibling ){
				n = 0
				if( e.textContent ) n = e.textContent.length
				else if( e.data ) n = e.data.length
				if( nTraveled + n > nIndex ){
					if( e.data ) return { container:e, offset:nIndex-nTraveled }
					else if( e.textContent ) return this.getPosition( e, nIndex, nTraveled )
					}
				nTraveled += n
				}
			return null
			},
		get :function(){
			var o = S.getRange()
			if( o ){
				var nStart = this.getIndex( o.startContainer, o.startOffset )
				// if( nStart == null ) alert( o.startContainer.innerHTML )
				return {
					start:nStart,
					end:this.getIndex( o.endContainer, o.endOffset )
					}
				}
			return { start:0, end:0}
			},
		set :function( nStart, nEnd ){
			if( document.createRange ){
				var oRange = document.createRange()
				, oStart = this.getPosition( this.oDocument.eTZ, nStart )
				, oEnd = this.getPosition( this.oDocument.eTZ, nEnd )
				if( oStart ) oRange.setStart( oStart.container, oStart.offset )
				if( oEnd ) oRange.setEnd( oEnd.container, oEnd.offset )
				// oRange.deleteContents ();
				if( window.getSelection ){
					var o = window.getSelection()
					o.removeAllRanges()
					o.addRange( oRange )
					this.oDocument.oCaret.setIndex( nStart )
					}
				}
			},
		expand :function(){
			var o = this.get()
			if( o && ( o.start!=o.end || ( o.start==o.end  && o.start!=null ))){
				var s = this.oDocument.oSource.getValue()
				var nCharCode = this.oDocument.oSource.sNewLine.charCodeAt(0)
				for(; s.charCodeAt( o.start )!=nCharCode && o.start>0 ;o.start-- ) ;
				if ( s.charCodeAt( o.start )==nCharCode ) o.start++
				for(; s.charCodeAt( o.end )!=nCharCode && o.end<s.length ;o.end++ ) ;
				this.set( o.start, o.end )
				}
			},
		cloneContents :function(){
			return S.getText()
			},
		replace :function( sAdded ){
			var o = this.get(), sAdded = sAdded || ''
			if( o && o.start != o.end ){
				var sSource = this.oDocument.oSource.getValue()
				, nStart = o.start
				this.oDocument.updateContents({
					start: nStart,
					added: sAdded,
					deleted: this.cloneContents()
					})
				this.set( nStart, nStart + sAdded.length )
				}
			},
		showInfo :function(){
			
			}
		}
	S.union({
		cancel :function(){
			window.getSelection().removeAllRanges()
			},
		getRange :function(){
			if( window.getSelection ){ // all browsers, except IE before version 9
				var o = window.getSelection()
				return o.rangeCount>0 ? o.getRangeAt(0) : null
				}
			return null
			},
		getText :function(){
			var oRange = S.getRange()
			return oRange ? oRange.toString() : ''
			},
		cloneHTML :function(){
			var oRange = S.getRange()
			return oRange ? oRange.cloneContents() : ''
			},
		extractHTML :function(){
			var oRange = S.getRange()
			return oRange ? oRange.extractContents() : ''
			}
		})

	var newinstance =function( D ){
		D.oSelection = new S(D)
		Events.preventSelection( false, D.eTZ )
		}
	// Ajout automatique d'une instance à la création d'un document
	Events.add( Editor.prototype, 'documentinit', newinstance )
	// Ajoute une instance à tous les documents déjà existant
	Editor.mapDocuments( newinstance )
	// Active la possibilité d'éditer les documents
	Editor.Modules.Selection = true
	var s='onContentEditableChange'
	Editor.mapEditors( function(E){ if( E[s]) E[s]()})

	return S
	})())