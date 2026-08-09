import React, { useRef } from 'react';
import { Button } from '@jet-pie/react';
import { useTranslation } from 'react-i18next';
import { useActiveTraining, useIsBackButtonVisible } from '@lo/shared/store/trainings';
import { TrainingStep } from '@lo/shared/types/trainings';
import classes from './TrainingCard.module.scss';
import classNames from 'classnames';
import { ChevronRight } from '@jet-pie/react/esm/icons';
import useCardPosition from '../hooks/useCardPosition';

export const getHighlightedText = (text: string) =>
    text.split(/{{beginStrong}}(.*?){{endStrong}}/g).map((part, index) => ({
        text: part,
        isStrong: index % 2 === 1
    }));

type TrainingCardProps = {
    step: TrainingStep;
    element?: Element | null;
    isVisible: boolean;
    onComplete: () => void;
    onPrevious: () => void;
};

const TrainingCard = (props: TrainingCardProps) => {
    const { step, element, isVisible, onComplete, onPrevious } = props;
    const { t } = useTranslation();
    const cardRef = useRef<HTMLDivElement | null>(null);
    const training = useActiveTraining();
    const isBackButtonVisible = useIsBackButtonVisible();
    const { cardPosition } = useCardPosition(cardRef, element);

    const title = step.title
        ? t(`orders.live_orders_trainings.${training.id}.${step.title}`)
        : t(`orders.live_orders_trainings.${training.id}.title`);

    const formattedContent = getHighlightedText(t(`orders.live_orders_trainings.${training.id}.${step.id}`));

    return (
        <div
            ref={cardRef}
            className={classNames(classes.step, { [classes.visible]: isVisible && cardPosition })}
            style={cardPosition}
            data-testid="training-card"
        >
            <p className={step.title ? classes.title : classes.trainingTitle}>{title}</p>
            <p className={classes.content}>
                {formattedContent.map((part) => (
                    <span key={part.text} className={classNames({ [classes.strong]: part.isStrong })}>
                        {part.text}
                    </span>
                ))}
            </p>
            <div className={classes.navigation}>
                {isBackButtonVisible && (
                    <Button onClick={onPrevious} variant="ghost" size="small-productive">
                        {t(`orders.live_orders_trainings.main.back`)}
                    </Button>
                )}
                {step.title ? (
                    <Button onClick={onComplete} variant="primary" size="small-expressive">
                        {t(`orders.live_orders_trainings.main.continue`)}
                    </Button>
                ) : (
                    <Button
                        onClick={onComplete}
                        variant="outline"
                        size="small-productive"
                        icon={<ChevronRight />}
                        iconPosition="trailing"
                    >
                        {t(`orders.live_orders_trainings.main.next`)}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default TrainingCard;
