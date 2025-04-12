import type { JSX } from 'react';

import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from './Transformers';

export default function MarkdownPlugin(): JSX.Element {
	return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
}
