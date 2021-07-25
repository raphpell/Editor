Editor.addModule('Numbers',(function(){
	var N ={
		getPrecision :function( n ){
			var s = n.toString()
			return s.indexOf('.')==-1 ? 0 : s.split('.')[1].length
			},
		trim :function( n ){
			return n.toString().replace( /\.0*$/, '' )
			},
		get :function(C,T){
			var n = C.position.index, s = '+-0123456789.', src = T.getValue()
			if( s.indexOf( T.charAt( n ))==-1 ) n--
			var n1=n, n2=n
			while( n1>-1 && s.indexOf( T.charAt( n1 ))>-1 ) n1--
			n1++
			while( n2 < src.length && s.indexOf( T.charAt( n2 ))>-1 ) n2++
			var sNumber = src.slice( n1, n2 )
			if( ! /[+-]?(\d+\.\d*|\.?\d+)/.test( sNumber )) return null
			sNumber = this.trim( sNumber )
			return { n1:n1, n2:n2, n:new Number(sNumber), nFixed:this.getPrecision(sNumber)}
			},
		set :function(C,S,T,n){
			var o = this.get(C,T)
			if( o ){
				o.n += n
				o.n = o.n.toFixed( o.nFixed || this.getPrecision( n ))
				if( S ){
					S.set( o.n1, o.n2 )
					S.replace( this.trim( o.n ), false )
					}
				C.setIndex( o.n1 )
				}
			}
		}
	var _increment =function( n ){ return function(D,C,S,T){ N.set(C,S,T,n)}}
	Editor.extend( 'Commands', {
		INCREMENT_DOT :_increment(.1),
		INCREMENT_ONE :_increment(1),
		INCREMENT_TEN :_increment(10),
		DECREMENT_DOT :_increment(-.1),
		DECREMENT_ONE :_increment(-1),
		DECREMENT_TEN :_increment(-10)
		})
	Editor.extend( 'KeyBoard', {
		'ALT+UP':'INCREMENT_DOT',
		'ALT+DOWN':'DECREMENT_DOT',
		'CTRL+UP':'INCREMENT_ONE', // Efface le raccourcie de la commande LINE_SCROLL_UP
		'CTRL+DOWN':'DECREMENT_ONE', // Efface le raccourcie de la commande LINE_SCROLL_DOWN
		'CTRL+ALT+UP':'INCREMENT_TEN',
		'CTRL+ALT+DOWN':'DECREMENT_TEN'
		})
	return N
	})())