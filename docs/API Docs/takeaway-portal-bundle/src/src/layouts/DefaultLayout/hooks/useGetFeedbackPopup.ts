import { useEffect } from 'react';
import config from '@lo/shared/services/config';

export default () => {
    useEffect(() => {
        if (config.env !== 'ci' && window && window.usabilla_live) {
            const lang = localStorage.getItem('lang') || 'en';
            window.usabilla_live('trigger', `live_orders_${lang}`);
        }
    }, []);
};
