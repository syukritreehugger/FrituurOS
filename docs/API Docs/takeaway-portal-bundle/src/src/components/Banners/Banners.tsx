import React from 'react';
import classes from './Banners.module.scss';
import { Banner } from '@jet-pie/react';
import { useBanners } from '@lo/shared/store/banners';
import RestaurantStatusBanner from './RestaurantStatusBanner/RestaurantStatusBanner';
import { useTranslation } from 'react-i18next';

const Banners: React.FC = () => {
    const banners = useBanners();
    const { t } = useTranslation();

    return (
        <>
            <RestaurantStatusBanner />
            {banners.map((key) => {
                switch (key) {
                    case 'no-internet-connection':
                        return (
                            <Banner
                                key={key}
                                title={t('orders.live_orders_messages.main.connection_issue')}
                                data-testid="no-internet-connection-banner"
                                variant="error"
                            >
                                <p className={classes.message}>{t('orders.live_orders_messages.main.no_internet_connection')}</p>
                            </Banner>
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
};

export default Banners;
