import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import { PinAction, usePinStoreActions } from '@lo/shared/store/pin';
import ToggleBlock from '../ToggleBlock/ToggleBlock';
import { RestaurantModel } from '@lo/shared/models';
import usePinProtection from '@lo/shared/hooks/usePinProtection';
import { useNavigate } from 'react-router';

type PinCodeSettingsProps = {
    restaurant: RestaurantModel;
};

const PinCodeSettings: FC<PinCodeSettingsProps> = ({ restaurant }) => {
    const { openPopup } = usePinStoreActions();
    const navigate = useNavigate();
    const { checkPin, isLoading } = usePinProtection(() => navigate('/orders'));
    const { t } = useTranslation();

    useEffect(() => {
        checkPin();
    }, []);

    const pinEnabled = restaurant.restaurant_settings.pin_code_enabled;

    return (
        <>
            <ToggleBlock
                settingType="general"
                settingName="pin_code_enabled"
                message={t('orders.live_orders_pin.main.enable')}
                isSwitcherOn={pinEnabled}
                toggleSwitcher={() => openPopup({ action: pinEnabled ? PinAction.DISABLE : PinAction.ENABLE })}
                disabled={isLoading}
            />

            {pinEnabled && (
                <Button
                    data-testid="change-pin-code-button"
                    style={{ width: 150 }}
                    variant="primary"
                    size="small-expressive"
                    onClick={() => openPopup({ action: PinAction.UPDATE })}
                >
                    {t('orders.live_orders_pin.main.change')}
                </Button>
            )}
        </>
    );
};

export default PinCodeSettings;
