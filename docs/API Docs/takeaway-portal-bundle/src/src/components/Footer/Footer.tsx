import React from 'react';
import classes from './Footer.module.scss';
import LogoLong from '../../static/images/jet-logo-long.svg';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { RestaurantModel } from '@lo/shared/models';

type FooterProps = {
    restaurant: RestaurantModel;
};

const Footer: React.FC<FooterProps> = ({ restaurant }) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();

    const language = localStorage.getItem('lang') || 'en';
    const iOSAppUrl = 'https://apps.apple.com/app/live-orders/id1562296823';
    const androidAppUrl = 'https://play.google.com/store/apps/details?id=com.justeattakeaway.liveorders';

    return (
        <div data-testid="footer" className={classes.container}>
            <Link to="/">
                <img data-testid="footer-logotype" className={classes.img} src={LogoLong} alt="logotype" />
            </Link>

            <div className={classes.linksBlock}>
                <>
                    <a
                        className={classes.link}
                        href={`mailto:${restaurant.country_contact_information.email}`}
                        data-testid="footer-email-link"
                    >
                        {t('orders.live_orders_navigation.footer.email')}
                    </a>
                    <a
                        className={classes.link}
                        href={`tel:${restaurant.country_contact_information.phone}`}
                        data-testid="footer-phone-link"
                    >
                        {t('orders.live_orders_navigation.footer.phone')}
                    </a>
                    {!isLessThanTabletWidth && (
                        <a
                            className={classes.link}
                            href={`tel:${restaurant.country_contact_information.fax}`}
                            data-testid="footer-fax-link"
                        >
                            {t('orders.live_orders_navigation.footer.fax')}
                        </a>
                    )}
                </>

                <Link data-testid="footer-cookie-statement" className={classes.link} to="cookie-statement">
                    {t('orders.live_orders_terms.cookie_statement.intro_title')}
                </Link>
            </div>

            <div className={classes.storeButtons}>
                <a
                    href={iOSAppUrl}
                    className={`${classes.appStoreButton} ${classes[language]}`}
                    target="_blank"
                    rel="noreferrer"
                />
                <a
                    href={androidAppUrl}
                    className={`${classes.playStoreButton} ${classes[language]}`}
                    target="_blank"
                    rel="noreferrer"
                />
            </div>

            <span data-testid="footer-copyright" className={classes.textCopyright}>
                © {new Date().getFullYear()} Just Eat Takeaway.com
            </span>
        </div>
    );
};

export default Footer;
