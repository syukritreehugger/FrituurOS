import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './TogglePopupBase.module.scss';
import SettingOptionButton from '@lo/web/components/UI/SettingsOptionButton/SettingsOptionButton';
import PopupToggle from '@lo/web/components/UI/PopupToggle/PopupToggle';
import classNames from 'classnames';
import {
    durationOptions,
    DurationOptionsEnum,
    durationValues,
    getOpenTimeTranslation,
    minutesStatusTitle,
    reasonOptions,
    ReasonsEnum,
    untilTomorrowStatusTitle
} from '@lo/shared/helpers/worktime/worktimeSlotsHelpers';
import { CloseRestaurantEvent, ToggleType } from '@lo/shared/hooks/useRestaurantStatus';
import { Button, Modal } from '@jet-pie/react';
import { RestaurantModel } from '@lo/shared/models';
import { useNavigate } from 'react-router';
import { trainingElements } from '@lo/shared/types/trainings';

export type TogglePopupBaseProps = {
    testID: string;
    isClosed: boolean;
    minutesLeft?: number;
    toggleType: ToggleType;
    restaurant: RestaurantModel;
    heading: string;
    toggleTitle: string;
    title: string;
    closedTitle: string;
    subtitle: string;
    reasonSelectTitle: string;
    timeSelectTitle: string;
    confirmButtonTitle: string;
    toggleOpenedTitle: string;
    toggleClosedTitle: string;
    closeRestaurant: CloseRestaurantEvent;
    openRestaurant: () => void;
    isPauseModalOpen?: boolean;
};

const TogglePopupBase: React.FC<TogglePopupBaseProps> = (props) => {
    const {
        restaurant,
        isClosed,
        minutesLeft,
        heading,
        toggleTitle,
        title,
        closedTitle,
        subtitle,
        reasonSelectTitle,
        timeSelectTitle,
        confirmButtonTitle,
        toggleOpenedTitle,
        toggleClosedTitle,
        testID,
        toggleType,
        closeRestaurant,
        openRestaurant,
        isPauseModalOpen = false
    } = props;
    const { t } = useTranslation();
    const [isOpen, setOpen] = useState(false);
    const [reason, setReason] = useState<ReasonsEnum | null>(null);
    const [durationKey, setDurationKey] = useState<DurationOptionsEnum | null>(null);
    const navigate = useNavigate();

    const isConfirmDisabled = !reason || !durationKey;

    const closedStatusTitle =
        minutesLeft && minutesLeft < 60
            ? minutesStatusTitle(t, toggleType === 'all', minutesLeft)
            : untilTomorrowStatusTitle(t, toggleType === 'all');

    useEffect(() => {
        if (!isOpen) {
            setReason(null);
            setDurationKey(null);
        }
    }, [isOpen]);

    useEffect(() => {
        setOpen(isPauseModalOpen);
    }, [isPauseModalOpen]);

    const toggleModal = () => {
        setOpen(!isOpen);
        if (isPauseModalOpen) {
            navigate('/orders', { replace: true });
        }
    };

    const handleDisable = () => {
        if (reason && durationKey) {
            closeRestaurant(toggleType, reason, durationValues[durationKey]);
        }
        toggleModal();
    };

    const handleEnable = () => {
        openRestaurant();
        toggleModal();
    };

    const handleReasonClick = (id: ReasonsEnum) => {
        setReason(id);
    };

    const handleDurationClick = (id: DurationOptionsEnum) => {
        setDurationKey(id);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={toggleModal} title={{ text: heading }} className={classes.modal} size="medium">
                <div className={classes.content}>
                    <div className={classes.modalContentContainer}>
                        <h2 className={classes.subTitle}>{isClosed ? closedTitle : title}</h2>
                        {!isClosed && <p className={classes.subTitleParagraph}>{subtitle}</p>}
                        <div className={classes.settingStatusContainer}>
                            <div className={classes.restaurantName}>{restaurant.name}</div>
                            <div className={classes.settingStatus}>{isClosed ? closedStatusTitle : toggleOpenedTitle}</div>
                        </div>

                        {!isClosed && (
                            <div className={classes.formContainer}>
                                <h2 className={classes.subTitle}>{reasonSelectTitle}</h2>
                                <div className={classes.buttonsGroup} key="1">
                                    {reasonOptions(t, restaurant).map((option) => (
                                        <SettingOptionButton
                                            key={option.id}
                                            dataTest={`reason-${option.id}`}
                                            selected={reason === option.id}
                                            title={option.title}
                                            onClick={() => handleReasonClick(option.id)}
                                        />
                                    ))}
                                </div>

                                <h2 className={classNames(classes.subTitle)}>{timeSelectTitle}</h2>
                                <div className={classes.buttonsGroup} data-training-id={trainingElements.pauseRestaurantModal}>
                                    {durationOptions(t).map((option) => (
                                        <SettingOptionButton
                                            key={option.id}
                                            dataTest={`duration-${option.id}`}
                                            selected={durationKey === option.id}
                                            title={option.title}
                                            description={getOpenTimeTranslation(t, durationValues[option.id])}
                                            onClick={() => handleDurationClick(option.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={classes.popupFooterContainer}>
                        <div className={classes.cancelButton}>
                            <Button size="medium" onClick={toggleModal} variant="ghost">
                                {t('orders.live_orders_settings.restaurant.cancel')}
                            </Button>
                        </div>
                        {isClosed ? (
                            <Button size="medium" data-testid={`${testID}-open-button`} onClick={handleEnable}>
                                {t('orders.live_orders_settings.restaurant.switch_to_available')}
                            </Button>
                        ) : (
                            <Button
                                size="medium"
                                data-testid={`${testID}-close-button`}
                                disabled={isConfirmDisabled}
                                onClick={handleDisable}
                            >
                                {confirmButtonTitle}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
            <div className={classes.toggle}>
                <p className={classes.toggleTitle}>{toggleTitle}</p>
                <PopupToggle
                    testID={`${testID}-toggle`}
                    isActive={!isClosed}
                    title={isClosed ? toggleClosedTitle : toggleOpenedTitle}
                    onClick={toggleModal}
                />
            </div>
        </>
    );
};
export default TogglePopupBase;
