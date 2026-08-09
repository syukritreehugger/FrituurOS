import React from 'react';
import ToggleSwitcher from '@lo/web/components/UI/ToggleSwitcher/ToggleSwitcher';
import useUpdateSetting from '@lo/shared/hooks/useUpdateSetting';
import { RestaurantSettings } from '@lo/shared/types/restaurantSettingsType';
import { UISettingsType } from '@lo/shared/types/uiSettingsType';
import { ReceiptSettings } from '@lo/shared/types/receiptSettingsType';
import classes from './ToggleBlock.module.scss';

export type ToggleBlockProps = {
    settingType: 'receipt' | 'general' | 'ui';
    settingName: keyof RestaurantSettings | keyof UISettingsType | keyof ReceiptSettings;
    message: string;
    isSwitcherOn: boolean;
    toggleSwitcher?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
};

const ToggleBlock: React.FC<ToggleBlockProps> = (props) => {
    const { settingType, settingName, message, isSwitcherOn, toggleSwitcher, disabled, isLoading } = props;

    const updateSetting = useUpdateSetting(settingType, settingName);

    return (
        <div className={classes.container}>
            <span>{message}</span>
            <ToggleSwitcher
                loading={isLoading ?? updateSetting.isPending}
                dataTestId={`${settingName}-switcher`}
                isSwitcherOn={isSwitcherOn}
                toggleSwitcher={toggleSwitcher ? toggleSwitcher : () => updateSetting.mutate(!isSwitcherOn)}
                disabled={disabled}
            />
        </div>
    );
};

export default ToggleBlock;
