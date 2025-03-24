import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread } from 'lexical';

import { $applyNodeReplacement, TextNode } from 'lexical';

export type SerializedEmojiNode = Spread<
	{
		className: string;
	},
	SerializedTextNode
>;

export class EmojiNode extends TextNode {
	private className: string;

	static getType(): string {
		return 'emoji';
	}

	static clone(node: EmojiNode): EmojiNode {
		return new EmojiNode(node.className, node.__text, node.__key);
	}

	constructor(className: string, text: string, key?: NodeKey) {
		super(text, key);
		this.className = className;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = document.createElement('span');
		const inner = super.createDOM(config);
		dom.className = this.className;
		inner.className = 'emoji-inner';
		dom.appendChild(inner);
		return dom;
	}

	updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
		const inner = dom.firstChild;
		if (inner === null) {
			return true;
		}
		super.updateDOM(prevNode, inner as HTMLElement, config);
		return false;
	}

	static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
		return $createEmojiNode(serializedNode.className, serializedNode.text).updateFromJSON(serializedNode);
	}

	exportJSON(): SerializedEmojiNode {
		return {
			...super.exportJSON(),
			className: this.getClassName(),
		};
	}

	getClassName(): string {
		const self = this.getLatest();
		return self.className;
	}
}

export function $isEmojiNode(node: LexicalNode | null | undefined): node is EmojiNode {
	return node instanceof EmojiNode;
}

export function $createEmojiNode(className: string, emojiText: string): EmojiNode {
	const node = new EmojiNode(className, emojiText).setMode('token');
	return $applyNodeReplacement(node);
}
