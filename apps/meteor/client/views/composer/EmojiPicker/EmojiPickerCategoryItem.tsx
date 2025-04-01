import { IconButton } from '@rocket.chat/fuselage';
import { TranslationKey } from '@rocket.chat/ui-contexts';
import type { AllHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

type EmojiPickerCategoryItemProps = {
	category: { id: string; i18n: TranslationKey };
	index: number;
	active: boolean;
	handleGoToCategory: (categoryIndex: number) => void;
} & Omit<AllHTMLAttributes<HTMLButtonElement>, 'is'>;

const mapCategoryIcon = (category: string) => {
	switch (category) {
		case 'people':
			return 'emoji';

		case 'nature':
			return 'leaf';

		case 'foods':
			return 'burger';

		case 'activity':
			return 'ball';

		case 'travel':
			return 'airplane';

		case 'objects':
			return 'lamp-bulb';

		case 'symbols':
			return 'percentage';

		case 'flags':
			return 'flag';

		case 'rocket':
			return 'rocket';

		default:
			return 'clock';
	}
};

const EmojiPickerCategoryItem = ({ category, index, active, handleGoToCategory, ...props }: EmojiPickerCategoryItemProps) => {
	const { t } = useTranslation();

	const icon = mapCategoryIcon(category.id);

	return (
		<IconButton
			role='tab'
			pressed={active}
			title={t(category.i18n)}
			className={category.id}
			small
			aria-label={t(category.i18n)}
			onClick={() => handleGoToCategory(index)}
			icon={icon}
			{...props}
		/>
	);
};

export default EmojiPickerCategoryItem;
