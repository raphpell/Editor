Editor.addModule('UndoStack',(function(){
	Editor.extend( 'Commands', {
		REDO :function(D){if(D)D.oUndoStack.redo()},
		UNDO :function(D){if(D)D.oUndoStack.undo()}
		})
	Editor.extend( 'KeyBoard', {
		'CTRL+Y': 'REDO',
		'CTRL+Z': 'UNDO'
		})

	var UndoStack =function( D, fApplyMethod ){
		var a,n,saved,US=this
		,_Next={
			Redo :function(){return US.haveRedo()?a[++n]:null},
			Undo :function(){return US.haveUndo()?a[n--]:null}
			}
		,_move =function( s ){
			var o = _Next[s]()
			if( !o ) return;
			if( !(o.added||o.deleted||o.Undo||o.Redo))
				throw new Error( JSON.stringify(o))
			var f
			if( f=o[s] ){ f(); return US.onchange()}
			if( s=='Undo' )
				o={start:o.start,deleted:o.added,added:o.deleted,action:o.action}
			if( f=fApplyMethod ) f( o, true )
			if( o.action && US['have'+s]())
				if( o.action==a[n+(s=='Redo'?1:0)].action )
					return _move( s )
			var S=D.oSelection, nIndex=o.start+o.added.length
			D.oCaret.setIndex( nIndex )
			if( o.added ) S.set( o.start, nIndex ); else S.collapse()
			US.onchange()
			}
		Events.add( US, 'change', CallBack( US, function(){
			var m = D.oEditor.oTopMenu
			if( m = m && m.MenuItem.set ){
				m('UNDO',US.haveUndo()?'enable':'disable')
				m('REDO',US.haveRedo()?'enable':'disable')
				m('DOCUMENT_SAVE',US.isSaved()?'disable':'enable')
				}
			}))
		US.acquire({
			clear :function(){a=[];n=-1;US.onchange()},
			haveRedo :function(){return n<a.length-1},
			haveUndo :function(){return n>-1},
			isSaved :function(){return a[n]==saved },
			markSaved :function(){
				var m = D.oEditor.oTopMenu
				if( m = m && m.MenuItem.set ){
					saved = a[n]
					m('DOCUMENT_SAVE','disable')
					}
				},
			unmarkSaved :function(){
				saved = -1
				var m = D.oEditor.oTopMenu
				if( m = m && m.MenuItem.set )
					m('DOCUMENT_SAVE','enable')
				},
			redo :function(){_move('Redo')},
			undo :function(){_move('Undo')},
			getList :function( bComplete ){
				if( bComplete ) return {n:n,a:a}
				var aInfo=[], nPos=-1, sAction=''
				for(var i=0, ni=a.length; i<ni; i++ ){
					var o = a[i]
					if( !sAction || sAction!=o.action ) aInfo.push(o)
					sAction = o.action||''
					if( i==n ) nPos = aInfo.length-1
					}
				return {n:nPos,a:aInfo}
				},
			moveTo :function( nPos, b ){
				var o=US.getList(b)
				, nPos=Math.max( -1, Math.min( nPos, o.a.length-1 ))
				if(nPos<o.n) while(nPos<o.n){US.undo();o=US.getList(b)}
					else while(nPos>o.n){US.redo();o=US.getList(b)}
				},
			push :function( m ){
				if( n<a.length-1 ) a=a.slice(0,n+1)
				var o = a[a.length-1]
				if( o && o!=saved && !o.action && !(o.deleted&&o.added)){
					if( o.added && m.added && o.start+o.added.length==m.start ){
						o.added += m.added
						US.onchange()
						return o
						}
					if( o.deleted && m.deleted ){
						var b1=o.start==m.start+m.deleted.length
						, b2=o.start==m.start
						if( b1 ) o.deleted = m.deleted + o.deleted
						if( b2 ) o.deleted += m.deleted
						if( b1 || b2 ){
							o.start = m.start
							US.onchange()
							return o
							}
						}
					}
				a.push( m )
				++n
				US.onchange()
				return m
				}
			})
		US.clear()
		}	

	var newinstance =function( D ){
		var H = D.oUndoStack = new UndoStack ( D, CallBack( D, 'updateContents' ))
		Events.add( H, 'change', CallBack( D.oEditor, 'onhistorychange' ))
		}
	// Ajout automatique d'une instance à la création d'un document
	Events.add( Editor.prototype, 'documentinit', newinstance )
	// Ajoute une instance à tous les documents déjà existant
	Editor.mapDocuments( newinstance )

	return UndoStack
	})())