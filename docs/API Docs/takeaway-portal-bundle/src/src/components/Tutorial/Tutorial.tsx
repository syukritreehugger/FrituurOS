import React, { PropsWithChildren, useState } from 'react';
import { Step, Steps } from 'intro.js-react';
import { useTranslation } from 'react-i18next';
import { getBooleanFromString } from '@lo/shared/helpers/string/getBooleanFromString';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { useIsTrainingActive } from '@lo/shared/store/trainings';

type TutorialProps = {
    id: string;
    enabled: boolean;
    steps?: Step[];
    scrollToElement?: boolean;
};

const Tutorial: React.FC<PropsWithChildren<TutorialProps>> = ({ id, enabled, steps, scrollToElement = true }) => {
    const { t, ready } = useTranslation();
    const restaurant = useRestaurant();
    const [seenTutorials, setSeenTutorials] = useState(localStorage.getItem('seenTutorials')?.split(',') || []);

    const tutorialsEnabled = restaurant.ui_settings.enable_tutorials;
    const isOnboardingVisible = getBooleanFromString(localStorage.getItem('isOnboardingVisible') || 'false');
    const isTrainingActive = useIsTrainingActive();
    const showTutorial =
        ready && enabled && tutorialsEnabled && !seenTutorials?.includes(id) && !isOnboardingVisible && !isTrainingActive;

    const handleTutorialFinish = (): void => {
        const updatedSeenTutorials = [...seenTutorials, id];
        setSeenTutorials(updatedSeenTutorials);
        localStorage.setItem('seenTutorials', updatedSeenTutorials.join(','));
    };

    if (!steps) return null;

    return (
        <Steps
            enabled={showTutorial}
            initialStep={0}
            steps={steps}
            onExit={handleTutorialFinish}
            options={{
                prevLabel: t('orders.live_orders_tutorials.buttons.back'),
                nextLabel: t('orders.live_orders_tutorials.buttons.next'),
                doneLabel: t('orders.live_orders_tutorials.buttons.done'),
                scrollToElement,
                scrollTo: 'tooltip',
                disableInteraction: true,
                hidePrev: true,
                showBullets: steps.length > 1,
                highlightClass: 'tutorial-highlight',
                tooltipClass: 'tutorial-tooltip',
                buttonClass: 'tutorial-btn'
            }}
        />
    );
};

export default Tutorial;
