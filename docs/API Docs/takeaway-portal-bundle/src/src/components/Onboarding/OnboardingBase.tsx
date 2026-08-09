import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal } from '@jet-pie/react';
import classes from './OnboardingBase.module.scss';

type OnboardingBaseProps = PropsWithChildren<{
    id: string;
    title: string;
    actionButtonText: string;
    onActionButtonClick: () => void;
}>;

const OnboardingBase: React.FC<OnboardingBaseProps> = ({ id, title, actionButtonText, onActionButtonClick, children }) => {
    const { t, ready } = useTranslation();
    const [toNotShowAgainChecked, setToNotShowAgainChecked] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [seenOnboardings, setSeenOnboardings] = useState(localStorage.getItem('seenOnboardings')?.split(',') || []);
    const showOnboarding = ready && isVisible && !seenOnboardings?.includes(id);

    useEffect(() => {
        localStorage.setItem('isOnboardingVisible', showOnboarding ? 'true' : 'false');
    }, [showOnboarding]);

    const closeOnboarding = (): void => {
        setIsVisible(false);

        if (toNotShowAgainChecked) {
            const updatedSeenOnboardings = [...new Set([...seenOnboardings, id])];
            setSeenOnboardings(updatedSeenOnboardings);
            localStorage.setItem('seenOnboardings', updatedSeenOnboardings.join(','));
        }
    };

    const handleActionButtonClick = () => {
        closeOnboarding();
        onActionButtonClick();
    };

    return (
        <Modal title={{ text: title }} size="medium" isOpen={showOnboarding} onClose={closeOnboarding}>
            <div className={classes.container}>
                {children}
                <div className={classes.checkboxContainer}>
                    <Checkbox
                        name="onboarding"
                        value="onboarding"
                        checked={toNotShowAgainChecked}
                        onChange={() => setToNotShowAgainChecked(!toNotShowAgainChecked)}
                        label={
                            t('orders.live_orders_messages.main.do_not_show_this_message_again') ||
                            'Do not show this message again'
                        }
                    />
                </div>
                <div>
                    <Button className={classes.actionButton} onClick={handleActionButtonClick}>
                        {actionButtonText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default OnboardingBase;
