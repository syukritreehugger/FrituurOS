import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import classes from './AlcoholInfoContent.module.scss';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';

const AlcoholInfoContent: FC = () => {
    const [showFullMessage, setShowFullMessage] = useState(false);
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();

    const message = t('orders.live_orders_notifications.alcohol.full_message', {
        beginStrong: '<b>',
        endStrong: '</b>'
    });

    return (
        <div className={classes.container} data-testid="alcohol-info-content">
            <p dangerouslySetInnerHTML={{ __html: message }} />

            {showFullMessage && (
                <div className={classes.fullTextContainer}>
                    <p>{t('orders.live_orders_notifications.alcohol.more_title')}</p>
                    <ul>
                        <li>{t('orders.live_orders_notifications.alcohol.more_list_item_0')}</li>
                        <li>{t('orders.live_orders_notifications.alcohol.more_list_item_1')}</li>
                        <li>{t('orders.live_orders_notifications.alcohol.more_list_item_2')}</li>
                        <li>{t('orders.live_orders_notifications.alcohol.more_list_item_3')}</li>
                    </ul>
                    <p>{t('orders.live_orders_notifications.alcohol.more_footer_text')}</p>
                </div>
            )}

            <div className={classes.action}>
                <Button
                    variant="outline"
                    size="xSmall"
                    fullWidth={isLessThanTabletWidth}
                    onClick={() => setShowFullMessage((prev) => !prev)}
                >
                    {showFullMessage
                        ? t('orders.live_orders_notifications.alcohol.confirm')
                        : t('orders.live_orders_notifications.alcohol.action')}
                </Button>
            </div>
        </div>
    );
};

export default AlcoholInfoContent;
