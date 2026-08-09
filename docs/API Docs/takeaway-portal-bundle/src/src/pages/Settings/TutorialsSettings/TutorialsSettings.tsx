import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import ToggleBlock from '../ToggleBlock/ToggleBlock';
import { RestaurantModel } from '@lo/shared/models';
import { useTrainingActions } from '@lo/shared/store/trainings';

type TutorialsSettingsProps = {
    restaurant: RestaurantModel;
};

const TutorialsSettings: React.FC<TutorialsSettingsProps> = ({ restaurant }) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const [seenTutorials, setSeenTutorials] = useState(localStorage.getItem('seenTutorials') !== null);
    const trainingActions = useTrainingActions();

    const handleRestart = () => {
        localStorage.removeItem('seenTutorials');
        trainingActions.resetTrainings();
        setSeenTutorials(false);
    };

    return (
        !!restaurant && (
            <>
                <ToggleBlock
                    settingType="ui"
                    settingName="enable_tutorials"
                    message={t('orders.live_orders_settings.tutorials.enable')}
                    isSwitcherOn={restaurant.ui_settings.enable_tutorials}
                />

                {restaurant.ui_settings.enable_tutorials && (
                    <Button
                        data-testid="tutorials-reset-button"
                        onClick={handleRestart}
                        disabled={!seenTutorials}
                        size={isLessThanTabletWidth ? 'xSmall' : 'small-expressive'}
                    >
                        {t('orders.live_orders_settings.tutorials.restart')}
                    </Button>
                )}
            </>
        )
    );
};

export default TutorialsSettings;
