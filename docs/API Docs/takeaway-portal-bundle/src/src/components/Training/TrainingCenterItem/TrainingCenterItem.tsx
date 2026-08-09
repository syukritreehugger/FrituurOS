import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ChevronDown, ChevronUp, Refresh } from '@jet-pie/react/esm/icons';
import {
    useActiveTraining,
    useCompletedTrainingsIds,
    useIsTrainingActive,
    useTrainingToContinue
} from '@lo/shared/store/trainings';
import classes from './TrainingCenterItem.module.scss';
import classNames from 'classnames';
import { Training } from '@lo/shared/types/trainings';
import { Button, IconButton } from '@jet-pie/react';

type TrainingCenterItemProps = {
    training: Training;
    isHeader: boolean;
    onTrainingSelect: (id: string) => void;
};

const TrainingCenterItem: FC<TrainingCenterItemProps> = ({ training, isHeader, onTrainingSelect }) => {
    const { t } = useTranslation();
    const isActive = useIsTrainingActive();
    const activeTraining = useActiveTraining();
    const completedTrainings = useCompletedTrainingsIds();
    const trainingToContinue = useTrainingToContinue();
    const [isCollapsed, setIsCollapsed] = useState(activeTraining.id !== training.id);
    const isTrainingCompleted = completedTrainings.includes(training.id);
    const trainingDescription = t(`orders.live_orders_trainings.${training.id}.description`).split(',');
    const showContinueButton =
        trainingToContinue && isHeader
            ? trainingToContinue.id === training.id && (activeTraining.id !== trainingToContinue.id || !isActive)
            : false;

    const handleItemClick = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div
            data-testid={`training-center-item-${training.id}`}
            onClick={handleItemClick}
            className={classes.completedItemContainer}
            key={training.id}
        >
            <div className={classes.completedItem}>
                <div className={classes.completedItemIcon}>
                    <CheckCircle height={isTrainingCompleted ? '100%' : 0} width={21} />
                </div>
                <p
                    className={classNames(classes.completedItemTitle, {
                        [classes.active]: activeTraining.id === training.id
                    })}
                >
                    {t(`orders.live_orders_trainings.${training.id}.title`)}
                </p>
                <div className={classes.restartButton}>
                    {showContinueButton ? (
                        <Button onClick={() => onTrainingSelect(training.id)} size="xSmall">
                            {t('orders.live_orders_trainings.main.continue')}
                        </Button>
                    ) : (
                        <IconButton
                            data-testid="training-center-item-chevron-button"
                            onClick={() => (isTrainingCompleted ? onTrainingSelect(training.id) : handleItemClick())}
                            variant="ghost-tertiary"
                            size="x-small"
                            icon={isTrainingCompleted ? <Refresh /> : isCollapsed ? <ChevronDown /> : <ChevronUp />}
                        />
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className={classes.completedItemDescription}>
                    {trainingDescription.map((descriptionItem) => (
                        <p className={classes.stepTitle} key={descriptionItem}>
                            {descriptionItem}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrainingCenterItem;
