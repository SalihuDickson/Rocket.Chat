import type { ElementTransformer, TextMatchTransformer, Transformer } from '@lexical/markdown';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { $isImageNode, ImageNode, $createImageNode } from '../../../nodes/ImageNode';
import { $createTextNode } from 'lexical';
import emojiJson from 'emojione-assets/emoji.json';

// Regular expression for matching Markdown image syntax
const IMAGE_REGEX = /!\[(.*?)\]\((.*?)\)/;

export const IMAGE_EMOJI_TRANSFORMER: TextMatchTransformer = {
	type: 'text-match',
	dependencies: [ImageNode],
	export: (node) => {
		if (!$isImageNode(node)) {
			return null;
		}

		const imageNode = node as ImageNode;
		const src = imageNode.getSrc();
		const filename = src.split('/').pop() || '';

		// Remove file extension if present
		const emojiCode = filename.split('.')[0];

		for (const key in emojiJson) {
			// use shortname instead of name
			if (emojiCode === key) {
				return emojiJson[key]['shortname'];
			}
		}

		return ``;
	},
	regExp: IMAGE_REGEX,
	// importRegExp: IMAGE_REGEX,
	// replace: (textNode, match: RegExpMatchArray): void => {
	// 	const [, altText, src] = match;
	// 	const imageNode = $createImageNode({
	// 		altText,
	// 		src,
	// 	});

	// 	textNode.replace(imageNode);
	// },
	// trigger: ')',
};
