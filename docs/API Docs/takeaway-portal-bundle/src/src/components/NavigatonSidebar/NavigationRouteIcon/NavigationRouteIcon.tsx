import React from 'react';
import { Calendar, House, RestaurantMenu, Settings } from '@jet-pie/react/esm/icons';
import { colors } from '../../../common/js/colorTokens';

type NavigationRouteIconProps = {
    navRouteIcon: string;
    isActive: boolean;
};

const NavigationRouteIcon: React.FC<NavigationRouteIconProps> = ({ navRouteIcon, isActive }) => {
    const getIcon = () => {
        switch (navRouteIcon) {
            case 'House':
                return House;
            case 'RestaurantMenu':
                return RestaurantMenu;
            case 'Calendar':
                return Calendar;
            case 'Settings':
                return Settings;
            default:
                return House;
        }
    };

    const Icon = getIcon();

    return (
        <Icon
            width={28}
            height={28}
            fill={isActive ? colors.alias.contentInteractiveBrand : colors.alias.contentInteractiveSecondary}
        />
    );
};

export default NavigationRouteIcon;
