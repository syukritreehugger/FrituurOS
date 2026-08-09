import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { Checkbox, Modal } from '@jet-pie/react';
import usePinPopupData from '@lo/shared/hooks/usePinPopupData';
import { usePinStoreActions } from '@lo/shared/store/pin';
import classes from './PinPopup.module.scss';

const PinPopup: FC = () => {
    const {
        isOpen,
        isClosing,
        title,
        explanation,
        isWritingCurrentPinCode,
        isWritingNewPinCode,
        isWritingRepeatNewPinCode,
        getDigitIsFilled,
        showWrongMatchMessage,
        askToRemember,
        rememberPin,
        setRememberPin,
        failed,
        isLoading,
        handleDigitPress,
        handleBackspacePress,
        handlePopupClose
    } = usePinPopupData();
    const actions = usePinStoreActions();
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        isOpen && document.addEventListener('keydown', keyDownHandler);
        if (isOpen && hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }

        return () => document.removeEventListener('keydown', keyDownHandler);
    }, [isOpen, isWritingNewPinCode, isWritingRepeatNewPinCode, isWritingCurrentPinCode]);

    useEffect(() => {
        /* This is a workaround for react-native. So on web we can close popup immediately. */
        if (isClosing) {
            actions.popupIsClosed();
        }
    }, [isClosing]);

    const keyDownHandler = (e: KeyboardEvent) => {
        const key = e.key;
        const keyInt = parseInt(key);
        const isDigit = !isNaN(keyInt);
        const isBackspace = key === 'Backspace';

        if (isBackspace) {
            handleBackspacePress();
        }

        if (isDigit && keyInt > -1 && keyInt < 10) {
            handleDigitPress(key);
        }
    };

    const handleContainerClick = () => {
        hiddenInputRef.current && hiddenInputRef.current.focus();
    };

    return (
        <Modal isOpen={isOpen} size="medium" title={{ text: title }} onClose={handlePopupClose} data-testid="pin">
            <div className={classes.container} onClick={handleContainerClick}>
                <span className={classes.explanation} data-testid="new-pin-explanation">
                    {explanation}
                </span>

                <div className={classes.digits}>
                    {[...Array(4).keys()].map((index) => (
                        <div
                            data-testid={`pin-digit-${index}`}
                            key={index}
                            className={cn(classes.digit, getDigitIsFilled(index) && classes.filled, isLoading && classes.loading)}
                        />
                    ))}
                </div>

                {showWrongMatchMessage && (
                    <span className={classes.wrong} data-testid="pin-mismatch">
                        {t('orders.live_orders_pin.main.pin_mismatch')}
                    </span>
                )}

                {failed && (
                    <span className={classes.wrong} data-testid="pin-failed">
                        {t('orders.live_orders_pin.main.please_try_again')}
                    </span>
                )}

                {askToRemember && (
                    <div className={classes.rememberMe}>
                        <Checkbox
                            name="pin-remember"
                            value="pin-remember"
                            data-testid="pin-remember"
                            checked={rememberPin}
                            onChange={(e) => setRememberPin(e.target.checked)}
                            label={t('orders.live_orders_pin.main.remember') ?? 'Remember'}
                        />
                    </div>
                )}
            </div>

            <input
                ref={hiddenInputRef}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus
                className={classes.hiddenInput}
                aria-hidden="true"
            />
        </Modal>
    );
};

export default PinPopup;
