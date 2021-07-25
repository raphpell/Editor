var oCommandsDesc ={
	BACK_TAB:
		"- Si une sélection existe : Supprime une tabulation au début des lignes de la sélection.\n"+
		"- Si le curseur est en début de ligne, ou juste après tous les espaces en début de ligne : Désindente la ligne d'une tabulation.\n"+
		"- Dans le texte : Déplace le curseur en arrière suivant la largeur d'une tabulation."+
		"\n\n\t**BUG - placement du curseur à des index inexistant...**",
	CHAR_LEFT:
		"- Si une sélection existe : Déplace le curseur au début de celle-ci.\n"+
		"- Sinon déplace le curseur d'un caractère à gauche.",
	CHAR_LEFT_EXTEND:
		"Sélection : Ajoute ou retire le caractère gauche.",
	CHAR_RIGHT:
		"- Si une sélection existe : Déplace le curseur à la fin de celle-ci.\n"+
		"- Sinon déplace le curseur d'un caractère à droite.",
	CHAR_RIGHT_EXTEND:
		"Sélection : Ajoute ou retire le caractère droit.",
	CLEAR:
		"- Si une sélection existe: Efface la sélection.\n"+
		"- Sinon : Efface le caractère droit",
	COPY:
		"Copie la sélection dans le presse papier.",
	CUT:
		"Coupe la sélection et la déplace dans le presse papier.",
	DELETE_BACK:
		"- Si une sélection existe: Efface la sélection.\n"+
		"- Sinon : Efface le caractère gauche",
	DEL_LINE_LEFT:
		"Efface la portion de la ligne à gauche du curseur.\n"+
			"\t Si une sélection existe à droite du curseur, elle est conservée.",
	DEL_LINE_RIGHT:
		"Efface la portion de la ligne à droite du curseur.\n"+
			"\t Si une sélection existe à gauche du curseur, elle est conservée.",
	DEL_WORD_LEFT:
		"- Si le curseur est dans un mot : Efface la portion gauche.\n"+
		"- Si le curseur est entre deux mots : Efface le mot gauche.",
	DEL_WORD_RIGHT:
		"- Si le curseur est dans un mot : Efface la portion droite.\n"+
		"- Si le curseur est entre deux mots : Efface le mot droit.",
	DOCUMENT_NEW:
		"Nouveau document.",
	DOCUMENT_END:
		"Place le curseur à la fin du document.\n"+
			"\t (Annule la sélection)",
	DOCUMENT_END_EXTEND:
		"Etend la sélection à la fin du document depuis le curseur.\n"+
			"\t (Les caractères sélectionnés après le curseur sont déselectionnés)",
	DOCUMENT_START:
		"Place le curseur au début du document.\n"+
			"\t (Annule la sélection)",
	DOCUMENT_START_EXTEND:
		"Etend la sélection au début du document depuis le curseur.\n"+
			"\t (Les caractères sélectionnés avant le curseur sont déselectionnés)",
	LINES_CLIMB_DOWN:
		"Déplace une ou plusieurs lignes vers le bas.",
	LINES_CLIMB_UP:
		"Déplace une ou plusieurs lignes vers le haut.",
	LINE_DELETE:
		"Supprime la ligne du curseur ou celle(s) de la sélection.",
	LINE_DOWN:
		"Déplace le curseur d'une ligne vers le bas.\n"+
			"\t (Annule la sélection)",
	LINE_DOWN_EXTEND:
		"Etend la sélection jusqu'à la position sous le curseur.\n"+
		"\t (Les caractères sélectionnés après le curseur sont déselectionnés)",
	LINE_END:
		"Déplace le curseur en fin de ligne.",
	LINE_END_EXTEND:
		"Etend la sélection jusqu'à la fin de la ligne.\n"+
		"\t (Les caractères sélectionnés après le curseur sont déselectionnés)",
	LINE_SCROLL_DOWN:
		"Défile la vue vers le bas d'une ligne.",
	LINE_SCROLL_UP:
		"Défile la vue vers le haut d'une ligne.",
	LINE_START:
		"Déplace le curseur en début de ligne.",
	LINE_START_EXTEND:
		"Etend la sélection jusqu'au début de la ligne (avec ou sans espace).\n"+
		"\t (Les caractères sélectionnés avant le curseur sont déselectionnés)",
	LINE_TRANSPOSE:
		"Echange la position de la ligne du curseur avec celle de la ligne précédente.",
	LINE_UP: 
		"Déplace le curseur d'une ligne vers le haut.\n"+
			"\t (Annule la sélection)",
	LINE_UP_EXTEND:
		"Etend la sélection jusqu'à la position au dessus du curseur.\n"+
		"\t (Les caractères sélectionnés avant le curseur sont déselectionnés)",
	LOWERCASE:
		"Transforme la sélection en minuscule.",
	NEW_LINE:
		"Insère un saut de ligne.",
	PAGE_DOWN:
		"Défile la vue vers le bas d'une page.",
	PAGE_DOWN_EXTEND: "",
	PAGE_UP:
		"Défile la vue vers le haut d'une page.",
	PAGE_UP_EXTEND: "",
	PASTE:
		"Colle le contenu du presse papier au curseur.",
	REDO: 
		"Rétabli l'action annulée précédemment.",
	SELECTION_DUPLICATE:
		"Duplique la sélection ou la ligne du curseur.",
	SELECT_ALL:
		"Sélectionne tout.\n"+
			"\t (Place le curseur devant le premier caractère)",
	SET_ZOOM:
		"Restaure la taille des caractères du document par défaut.",
	TAB:
		"Insère une tabulation, ou si une sélection préexiste indente des lignes.",
	UNDO: 
		"Annule l'action réalisée précédemment.",
	UPPERCASE:
		"Transforme la sélection en MAJUSCULE.",
	WORD_LEFT:
		"Déplace le curseur à la limite gauche du mot.",
	WORD_LEFT_EXTEND:
		"Etend la sélection jusqu'à la première limite gauche de mot.\n"+
		"\t (Les caractères sélectionnés avant le curseur sont déselectionnés)",
	WORD_RIGHT:
		"Déplace le curseur à la limite droite du mot.",
	WORD_RIGHT_END_EXTEND:
		"Etend la sélection jusqu'à la première limite droite de mot.\n"+
		"\t (Les caractères sélectionnés après le curseur sont déselectionnés)",
	ZOOM_IN:
		"Agrandit la taille des caractères du document.",
	ZOOM_OUT:
		"Réduit la taille des caractères du document."
	}