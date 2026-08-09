import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { PinAction, usePinIsLoading, usePinPopupIsOpen, usePinStoreActions, usePinToken } from '@lo/shared/store/pin';
import { useAuthStore } from '../store/auth';

const usePinProtection = (onDismiss?: () => void) => {
    const restaurant = useRestaurant();
    const { openPopup } = usePinStoreActions();
    const token = usePinToken();
    const isLoading = usePinIsLoading();
    const pinPopupIsOpen = usePinPopupIsOpen();
    const { isLoading: isLoginLoading } = useAuthStore();

    const isEnabled = restaurant.restaurant_settings.pin_code_enabled === true;
    const pinIsChecked = !isEnabled || token !== null;

    const checkPin = () => {
        if (!pinIsChecked && !isLoginLoading) {
            openPopup({ action: PinAction.CHECK, onDismiss });
        }
    };

    return { checkPin, isLoading, pinIsChecked, pinPopupIsOpen };
};

export default usePinProtection;
