import React, { useState } from 'react';
import { IconButton } from '@jet-pie/react';
import { Tutorial } from '@jet-pie/react/esm/icons';
import { trainingChecklist } from '@lo/shared/helpers/trainings';
import { useCompletedTrainingsIds, useIsTrainingActive, useTrainingActions, useTrainingReview } from '@lo/shared/store/trainings';
import TrainingCenterPopup from '../TrainingCenterPopup/TrainingCenterPopup';
import classes from './TrainingCenter.module.scss';

type TrainingCenterProps = {
    isHeader?: boolean;
};

const TrainingCenter = ({ isHeader = false }: TrainingCenterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { toggleReview, completeTrainings } = useTrainingActions();
    const completedTrainings = useCompletedTrainingsIds();
    const isReview = useTrainingReview();
    const isActive = useIsTrainingActive();
    const completedTrainingsAmount = completedTrainings.length;
    const trainingsAmount = trainingChecklist.length;
    const remainingAmount = trainingsAmount - completedTrainingsAmount;

    const toggleTrainingCenter = () => {
        if (isHeader) {
            setIsOpen(!isOpen);
        } else {
            toggleReview();
        }
    };

    const closeTrainingCenter = () => {
        if (remainingAmount === 0) {
            completeTrainings();
        }

        setIsOpen(false);
        toggleReview(false);
    };

    if (isHeader && (remainingAmount === 0 || isActive)) return null;
    return (
        <>
            {isReview && !isHeader && <div className={classes.overlay} />}
            <div
                className={isHeader ? classes.trainingCenterHeader : classes.trainingCenterWrapper}
                data-testid="training-center"
            >
                <div
                    onPointerDown={(event) => {
                        event.preventDefault();
                    }}
                    onClick={toggleTrainingCenter}
                    className={classes.trainingCenterButton}
                >
                    <IconButton
                        data-testid="training-center-button"
                        variant={isHeader ? 'primary' : 'secondary'}
                        size={isHeader ? 'small' : 'medium'}
                        icon={<Tutorial />}
                    />
                </div>
                {isHeader && <div className={classes.trainingButtonCounter}>{remainingAmount}</div>}
                <TrainingCenterPopup isHeader={isHeader} isOpen={isHeader ? isOpen : isReview} onClose={closeTrainingCenter} />
            </div>
        </>
    );
};

export default TrainingCenter;
