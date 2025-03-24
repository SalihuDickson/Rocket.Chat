/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $insertNodes, LexicalEditor, RangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $createImageNode } from '../../nodes/ImageNode';

import { useEffect, RefObject, useCallback } from 'react';
import { CustomTypeaheadMatch, customTypeAheadTriggerMatch } from '../utils';
import { useChat } from '../../../../contexts/ChatContext';
import emojiJson from 'emojione-assets/emoji.json';
import { INSERT_EMOJI_COMMAND } from '../../commands';
import { Emoji, Skin } from '@emoji-mart/data';
import { $createEmojiNode } from '../../nodes/EmojiNode';

const PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>:;';

function getTextUpToAnchor(selection: RangeSelection): string | null {
	const anchor = selection.anchor;
	if (anchor.type !== 'text') {
		return null;
	}
	const anchorNode = anchor.getNode();
	if (!anchorNode.isSimpleText()) {
		return null;
	}
	const anchorOffset = anchor.offset;
	return anchorNode.getTextContent().slice(0, anchorOffset);
}

function getQueryTextForSearch(editor: LexicalEditor): string | null {
	let text = null;
	editor.getEditorState().read(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) {
			return;
		}
		text = getTextUpToAnchor(selection);
	});
	return text;
}

export function findEmojiCode(searchStr: string): string | null {
	for (const key in emojiJson) {
		const name = emojiJson[key as keyof typeof emojiJson]['shortname'];

		if (name === ':' + searchStr + ':') {
			return key;
		}
	}

	return null;
}

export default function EmojiPickerPlugin({ messageRef }: { messageRef: RefObject<HTMLElement> }) {
	const [editor] = useLexicalComposerContext();
	const chat = useChat();

	const replaceEmojiStrWithEmoji = useCallback(
		(emoji: string, { nodeToReplace, startIndex, endIndex }: CustomTypeaheadMatch) => {
			editor.update(() => {
				const emojiNode = $createEmojiNode('', emoji);

				if (!nodeToReplace) {
					$insertNodes([emojiNode]);
					return;
				}

				if (startIndex > -1) {
					const [beforeNode, midNode, afterNode] = nodeToReplace.splitText(startIndex, endIndex);

					if (midNode) midNode.replace(emojiNode);
					else if (beforeNode) beforeNode.replace(emojiNode);

					// Set selection after the image
					if (afterNode) {
						afterNode.select(0, 0);
					} else {
						emojiNode.selectNext();
					}
				} else {
					$insertNodes([emojiNode]);
					nodeToReplace.remove();
				}
			});
		},
		[editor],
	);

	useEffect(() => {
		const removeTextContentListener = editor.registerTextContentListener(() => {
			const text = getQueryTextForSearch(editor);

			if (!text) return;
			const match = customTypeAheadTriggerMatch(
				':',
				{
					minLength: 0,
				},
				PUNCTUATION,
			)(text, editor);

			if (!match) return;
			chat?.emojiPicker.open(messageRef!.current as Element, (emoji) => {
				replaceEmojiStrWithEmoji(emoji.native, match);
				chat?.emojiPicker?.close();
			});
		});

		return () => {
			removeTextContentListener();
		};
	}, []);

	useEffect(() => {
		const removeListener = editor.registerCommand<Emoji & Skin>(
			INSERT_EMOJI_COMMAND,
			(emoji: Emoji & Skin) => {
				editor.update(() => {
					const emojiNode = $createEmojiNode('', emoji.native);
					$insertNodes([emojiNode]);
				});

				return true;
			},
			COMMAND_PRIORITY_EDITOR,
		);

		return () => {
			removeListener();
		};
	}, [editor]);

	return <></>;
}
