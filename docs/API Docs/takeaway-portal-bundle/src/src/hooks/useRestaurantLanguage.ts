import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '@lo/shared/constants';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

const useRestaurantLanguage = (): void => {
    const restaurant = useRestaurant();
    const { i18n } = useTranslation();

    const restaurantLanguage = restaurant.language || 'en';

    useEffect(() => {
        if (!AVAILABLE_LANGUAGES.hasOwnProperty(restaurantLanguage)) return;

        localStorage.setItem('orig_lang', restaurantLanguage);

        const lang = localStorage.getItem('lang');
        i18n.changeLanguage(lang || restaurantLanguage);
    }, [restaurantLanguage, i18n]);
};

export default useRestaurantLanguage;
