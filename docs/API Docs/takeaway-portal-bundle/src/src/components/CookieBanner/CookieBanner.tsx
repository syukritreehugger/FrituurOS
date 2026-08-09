import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import { CookiePolicy } from '@jet-pie/react/esm/icons';
import { useAcceptedCookies, useCookiesActions } from '@lo/shared/store/cookies';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './CookieBanner.module.scss';

const CookieBanner: React.FC = () => {
    const accepted = useAcceptedCookies();
    const { accept } = useCookiesActions();
    const { isLessThanTabletWidth } = useWindowSize();
    const { t, ready } = useTranslation();

    return (
        accepted === null &&
        ready && (
            <div className={classes.banner}>
                <div className={classes.header}>
                    <CookiePolicy />
                    {t('orders.live_orders_terms.cookie_banner.cookies')}
                </div>

                <div
                    className={classes.message}
                    dangerouslySetInnerHTML={{
                        __html: t('orders.live_orders_terms.cookie_banner.message', {
                            statementLink: `<a href="/cookie-statement" target="__blank">${t(
                                'orders.live_orders_terms.cookie_banner.statement'
                            )}</a>`
                        }) as string
                    }}
                    data-testid="cookie-banner-message"
                />

                <div className={classes.actions}>
                    <Button
                        onClick={() => accept('necessary')}
                        variant="primary"
                        size={isLessThanTabletWidth ? 'xSmall' : 'small-expressive'}
                        data-testid="cookie-banner-necessary-button"
                        className={classes.button}
                    >
                        {t('orders.live_orders_terms.cookie_banner.necessary_only')}
                    </Button>
                    <Button
                        onClick={() => accept('all')}
                        variant="primary"
                        size={isLessThanTabletWidth ? 'xSmall' : 'small-expressive'}
                        data-testid="cookie-banner-accept-button"
                        className={classes.button}
                    >
                        {t('orders.live_orders_terms.cookie_banner.accept')}
                    </Button>
                </div>
            </div>
        )
    );
};

export default CookieBanner;
