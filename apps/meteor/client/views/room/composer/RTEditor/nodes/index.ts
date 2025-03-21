import type { Klass, LexicalNode } from 'lexical';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

import { ImageNode } from './ImageNode';

const nodes: Array<Klass<LexicalNode>> = [
	HorizontalRuleNode,
	CodeNode,
	HashtagNode,
	AutoLinkNode,
	LinkNode,
	CodeHighlightNode,
	ListItemNode,
	ListNode,
	MarkNode,
	OverflowNode,
	TableCellNode,
	TableNode,
	TableRowNode,
	HeadingNode,
	QuoteNode,
	ImageNode,
];

export default nodes;
