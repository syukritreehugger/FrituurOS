import {
    PinAction,
    usePinIsLoading,
    usePinPopupIsClosing,
    usePinPopupIsOpen,
    usePinStore,
    usePinStoreActions
} from '../store/pin';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as pinService from '../services/pin';

const usePinPopupData = () => {
    const isOpen = usePinPopupIsOpen();
    const isClosing = usePinPopupIsClosing();
    const isLoading = usePinIsLoading();
    const failed = usePinStore((state) => state.failed);
    const onDismiss = usePinStore((state) => state.onDismiss);
    const currentPinAction = usePinStore((state) => state.currentAction);
    const storeActions = usePinStoreActions();
    const { t } = useTranslation();

    const [currentPinCode, setCurrentPinCode] = useState('');
    const [newPinCode, setNewPinCode] = useState('');
    const [repeatNewPinCode, setRepeatNewPinCode] = useState('');

    const [isWritingCurrentPinCode, setIsWritingCurrentPinCode] = useState(false);
    const [isWritingNewPinCode, setIsWritingNewPinCode] = useState(false);
    const [isWritingRepeatNewPinCode, setIsWritingRepeatNewPinCode] = useState(false);

    const [rememberPin, setRememberPin] = useState(false);

    const [showWrongMatchMessage, setShowWrongMatchMessage] = useState(false);

    useEffect(() => {
        if (currentPinAction === PinAction.ENABLE) {
            setIsWritingNewPinCode(true);
        } else {
            setIsWritingCurrentPinCode(true);
        }
    }, [currentPinAction]);

    useEffect(() => {
        if (currentPinCode.length === 4) {
            onCurrentPinCodeEntered();
        }
    }, [currentPinCode]);

    useEffect(() => {
        if (newPinCode.length === 4) {
            onNewPinCodeEntered();
        }
    }, [newPinCode]);

    useEffect(() => {
        if (repeatNewPinCode.length === 4) {
            onRepeatNewPinCodeEntered();
        }
    }, [repeatNewPinCode]);

    useEffect(() => {
        if (failed) {
            onRequestFailed();
        }
    }, [failed]);

    useEffect(() => {
        if (!isOpen) {
            onPopupClose();
        }
    }, [isOpen]);

    const handleBackspacePress = () => {
        if (isWritingCurrentPinCode) {
            setCurrentPinCode((v) => v.slice(0, -1));
        }

        if (isWritingNewPinCode) {
            setNewPinCode((v) => v.slice(0, -1));
        }

        if (isWritingRepeatNewPinCode) {
            setRepeatNewPinCode((v) => v.slice(0, -1));
        }
    };

    const handleDigitPress = (digit: string) => {
        if (isWritingCurrentPinCode) {
            setCurrentPinCode((v) => v + digit);
        }

        if (isWritingNewPinCode) {
            setNewPinCode((v) => v + digit);
        }

        if (isWritingRepeatNewPinCode) {
            setRepeatNewPinCode((v) => v + digit);
        }
    };

    const onCurrentPinCodeEntered = () => {
        switch (currentPinAction) {
            case PinAction.CHECK:
                pinService.checkPinCode(currentPinCode, rememberPin);
                return;
            case PinAction.DISABLE:
                pinService.disable(currentPinCode);
                return;
        }

        setTimeout(() => {
            setIsWritingCurrentPinCode(false);
            setIsWritingNewPinCode(true);
        }, 300);
    };

    const onNewPinCodeEntered = () => {
        setTimeout(() => {
            setIsWritingNewPinCode(false);
            setIsWritingRepeatNewPinCode(true);
        }, 300);
    };

    const onRepeatNewPinCodeEntered = () => {
        setIsWritingRepeatNewPinCode(false);

        if (newPinCode !== repeatNewPinCode) {
            setShowWrongMatchMessage(true);
            setIsWritingNewPinCode(true);
            setNewPinCode('');
            setRepeatNewPinCode('');
            return;
        }

        switch (currentPinAction) {
            case PinAction.ENABLE:
                pinService.enable(newPinCode);
                return;
            case PinAction.UPDATE:
                pinService.updatePinCode(currentPinCode, newPinCode);
                return;
        }
    };

    const onRequestFailed = () => {
        setCurrentPinCode('');
        setNewPinCode('');
        setRepeatNewPinCode('');
        setIsWritingCurrentPinCode(false);
        setIsWritingNewPinCode(false);
        setIsWritingRepeatNewPinCode(false);
        setShowWrongMatchMessage(false);

        if (currentPinAction === PinAction.ENABLE) {
            setIsWritingNewPinCode(true);
        } else {
            setIsWritingCurrentPinCode(true);
        }
    };

    const onPopupClose = () => {
        setCurrentPinCode('');
        setNewPinCode('');
        setRepeatNewPinCode('');
        setIsWritingCurrentPinCode(false);
        setIsWritingNewPinCode(false);
        setIsWritingRepeatNewPinCode(false);
        setShowWrongMatchMessage(false);
    };

    const handlePopupClose = () => {
        onDismiss?.();
        storeActions.closingPopupStarted();
    };

    const getDigitIsFilled = (index: number) => {
        if (isWritingRepeatNewPinCode) {
            return repeatNewPinCode[index] !== undefined;
        }

        if (isWritingNewPinCode) {
            return newPinCode[index] !== undefined;
        }

        return currentPinCode[index] !== undefined;
    };

    const getTitleMessage = () => {
        if (currentPinAction === PinAction.ENABLE || currentPinAction === PinAction.UPDATE) {
            return t('orders.live_orders_pin.main.set');
        }

        return t('orders.live_orders_pin.main.enter');
    };

    const getExplanationMessage = () => {
        if (isWritingCurrentPinCode) {
            return t('orders.live_orders_pin.main.please_enter_pin');
        }

        if (isWritingNewPinCode) {
            return t('orders.live_orders_pin.main.please_enter_new_pin');
        }

        if (isWritingRepeatNewPinCode) {
            return t('orders.live_orders_pin.main.please_repeat_pin');
        }

        return '';
    };

    return {
        isOpen,
        isClosing,
        title: getTitleMessage(),
        explanation: getExplanationMessage(),
        isWritingCurrentPinCode,
        isWritingNewPinCode,
        isWritingRepeatNewPinCode,
        getDigitIsFilled,
        showWrongMatchMessage,
        failed,
        isLoading,
        askToRemember: currentPinAction === PinAction.CHECK,
        rememberPin,
        setRememberPin,
        handleBackspacePress,
        handleDigitPress,
        handlePopupClose
    };
};

export default usePinPopupData;
