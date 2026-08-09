import { checkPinApi, disablePinApi, enablePinApi, updatePinApi } from '../../api/pin';
import { usePinStore } from '../../store/pin';
import queryClient from '../query/queryClient';
import { RestaurantData } from '../../types/restaurantDataType';
import analytics from '@lo/shared/services/analytics';

export const enable = async (pinCode: string) => {
    usePinStore.getState().actions.requestStarted();

    const response = await enablePinApi(pinCode);

    if (response.data.success && response.data.token) {
        usePinStore.getState().actions.closingPopupStarted();

        await queryClient.invalidateQueries({ queryKey: ['restaurant'] });

        queryClient.setQueryData<RestaurantData>(['restaurant'], (restaurant) => {
            return (
                restaurant && {
                    ...restaurant,
                    restaurant_settings: { ...restaurant.restaurant_settings, pin_code_enabled: true }
                }
            );
        });

        analytics.settings.toggled('pin', 'pin', true);
    } else {
        usePinStore.getState().actions.requestFailed();
    }
};

export const disable = async (pinCode: string) => {
    usePinStore.getState().actions.requestStarted();

    const response = await disablePinApi(pinCode);

    if (response.data.success) {
        await usePinStore.getState().actions.setToken(null);

        usePinStore.getState().actions.closingPopupStarted();

        await queryClient.invalidateQueries({ queryKey: ['restaurant'] });

        queryClient.setQueryData<RestaurantData>(['restaurant'], (restaurant) => {
            return (
                restaurant && {
                    ...restaurant,
                    restaurant_settings: { ...restaurant.restaurant_settings, pin_code_enabled: false }
                }
            );
        });

        analytics.settings.toggled('pin', 'pin', false);
    } else {
        usePinStore.getState().actions.requestFailed();
    }
};

export const updatePinCode = async (oldPinCode: string, newPinCode: string) => {
    usePinStore.getState().actions.requestStarted();

    const response = await updatePinApi(oldPinCode, newPinCode);

    if (response.data.success && response.data.token) {
        usePinStore.getState().actions.setToken(null);
        usePinStore.getState().actions.closingPopupStarted();
    } else {
        usePinStore.getState().actions.requestFailed();
    }
};

export const checkPinCode = async (pinCode: string, dontAskAgain: boolean) => {
    usePinStore.getState().actions.requestStarted();

    const response = await checkPinApi(pinCode, dontAskAgain);

    if (response.data.success && response.data.token) {
        await usePinStore.getState().actions.setToken(response.data.token);
        usePinStore.getState().actions.closingPopupStarted();
    } else {
        usePinStore.getState().actions.requestFailed();
    }
};

export const resetPinCode = async () => {
    await usePinStore.getState().actions.setToken(null);
};
