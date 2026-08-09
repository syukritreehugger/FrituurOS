import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import translations from './translations.json';
import config from '../services/config';

const lang = localStorage.getItem('lang');

i18n.use(Backend)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: false,
        lng: lang ? lang : 'en',
        ns: ['translations'],
        defaultNS: 'translations',
        keySeparator: '.',
        interpolation: {
            escapeValue: false,
            formatSeparator: ','
        },
        backend: {
            loadPath: config.apiUrl + '/translations/{{lng}}',
            requestOptions: {
                mode: 'cors',
                cache: 'default'
            }
        }
    });

i18n.on('languageChanged', (newLang) => {
    localStorage.setItem('lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
});

i18n.on('failedLoading', function () {
    i18n.addResourceBundle('en', 'translations', translations);
});

export default i18n;
