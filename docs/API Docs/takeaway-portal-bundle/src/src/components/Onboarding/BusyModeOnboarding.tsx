import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import busyModeIllustration from '../../static/images/busy-mode.svg';
import OnboardingBase from './OnboardingBase';
import classes from './OnboardingBase.module.scss';

const BusyModeOnboarding: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleActionButtonClick = () => {
        navigate('/settings');
    };

    return (
        <OnboardingBase
            id="busy-mode"
            title={t('orders.live_orders_messages.main.pause_delivery_pick_up_and_close_heading')}
            actionButtonText={t('orders.live_orders_messages.main.go_to_settings')}
            onActionButtonClick={handleActionButtonClick}
        >
            <img src={busyModeIllustration} className={classes.image} />
            <p className={classes.message}>{t('orders.live_orders_messages.main.pause_delivery_pick_up_and_close_message')}</p>
        </OnboardingBase>
    );
};

export default BusyModeOnboarding;
