type ImageComponentProps = {
	src: string;
	altText: string;
	width?: number | 'inherit';
	height?: number | 'inherit';
	maxWidth?: number | 'inherit';
};

const ImageComponent = ({ src, altText, width, height, maxWidth }: ImageComponentProps) => {
	return (
		<img
			src={src}
			alt={altText}
			style={{
				width: width,
				height: height,
				maxWidth: maxWidth,
			}}
		/>
	);
};

export default ImageComponent;
