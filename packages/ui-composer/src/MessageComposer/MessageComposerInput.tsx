import { css } from '@rocket.chat/css-in-js';
import { Box, Palette } from '@rocket.chat/fuselage';
import type { ComponentProps } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMergedRefs } from '@rocket.chat/fuselage-hooks';

const messageComposerInputStyle = css`
	resize: none;

	&::placeholder {
		color: ${Palette.text['font-annotation']};
	}
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MessageComposerInputProps extends ComponentProps<typeof Box> {}

const MessageComposerInput = forwardRef<HTMLElement, MessageComposerInputProps>(function MessageComposerInput(props, ref) {
	const [editor] = useLexicalComposerContext();
	const contentRef = useRef<HTMLElement>(null);
	const mergedRef = useMergedRefs(ref, contentRef);

	useEffect(() => {
		editor.setRootElement(contentRef.current);
	}, [editor, contentRef]);

	return (
		<Box is='label' width='full' fontSize={0}>
			<Box
				className={[messageComposerInputStyle, 'rc-message-box__textarea js-input-message']}
				color='default'
				width='full'
				minHeight='20px'
				maxHeight='155px'
				rows={1}
				fontScale='p2'
				ref={mergedRef}
				pi={12}
				mb={16}
				borderWidth={0}
				is='div'
				contentEditable
				suppressContentEditableWarning
				{...props}
			/>
		</Box>
	);
});

export default MessageComposerInput;
