function getCodeComments( oEditor, oComments ){
	var getLineNumber =function( nLine ){
		return '<i class="lineNumber">'+nLine+'</i>'
		}
	var D = oEditor.oActiveDocument
	var ni = D.oSource.countLines()
	var a = D.oSyntax.getLines( 1, ni ) 
	for( var i=0; i<ni; i++ ){
		var mNote = oComments[i+1]
		if( ! mNote || mNote.constructor==String )
			a[i] = '<div class="line">'
				+ ( mNote ? '<div class="note">'+ mNote +'</div>' : '<div>&nbsp;</div>' )
				+'<pre class="code">' + getLineNumber(i+1)+ a[i] +'</pre></div>'
		else{
			var aCode = []
			for(var j=i; j<mNote[0]; j++ ){
				aCode.push( getLineNumber(j+1)+ a[j])
				a[j] = ''
				}
			a[i] = '<div class="line">'
				+ ( mNote[1] ? '<div class="note"'+(mNote[2]?'style="background:'+mNote[2]+'"':'')+'>'+ mNote[1] +'</div>' : '<div>&nbsp;</div>' )
				+'<pre class="code">'+ aCode.join('') +'</pre></div>'
			i = mNote[0]-1
			}
		}
	return a.join('')
	}