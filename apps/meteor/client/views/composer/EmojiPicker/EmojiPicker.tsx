import { TextInput, Icon, Button, Divider } from '@rocket.chat/fuselage';
import { useMediaQuery, useMergedRefs, useOutsideClick } from '@rocket.chat/fuselage-hooks';
import {
	EmojiPickerCategoryHeader,
	EmojiPickerContainer,
	EmojiPickerFooter,
	EmojiPickerPreviewArea,
	EmojiPickerHeader,
	EmojiPickerListArea,
	EmojiPickerPreview,
} from '@rocket.chat/ui-client';
import { useTranslation, usePermission, useRoute } from '@rocket.chat/ui-contexts';
import type { ChangeEvent, KeyboardEvent, MouseEvent, RefObject, UIEvent } from 'react';
import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import data, { Emoji, Skin } from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import CategoriesResult from './CategoriesResult';
import EmojiPickerCategoryItem from './EmojiPickerCategoryItem';
import EmojiPickerDropdown from './EmojiPickerDropDown';
import SearchingResult from './SearchingResult';
import ToneSelector from './ToneSelector';
import ToneSelectorWrapper from './ToneSelector/ToneSelectorWrapper';
import { emoji, getCategoriesList, getEmojisBySearchTerm } from '../../../../app/emoji/client';
import type { EmojiItem } from '../../../../app/emoji/client';
import { usePreviewEmoji, useEmojiPickerData } from '../../../contexts/EmojiPickerContext';
import { useIsVisible } from '../../room/hooks/useIsVisible';

type EmojiPickerProps = {
	reference: Element;
	onClose: () => void;
	onPickEmoji: (emoji: Emoji & Skin) => void;
};

const custom = [
	{
		id: 'github',
		name: 'GitHub',
		emojis: [
			{
				id: 'octocat',
				name: 'Octocat',
				keywords: ['github'],
				skins: [{ src: 'https://playground.lexical.dev/assets/cat-typing-CCpT868J.gif' }],
			},
			{
				id: 'party_parrot',
				name: 'Party Parrot',
				keywords: ['dance', 'dancing'],
				skins: [{ src: 'https://playground.lexical.dev/assets/cat-typing-CCpT868J.gif' }],
			},
		],
	},
	{
		id: 'gifs',
		name: 'GIFs',
		emojis: [
			{
				id: 'party_parrot',
				name: 'Party Parrot',
				keywords: ['dance', 'dancing'],
				skins: [{ src: 'https://playground.lexical.dev/assets/cat-typing-CCpT868J.gif' }],
			},
		],
	},
];

const EmojiPicker = ({ reference, onClose, onPickEmoji }: EmojiPickerProps) => {
	const t = useTranslation();

	const ref = useRef<Element | null>(reference);
	const virtuosoRef = useRef<VirtuosoHandle>(null);
	const emojiContainerRef = useRef<HTMLDivElement>(null);

	const [isVisibleRef, isInputVisible] = useIsVisible();
	const textInputRef = useRef<HTMLInputElement>();

	const mergedTextInputRef = useMergedRefs(isVisibleRef, textInputRef);

	const emojiCategories = getCategoriesList();

	const canManageEmoji = usePermission('manage-emoji');
	const customEmojiRoute = useRoute('emoji-custom');

	const [searching, setSearching] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<EmojiItem[]>([]);

	const { emojiToPreview, handleRemovePreview } = usePreviewEmoji();
	const {
		recentEmojis,
		setCurrentCategory,
		addRecentEmoji,
		setRecentEmojis,
		actualTone,
		currentCategory,
		categoriesPosition,
		getEmojiListsByCategory,
		customItemsLimit,
		setActualTone,
		setCustomItemsLimit,
	} = useEmojiPickerData();

	useEffect(() => () => handleRemovePreview(), [handleRemovePreview]);

	const scrollCategories = useMediaQuery('(width < 340px)');

	useOutsideClick([emojiContainerRef], onClose);

	useLayoutEffect(() => {
		if (!reference) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			const anchorRect = reference.getBoundingClientRect();
			if (anchorRect.width === 0 && anchorRect.height === 0) {
				// The element is hidden, skip it
				ref.current = null;
				return;
			}

			ref.current = reference;
		});

		resizeObserver.observe(reference);

		return () => {
			resizeObserver.disconnect();
		};
	}, [reference]);

	useEffect(() => {
		if (textInputRef.current && isInputVisible) {
			textInputRef.current.focus();
		}
	}, [isInputVisible]);

	const handleSelectEmoji = (emoji: Emoji & Skin) => {
		console.log('the emoji', emoji);
		if (!emoji) {
			return;
		}

		onPickEmoji(emoji);
		onClose();
	};

	useEffect(() => {
		setCurrentCategory('recent');
	}, [setCurrentCategory]);

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentCategory('');
		setSearching(e.target.value !== '');

		const emojisResult = getEmojisBySearchTerm(e.target.value, actualTone, recentEmojis, setRecentEmojis);

		if (emojisResult.filter((emoji) => emoji.image).length === 0) {
			setCurrentCategory('no-results');
		}
		setSearchResults(emojisResult as EmojiItem[]);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			onClose();
		}
	};

	const handleLoadMore = () => {
		setCustomItemsLimit(customItemsLimit + 90);
	};

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		const categoryMargin = 12;
		const { scrollTop } = event.currentTarget;

		const lastCategory = categoriesPosition.current
			?.filter((category, index = 1) => category.top - categoryMargin * index <= scrollTop)
			.pop();

		if (!lastCategory) {
			return;
		}

		setCurrentCategory(lastCategory.key);
	};

	const handleGoToCategory = (categoryIndex: number) => {
		setSearching(false);
		virtuosoRef.current?.scrollToIndex({ index: categoryIndex });
	};

	const handleGoToAddCustom = () => {
		customEmojiRoute.push();
		onClose();
	};

	return <Picker data={data} onEmojiSelect={handleSelectEmoji} autoFocus={true} custom={custom} />;
};

export default EmojiPicker;
