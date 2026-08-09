import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import classes from './ChainRestaurantSelector.module.scss';
import useChainRestaurants from '@lo/shared/hooks/useChainRestaurants';

type ChainRestaurantSelectorProps = {
    isOpen: boolean;
    onChange: (id: number) => void;
    close: () => void;
};

export const ChainRestaurantSelector: React.FC<ChainRestaurantSelectorProps> = ({ isOpen, onChange, close }) => {
    const { t } = useTranslation();
    const selectedRestaurantId = useRestaurant().id;
    const { data: restaurants } = useChainRestaurants();

    return (
        <div className={classNames(classes.container, { [classes.isOpen]: isOpen })}>
            <div className={classes.header}>
                <button className={classes.backButton} onClick={close} />
                <span className={classes.title}>{t('orders.live_orders_navigation.chains.select_restaurant')}</span>
            </div>

            <div className={classes.restaurantList}>
                {restaurants?.map((restaurant) => (
                    <button
                        key={restaurant.id}
                        className={classNames(classes.restaurantItem, {
                            [classes.selected]: restaurant.id == selectedRestaurantId
                        })}
                        onClick={() => onChange(restaurant.id)}
                        data-testid={`chain-restaurant-${restaurant.id}`}
                    >
                        {`${restaurant.name} | ${restaurant.city}, ${restaurant.street}`}
                    </button>
                ))}
            </div>
        </div>
    );
};
