import { DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, NodeKey } from 'lexical';
import ImageComponent from './components/ImageComponent';

export const $createImageNode = ({
	src,
	altText,
	maxWidth = 400,
	height,
	width,
}: {
	src: string;
	altText: string;
	maxWidth?: number;
	height?: number;
	width?: number;
}) => {
	return new ImageNode({ src, altText, maxWidth, height, width });
};

const convertImageElement = (domNode: Node): DOMConversionOutput | null => {
	if (domNode instanceof HTMLImageElement) {
		const { src, alt } = domNode;
		const node = $createImageNode({ src, altText: alt });
		return { node };
	}

	return null;
};

export const $isImageNode = (node: unknown): Boolean => {
	return node instanceof ImageNode;
};

class ImageNode extends DecoratorNode<JSX.Element> {
	private src: string;
	private altText: string;
	private height?: 'inherit' | number = 'inherit';
	private width?: 'inherit' | number = 'inherit';
	private maxWidth?: 'inherit' | number = 'inherit';

	static getType(): string {
		return 'image';
	}

	static clone(_node: ImageNode): ImageNode {
		return new ImageNode({
			altText: _node.altText,
			height: _node.height,
			key: _node.getKey(),
			maxWidth: _node.maxWidth,
			src: _node.src,
			width: _node.width,
		});
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: (_node: Node) => {
				return { conversion: convertImageElement, priority: 0 };
			},
		};
	}

	getSrc(): string {
		return this.src;
	}

	getAltText(): string {
		return this.altText;
	}

	constructor({
		src,
		altText,
		maxWidth,
		height = 14,
		width = 14,
		key,
	}: {
		src: string;
		altText: string;
		maxWidth?: 'inherit' | number;
		height?: 'inherit' | number;
		width?: 'inherit' | number;
		key?: NodeKey;
	}) {
		super(key);

		this.src = src;
		this.altText = altText;
		this.height = height;
		this.width = width;
		this.maxWidth = maxWidth;
	}

	decorate(): JSX.Element {
		return ImageComponent({
			src: this.src,
			altText: this.altText,
			width: this.width,
			height: this.height,
		});
	}

	createDOM(): HTMLElement {
		const el = document.createElement('span');
		return el;
	}

	updateDOM(): false {
		return false;
	}

	exportDOM(): DOMExportOutput {
		const el = document.createElement('img');
		el.setAttribute('src', this.src);
		el.setAttribute('alt', this.altText);
		el.style.width = this.width ? this.width.toString() : 'inherit';
		el.style.height = this.height ? this.height.toString() : 'inherit';
		el.style.maxWidth = this.maxWidth ? this.maxWidth.toString() : 'inherit';

		return { element: el };
	}
}

export { ImageNode };
