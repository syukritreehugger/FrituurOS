import React from 'react';
import Filters from './Filters/Filters';
import classes from './Toolbar.module.scss';
import { useTranslation } from 'react-i18next';
import Search from './Search/Search';
import { format } from 'date-fns-tz';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import ToolbarSkeleton from './ToolbarSkeleton/ToolbarSkeleton';

type ToolbarProps = {
    updatedAt?: string;
    showSkeletonLoaders: boolean;
};

const Toolbar: React.FC<ToolbarProps> = (props) => {
    const { updatedAt, showSkeletonLoaders } = props;
    const restaurant = useRestaurant();
    const { isLessThanDesktopWidth } = useWindowSize();
    const { t } = useTranslation();

    return (
        <div className={classes.toolbarWrapper}>
            <div className={classes.toolbar}>
                <div className={classes.titleContainer}>
                    <p className={classes.title}>{t('orders.live_orders_menu.main.title')}</p>
                    <p className={classes.subtitle}>{t('orders.live_orders_menu.main.subtitle')}</p>
                </div>
                <div className={classes.filtersContainer}>
                    <Search />
                    {showSkeletonLoaders ? <ToolbarSkeleton /> : <Filters />}
                    {!isLessThanDesktopWidth && updatedAt && (
                        <p className={classes.updatedAt}>{`${t('orders.live_orders_menu.main.updated')} ${format(
                            new Date(updatedAt),
                            'h:mmaaa, d MMM yyyy',
                            {
                                timeZone: restaurant?.timezone
                            }
                        )}`}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
