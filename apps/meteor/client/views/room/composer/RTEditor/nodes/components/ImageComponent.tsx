type ImageComponentProps = {
	src: string;
	altText: string;
	width?: number | 'inherit';
	height?: number | 'inherit';
	maxWidth?: number | 'inherit';
	dataEmoji?: string;
};

const ImageComponent = ({ src, altText, width, height, maxWidth, dataEmoji }: ImageComponentProps) => {
	return (
		<img
			src={src}
			alt={altText}
			data-emoji={dataEmoji}
			style={{
				width: width,
				height: height,
				maxWidth: maxWidth,
			}}
		/>
	);
};

export default ImageComponent;
