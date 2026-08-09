import React from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, IconButton, ProgressBar, useOnClickOutside } from '@jet-pie/react';
import { trainingChecklist } from '@lo/shared/helpers/trainings';
import { useCompletedTrainingsIds, useTrainingActions } from '@lo/shared/store/trainings';
import classes from './TrainingCenterPopup.module.scss';
import TrainingCenterItem from '../TrainingCenterItem/TrainingCenterItem';
import { Close } from '@jet-pie/react/esm/icons';
import { useWindowSize } from '../../../hooks/useWindowSize';

type TrainingCenterPopupProps = {
    isOpen: boolean;
    isHeader?: boolean;
    onClose: () => void;
};

const TrainingCenterPopup = ({ isOpen, isHeader = false, onClose }: TrainingCenterPopupProps) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const { closeTraining, selectTraining } = useTrainingActions();
    const completedTrainings = useCompletedTrainingsIds();
    const { containerRef } = useOnClickOutside(onClose);
    const completedTrainingsAmount = completedTrainings.length;
    const trainingsAmount = trainingChecklist.length;
    const timeLeft = trainingChecklist.reduce(
        (time, item) => time + (completedTrainings.includes(item.id) ? 0 : item.timeToComplete),
        0
    );

    const saveAndExit = () => {
        closeTraining();
        onClose();
    };

    const onTrainingSelect = (id: string) => {
        selectTraining(id);
        onClose();
    };

    const trainingCenterBody = (
        <div className={classes.trainingCenter}>
            {!isHeader && !isLessThanTabletWidth && (
                <div className={classes.saveButton}>
                    <Button onClick={saveAndExit} variant="ghost" size="xSmall">
                        {t(`orders.live_orders_trainings.main.save_and_exit`)}
                    </Button>
                </div>
            )}

            {!isLessThanTabletWidth && <p className={classes.title}>{t(`orders.live_orders_trainings.main.title`)}</p>}
            <p className={classes.subtitle}>{t('orders.live_orders_trainings.main.subtitle', { timeLeft })}</p>

            <p className={classes.progressTitle}>{`${completedTrainingsAmount} of ${trainingsAmount}`}</p>
            <ProgressBar percentage={(completedTrainingsAmount / trainingsAmount) * 100} variant="default" color="brand" />

            <div className={classes.checklist}>
                {trainingChecklist.map((training) => (
                    <TrainingCenterItem
                        isHeader={isHeader}
                        key={training.id}
                        training={training}
                        onTrainingSelect={onTrainingSelect}
                    />
                ))}
            </div>
        </div>
    );

    if (isLessThanTabletWidth) {
        return (
            <BottomSheet
                headerTitle={t(`orders.live_orders_trainings.main.title`)}
                headerContentModifiers="default"
                height="auto"
                isOpened={isOpen}
                onClose={onClose}
                hasBodyPadding={false}
                shouldCloseOnOverlayClick
            >
                <div className={classes.mobileContainer}>{trainingCenterBody}</div>
                {!isHeader && (
                    <div className={classes.bottomSheetActions}>
                        <Button onClick={saveAndExit} variant="secondary" size="small-productive">
                            {t(`orders.live_orders_trainings.main.save_and_exit`)}
                        </Button>
                    </div>
                )}
            </BottomSheet>
        );
    }

    return (
        isOpen && (
            <div ref={containerRef} className={isHeader ? classes.containerForHeader : classes.container}>
                {trainingCenterBody}

                {!isHeader && (
                    <div className={classes.closeIconButton}>
                        <IconButton
                            data-testid="training-center-close-button"
                            variant="secondary"
                            size="medium"
                            icon={<Close />}
                            onClick={onClose}
                        />
                    </div>
                )}
            </div>
        )
    );
};

export default TrainingCenterPopup;
