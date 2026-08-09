import React from 'react';
import classes from './SoundSetting.module.scss';
import Select from '@lo/web/components/UI/Select/Select';
import { Button } from '@jet-pie/react';
import { playSound, SOUND_MAP } from '@lo/shared/helpers/playSound';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { UISettingsType } from '@lo/shared/types/uiSettingsType';
import useUpdateSetting from '@lo/shared/hooks/useUpdateSetting';
import { SOUND_NAMES } from '@lo/shared/constants';

type SoundSettingProps = {
    name: keyof Pick<UISettingsType, 'order_update_sound' | 'incoming_order_sound' | 'other_notification_sound'>;
    value:
        | UISettingsType['incoming_order_sound']
        | UISettingsType['order_update_sound']
        | UISettingsType['other_notification_sound'];
    heading: string;
    description: string;
};

const SoundSetting: React.FC<SoundSettingProps> = ({ name, value, heading, description }) => {
    const { isLessThanDesktopWidth } = useWindowSize();
    const { t } = useTranslation();
    const updateSetting = useUpdateSetting('ui', name);

    const soundOptions = SOUND_NAMES.map((key) => ({
        value: key,
        label: t(`orders.live_orders_settings.sounds.${SOUND_MAP[key]?.name || 'default'}`)
    }));

    const handleSoundChange = (soundName) => {
        if (soundName !== value) {
            updateSetting.mutate(soundName);
        }
    };

    const renderSelectedSound = (soundName) => (
        <>
            <div className={classes.soundIcon} />
            <p className={classes.selectedSoundValue}>{soundName}</p>
        </>
    );

    return (
        <div className={classes.item}>
            <span className={classes.itemHeading}>{heading}</span>
            <p>{description}</p>
            <div className={classes.selectContainer}>
                <Select
                    key={value} // to update component when sound changes from sockets
                    large
                    dataTestId="select"
                    onChange={handleSoundChange}
                    defaultValue={value}
                    options={soundOptions}
                    placeholder={t('orders.live_orders_settings.settings_page.sound_select')}
                    renderValue={renderSelectedSound}
                    width={isLessThanDesktopWidth ? '100%' : '240px'}
                    maxDropdownHeight={324}
                />
                <div className={classes.soundTestButton}>
                    <Button data-testid="soundTest" onClick={() => playSound(value || 'default')}>
                        <div className={classes.playButtonText}>
                            <div className={classes.playIcon} />
                            {!isLessThanDesktopWidth && t('orders.live_orders_settings.settings_page.sound_play')}
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SoundSetting;
