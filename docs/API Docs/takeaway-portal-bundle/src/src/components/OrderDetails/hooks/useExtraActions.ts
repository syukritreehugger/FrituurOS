import { useEffect, useState } from 'react';
import { useOverflowElement } from '@lo/web/hooks/useOverflowElement';
import OrderModel from '@lo/shared/models/OrderModel';

export type ExtraActionsParams = {
    visible: boolean;
    opened: boolean;
    toggle: () => void;
    isUnavailableItemsPopupOpened: boolean;
    toggleUnavailableItemsPopup: () => void;
    isOrderListSettingsPopupOpened: boolean;
    toggleOrderListSettingsPopup: () => void;
    toggleUpdateConfirmedTimes: () => void;
    isUpdatingConfirmedTimes: boolean;
};

const useExtraActions = (order?: OrderModel | null, isOrderHistory = false): ExtraActionsParams => {
    const [areExtraActionsOpened, setAreExtraActionsOpened] = useState(false);
    const [isUnavailableItemsPopupOpened, toggleUnavailableItemsPopup] = useOverflowElement();
    const [isOrderListSettingsPopupOpened, toggleOrderListSettingsPopup] = useOverflowElement();
    const [isUpdatingConfirmedTimes, setUpdatingConfirmedTimes] = useState(false);

    const toggleExtraActions = () => setAreExtraActionsOpened(!areExtraActionsOpened);
    const toggleUpdateConfirmedTimes = () => setUpdatingConfirmedTimes(!isUpdatingConfirmedTimes);
    const showExtraActionsButton = !!order && !order.is_cancelled && !order.is_delivered && !isOrderHistory;

    useEffect(() => {
        return () => {
            setAreExtraActionsOpened(false);
            toggleUnavailableItemsPopup(false);
            toggleOrderListSettingsPopup(false);
            setUpdatingConfirmedTimes(false);
        };
    }, [order?.id]);

    useEffect(() => {
        return () => {
            setUpdatingConfirmedTimes(false);
        };
    }, [order?.status]);

    return {
        visible: showExtraActionsButton,
        opened: areExtraActionsOpened,
        toggle: toggleExtraActions,
        isOrderListSettingsPopupOpened,
        toggleOrderListSettingsPopup,
        isUnavailableItemsPopupOpened,
        toggleUnavailableItemsPopup,
        toggleUpdateConfirmedTimes,
        isUpdatingConfirmedTimes
    };
};

export default useExtraActions;
