import type { CSSProperties } from 'react';
import { forwardRef, useEffect, RefObject } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import Nodes from './nodes';
import { MessageComposerInput } from '@rocket.chat/ui-composer';

import { useTranslation } from '@rocket.chat/ui-contexts';
import { useRoom } from '../../contexts/RoomContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useComposerPopupOptions } from '../../contexts/ComposerPopupContext';
import { useMessageBoxPlaceholder } from '../messageBox/hooks/useMessageBoxPlaceholder';
import { useComposerBoxPopup } from '../hooks/useComposerBoxPopup';
import { LexicalEditor } from 'lexical';
import { $convertToMarkdownString } from '@lexical/markdown';
import { TRANSFORMERS } from './plugins/MarkdownShortcutPlugin/Transformers';

const theme = {};

function onError(error: any) {
	console.error(error);
}

type Props = {
	disabled?: boolean;
	onChange?: (value: string) => void;
	style?: CSSProperties;
	onPaste?: (event: any) => void;
	messageRef: RefObject<HTMLElement>;
	setEditor: (editor: LexicalEditor) => void;
};

const EditorContainer = forwardRef<HTMLElement, Props>((props: Props, ref) => {
	const initialConfig = {
		namespace: 'MyEditor',
		nodes: [...Nodes],
		theme,
		onError,
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<Editor {...props} ref={ref} />
		</LexicalComposer>
	);
});

const Editor = forwardRef<HTMLElement, Props>(({ disabled, onChange, style, onPaste, messageRef, setEditor }: Props, ref) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		setEditor(editor);
		const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const textContent = $convertToMarkdownString(TRANSFORMERS);
				onChange?.(textContent);
			});
		});

		return () => {
			removeUpdateListener();
		};
	}, []);

	const t = useTranslation();
	const room = useRoom();
	const composerPlaceholder = useMessageBoxPlaceholder(t('Message'), room);
	const popupOptions = useComposerPopupOptions();
	const popup = useComposerBoxPopup(popupOptions);

	return (
		<>
			<RichTextPlugin
				contentEditable={
					<MessageComposerInput
						ref={ref}
						aria-label={composerPlaceholder}
						name='msg'
						disabled={disabled}
						placeholder={composerPlaceholder}
						onPaste={onPaste}
						aria-activedescendant={popup.focused ? `popup-item-${popup.focused._id}` : undefined}
					/>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HistoryPlugin />
			<AutoFocusPlugin />
			<EmojiPickerPlugin messageRef={messageRef} />
			<MarkdownShortcutPlugin />
		</>
	);
});

export default EditorContainer;
