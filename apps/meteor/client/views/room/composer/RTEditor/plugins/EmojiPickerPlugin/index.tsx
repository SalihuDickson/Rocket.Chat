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
import { emoji as emojiPackage } from '/app/emoji/client';
import { INSERT_EMOJI_IMAGE_COMMAND } from '../../commands';
import { getEmojiUrlFromName } from '/app/emoji-custom/client/lib/emojiCustom';

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

	const replaceEmojiStrWithImage = useCallback(
		(emoji: string, { nodeToReplace, startIndex, endIndex }: CustomTypeaheadMatch) => {
			const emojiCode = findEmojiCode(emoji);
			const shortcode = ':' + emoji + ':';
			const packageName = emojiPackage.list[shortcode].emojiPackage;
			let src = '';

			if (packageName === 'emojione') {
				src = `/emojione-assets/png/32/${emojiCode}.png`;
			} else if (packageName === 'emojiCustom') {
				const dataCheck = emojiPackage.list[shortcode];
				src = getEmojiUrlFromName(shortcode.replace(/:/g, ''), dataCheck.extension!, dataCheck.etag) || '';
			}

			editor.update(() => {
				const imageNode = $createImageNode({ src, altText: emoji, dataEmoji: 'emojiCode' });

				if (!nodeToReplace) {
					$insertNodes([imageNode]);
					return;
				}

				if (startIndex > -1) {
					const [beforeNode, emojiNode, afterNode] = nodeToReplace.splitText(startIndex, endIndex);

					if (emojiNode) emojiNode.replace(imageNode);
					else if (beforeNode) beforeNode.replace(imageNode);

					// Set selection after the image
					if (afterNode) {
						afterNode.select(0, 0);
					} else {
						imageNode.selectNext();
					}
				} else {
					$insertNodes([imageNode]);
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
				replaceEmojiStrWithImage(emoji, match);
				chat?.emojiPicker?.close();
			});
		});

		return () => {
			removeTextContentListener();
		};
	}, []);

	useEffect(() => {
		const removeListener = editor.registerCommand<string>(
			INSERT_EMOJI_IMAGE_COMMAND,
			(emoji: string) => {
				const emojiCode = findEmojiCode(emoji);
				const shortcode = ':' + emoji + ':';
				const packageName = emojiPackage.list[shortcode].emojiPackage;
				let src = '';

				if (packageName === 'emojione') {
					src = `/emojione-assets/png/32/${emojiCode}.png`;
				} else if (packageName === 'emojiCustom') {
					const dataCheck = emojiPackage.list[shortcode];
					src = getEmojiUrlFromName(shortcode.replace(/:/g, ''), dataCheck.extension!, dataCheck.etag) || '';
				}

				editor.update(() => {
					const imageNode = $createImageNode({ src, altText: emoji || 'emoji', dataEmoji: shortcode });
					$insertNodes([imageNode]);
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
