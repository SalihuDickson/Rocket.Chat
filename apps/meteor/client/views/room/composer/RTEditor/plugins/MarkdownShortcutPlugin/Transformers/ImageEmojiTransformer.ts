import type { TextMatchTransformer } from '@lexical/markdown';
import { $isImageNode, ImageNode } from '../../../nodes/ImageNode';

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

		// Remove file extension if present
		const emojiCode = imageNode.getDataEmoji();
		return emojiCode;
	},
	regExp: IMAGE_REGEX,
};
