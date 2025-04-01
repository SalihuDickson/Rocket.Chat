import data, { EmojiMartData, Category, Emoji } from '@emoji-mart/data';
import { TranslationKey } from '@rocket.chat/ui-contexts';

export interface RocketChatEmojiCategory extends Category {
	i18n: TranslationKey;
	emojisInCategory: Emoji[];
}

export interface RocketChatEmojiData extends EmojiMartData {
	categories: RocketChatEmojiCategory[];
}

const emojiData = data as RocketChatEmojiData;

export const getCategories = () => {
	let categories: RocketChatEmojiCategory[] = [
		{
			id: 'recent',
			i18n: 'Frequently_Used',
			emojis: [],
			emojisInCategory: [],
		},
		...emojiData.categories,
		{
			id: 'rocket',
			i18n: 'Custom',
			emojis: [],
			emojisInCategory: [],
		},
	];

	categories = categories.map((cat) => {
		switch (cat.id) {
			case 'people':
				cat.i18n = 'Smileys_and_People';
				return cat;

			case 'nature':
				cat.i18n = 'Animals_and_Nature';
				return cat;

			case 'foods':
				cat.i18n = 'Food_and_Drink';
				return cat;

			case 'activity':
				cat.i18n = 'Activity';
				return cat;

			case 'places':
				cat.i18n = 'Travel_and_Places';
				return cat;

			case 'objects':
				cat.i18n = 'Objects';
				return cat;

			case 'symbols':
				cat.i18n = 'Symbols';
				return cat;

			case 'flags':
				cat.i18n = 'Flags';
				return cat;

			default:
				cat.i18n = 'Custom';
				return cat;
		}
	});

	return categories;
};

export const getEmojis = () => {
	let categories = getCategories();

	categories = categories.map((cat) => {
		if (!cat.emojisInCategory) {
			cat.emojisInCategory = [];
		}

		cat.emojis.forEach((em) => {
			cat.emojisInCategory = [...cat.emojisInCategory, emojiData.emojis[em]];
		});

		return cat;
	});
	return categories;
};
