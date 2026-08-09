import { Location } from 'react-router';
import i18n from '@lo/shared/localization/i18n';
import { AVAILABLE_LANGUAGES } from '@lo/shared/constants';

export const handleOrderRequest = (location: Location): void => {
    const publicReference = location.hash.replace('#', '');
    if (publicReference) {
        localStorage.setItem('orderFromRequest', publicReference);
    }
};

export const handleLanguageParameter = (location: Location): string | null => {
    const locale = new URLSearchParams(location.search).get('kc_locale');
    if (!locale || !AVAILABLE_LANGUAGES[locale]) {
        return null;
    }
    i18n.changeLanguage(locale);

    return locale;
};
