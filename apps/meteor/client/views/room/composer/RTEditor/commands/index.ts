import { Emoji, Skin } from '@emoji-mart/data';
import { createCommand, LexicalCommand } from 'lexical';

export const INSERT_EMOJI_COMMAND: LexicalCommand<Emoji & Skin> = createCommand('INSERT_EMOJI_COMMAND');
