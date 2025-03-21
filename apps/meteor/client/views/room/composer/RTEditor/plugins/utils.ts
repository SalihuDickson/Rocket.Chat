import { LexicalEditor, $getSelection, $isRangeSelection, TextNode } from 'lexical';

export interface LengthOptions {
	minLength?: number;
	maxLength?: number;
}

export interface CustomTypeaheadMatch {
	leadOffset: number;
	matchingString: string;
	replaceableString: string;
	nodeToReplace: TextNode | null;
	startIndex: number; // Position where the emoji string starts in the node
	endIndex: number; // Position where the emoji string ends in the node
}

export const customTypeAheadTriggerMatch = (trigger: string, { minLength = 1, maxLength = 75 }: LengthOptions, punctuation = '') => {
	return (text: string, editor?: LexicalEditor): CustomTypeaheadMatch | null => {
		const validChars = '[^' + trigger + punctuation + '\\s]';
		const TypeaheadTriggerRegex = new RegExp('(^|\\s|\\()(' + '[' + trigger + ']' + '((?:' + validChars + '){0,' + maxLength + '})' + ')$');

		const match = TypeaheadTriggerRegex.exec(text);
		if (match !== null) {
			const maybeLeadingWhitespace = match[1];
			const matchingString = match[3];

			if (matchingString.length >= minLength) {
				let nodeToReplace: TextNode | null = null;
				let startIndex = -1;
				let endIndex = -1;

				// Get the node containing the match if editor is available
				if (editor) {
					editor.getEditorState().read(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							const anchor = selection.anchor;
							const anchorNode = anchor.getNode();
							if (anchorNode.getType() === 'text') {
								nodeToReplace = anchorNode as TextNode;

								// Find the exact position of the emoji string in the node
								const nodeText = nodeToReplace.getTextContent();
								const emojiString = match[2]; // The full replaceable string including trigger

								// Find the last occurrence of the emoji string
								// (since we're matching at the end of the text)
								startIndex = nodeText.lastIndexOf(emojiString);
								if (startIndex !== -1) {
									endIndex = startIndex + emojiString.length;
								}
							}
						}
					});
				}

				return {
					leadOffset: match.index + maybeLeadingWhitespace.length,
					matchingString,
					replaceableString: match[2],
					nodeToReplace,
					startIndex,
					endIndex,
				} as CustomTypeaheadMatch;
			}
		}
		return null;
	};
};
