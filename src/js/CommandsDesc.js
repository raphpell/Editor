var oCommandsDesc ={
	BACK_TAB:
		"- Si une s�lection existe : Supprime une tabulation au d�but des lignes de la s�lection.\n"+
		"- Si le curseur est en d�but de ligne, ou juste apr�s tous les espaces en d�but de ligne : D�sindente la ligne d'une tabulation.\n"+
		"- Dans le texte : D�place le curseur en arri�re suivant la largeur d'une tabulation."+
		"\n\n\t**BUG - placement du curseur � des index inexistant...**",
	CHAR_LEFT:
		"- Si une s�lection existe : D�place le curseur au d�but de celle-ci.\n"+
		"- Sinon d�place le curseur d'un caract�re � gauche.",
	CHAR_LEFT_EXTEND:
		"S�lection : Ajoute ou retire le caract�re gauche.",
	CHAR_RIGHT:
		"- Si une s�lection existe : D�place le curseur � la fin de celle-ci.\n"+
		"- Sinon d�place le curseur d'un caract�re � droite.",
	CHAR_RIGHT_EXTEND:
		"S�lection : Ajoute ou retire le caract�re droit.",
	CLEAR:
		"- Si une s�lection existe: Efface la s�lection.\n"+
		"- Sinon : Efface le caract�re droit",
	COPY:
		"Copie la s�lection dans le presse papier.",
	CUT:
		"Coupe la s�lection et la d�place dans le presse papier.",
	DELETE_BACK:
		"- Si une s�lection existe: Efface la s�lection.\n"+
		"- Sinon : Efface le caract�re gauche",
	DEL_LINE_LEFT:
		"Efface la portion de la ligne � gauche du curseur.\n"+
			"\t Si une s�lection existe � droite du curseur, elle est conserv�e.",
	DEL_LINE_RIGHT:
		"Efface la portion de la ligne � droite du curseur.\n"+
			"\t Si une s�lection existe � gauche du curseur, elle est conserv�e.",
	DEL_WORD_LEFT:
		"- Si le curseur est dans un mot : Efface la portion gauche.\n"+
		"- Si le curseur est entre deux mots : Efface le mot gauche.",
	DEL_WORD_RIGHT:
		"- Si le curseur est dans un mot : Efface la portion droite.\n"+
		"- Si le curseur est entre deux mots : Efface le mot droit.",
	DOCUMENT_NEW:
		"Nouveau document.",
	DOCUMENT_END:
		"Place le curseur � la fin du document.\n"+
			"\t (Annule la s�lection)",
	DOCUMENT_END_EXTEND:
		"Etend la s�lection � la fin du document depuis le curseur.\n"+
			"\t (Les caract�res s�lectionn�s apr�s le curseur sont d�selectionn�s)",
	DOCUMENT_START:
		"Place le curseur au d�but du document.\n"+
			"\t (Annule la s�lection)",
	DOCUMENT_START_EXTEND:
		"Etend la s�lection au d�but du document depuis le curseur.\n"+
			"\t (Les caract�res s�lectionn�s avant le curseur sont d�selectionn�s)",
	LINES_CLIMB_DOWN:
		"D�place une ou plusieurs lignes vers le bas.",
	LINES_CLIMB_UP:
		"D�place une ou plusieurs lignes vers le haut.",
	LINE_DELETE:
		"Supprime la ligne du curseur ou celle(s) de la s�lection.",
	LINE_DOWN:
		"D�place le curseur d'une ligne vers le bas.\n"+
			"\t (Annule la s�lection)",
	LINE_DOWN_EXTEND:
		"Etend la s�lection jusqu'� la position sous le curseur.\n"+
		"\t (Les caract�res s�lectionn�s apr�s le curseur sont d�selectionn�s)",
	LINE_END:
		"D�place le curseur en fin de ligne.",
	LINE_END_EXTEND:
		"Etend la s�lection jusqu'� la fin de la ligne.\n"+
		"\t (Les caract�res s�lectionn�s apr�s le curseur sont d�selectionn�s)",
	LINE_SCROLL_DOWN:
		"D�file la vue vers le bas d'une ligne.",
	LINE_SCROLL_UP:
		"D�file la vue vers le haut d'une ligne.",
	LINE_START:
		"D�place le curseur en d�but de ligne.",
	LINE_START_EXTEND:
		"Etend la s�lection jusqu'au d�but de la ligne (avec ou sans espace).\n"+
		"\t (Les caract�res s�lectionn�s avant le curseur sont d�selectionn�s)",
	LINE_TRANSPOSE:
		"Echange la position de la ligne du curseur avec celle de la ligne pr�c�dente.",
	LINE_UP: 
		"D�place le curseur d'une ligne vers le haut.\n"+
			"\t (Annule la s�lection)",
	LINE_UP_EXTEND:
		"Etend la s�lection jusqu'� la position au dessus du curseur.\n"+
		"\t (Les caract�res s�lectionn�s avant le curseur sont d�selectionn�s)",
	LOWERCASE:
		"Transforme la s�lection en minuscule.",
	NEW_LINE:
		"Ins�re un saut de ligne.",
	PAGE_DOWN:
		"D�file la vue vers le bas d'une page.",
	PAGE_DOWN_EXTEND: "",
	PAGE_UP:
		"D�file la vue vers le haut d'une page.",
	PAGE_UP_EXTEND: "",
	PASTE:
		"Colle le contenu du presse papier au curseur.",
	REDO: 
		"R�tabli l'action annul�e pr�c�demment.",
	SELECTION_DUPLICATE:
		"Duplique la s�lection ou la ligne du curseur.",
	SELECT_ALL:
		"S�lectionne tout.\n"+
			"\t (Place le curseur devant le premier caract�re)",
	SET_ZOOM:
		"Restaure la taille des caract�res du document par d�faut.",
	TAB:
		"Ins�re une tabulation, ou si une s�lection pr�existe indente des lignes.",
	UNDO: 
		"Annule l'action r�alis�e pr�c�demment.",
	UPPERCASE:
		"Transforme la s�lection en MAJUSCULE.",
	WORD_LEFT:
		"D�place le curseur � la limite gauche du mot.",
	WORD_LEFT_EXTEND:
		"Etend la s�lection jusqu'� la premi�re limite gauche de mot.\n"+
		"\t (Les caract�res s�lectionn�s avant le curseur sont d�selectionn�s)",
	WORD_RIGHT:
		"D�place le curseur � la limite droite du mot.",
	WORD_RIGHT_END_EXTEND:
		"Etend la s�lection jusqu'� la premi�re limite droite de mot.\n"+
		"\t (Les caract�res s�lectionn�s apr�s le curseur sont d�selectionn�s)",
	ZOOM_IN:
		"Agrandit la taille des caract�res du document.",
	ZOOM_OUT:
		"R�duit la taille des caract�res du document."
	}