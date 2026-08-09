import React, { useEffect } from 'react';
import classes from './TConnect.module.scss';
import TConnectBackground from '../../static/images/tconnect-page-background.png';
import TConnectIllustration from '../../static/images/tconnect-page-illustration.png';
import { Button } from '@jet-pie/react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';

const TConnect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useWindowSize().isLessThanTabletWidth;
    const { t, i18n } = useTranslation();

    const params = new URLSearchParams(location.search);
    const languageParam = params.get('lang');

    useEffect(() => {
        if (languageParam) {
            i18n.changeLanguage(languageParam);
        } else {
            i18n.changeLanguage(localStorage.getItem('lang') || 'en');
        }
    }, []);

    return (
        <div className={classes.page}>
            <div className={classes.wrapper}>
                {!isMobile && <img src={TConnectBackground} />}
                <div className={classes.content}>
                    <img src={TConnectIllustration} />
                    <p className={classes.headerText}>Live Orders</p>
                    <div className={classes.contentText}>
                        <p className={classes.contentHeader}>{t('orders.live_orders_navigation.tconnect.header_text_new')}</p>
                        <p>{t('orders.live_orders_navigation.tconnect.bullet_1_new')}</p>
                        <p>{t('orders.live_orders_navigation.tconnect.bullet_2_new')}</p>
                        <p>{t('orders.live_orders_navigation.tconnect.bullet_3_new')}</p>
                        <p>{t('orders.live_orders_navigation.tconnect.bullet_4_new')}</p>
                        <p>{t('orders.live_orders_navigation.tconnect.bullet_5_new')}</p>
                    </div>
                    <div>
                        <Button onClick={() => navigate('/orders')}>{t('orders.live_orders_terms.main.ok')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TConnect;
