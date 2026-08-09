import React, { MouseEventHandler } from 'react';
import classNames from 'classnames';
import { useRestaurantStatus } from '@lo/shared/hooks/useRestaurantStatus';
import { RestaurantModel } from '@lo/shared/models';
import classes from './RestaurantLogo.module.scss';

type RestaurantLogoProps = {
    restaurant: RestaurantModel;
    onClick?: () => void;
    dataTestId?: string;
};

const RestaurantLogo: React.FC<RestaurantLogoProps> = ({ onClick, dataTestId, restaurant }) => {
    const { isClosed } = useRestaurantStatus();
    const isRestaurantOpen = !!(!isClosed || restaurant.restaurant_settings.is_emergency_closed);

    const handleClick: MouseEventHandler = (e) => {
        e.preventDefault();
        onClick && onClick();
    };

    return (
        <a className={classes.restaurantLogoContainer} onClick={handleClick} data-testid={dataTestId}>
            {restaurant.logo && (
                <img
                    data-testid="restaurant-logo-image"
                    className={classes.restaurantLogo}
                    src={restaurant.logo}
                    title={restaurant.name}
                />
            )}

            <span
                className={classNames(classes.restaurantIndicator, isRestaurantOpen ? classes.opened : classes.closed)}
                data-testid={isRestaurantOpen ? 'restaurant-indicator-open' : 'restaurant-indicator-closed'}
            />
        </a>
    );
};

export default RestaurantLogo;
