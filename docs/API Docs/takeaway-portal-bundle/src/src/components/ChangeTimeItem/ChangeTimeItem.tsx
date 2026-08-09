import React from 'react';
import { IconButton } from '@jet-pie/react';
import Minus from '@jet-pie/react/esm/icons/Minus';
import Plus from '@jet-pie/react/esm/icons/Plus';
import classes from './ChangeTimeItem.module.scss';
import { trainingElements } from '@lo/shared/types/trainings';

export type ChangeTimeItemProps = {
    name: string;
    dataTestId: string;
    onIncrease: (value: number) => void;
    onDecrease: (value: number) => void;
    value: number | string | null;
    isDisabledIncrease: boolean;
    isDisabledDecrease: boolean;
    step?: number;
    icon?: React.ReactNode;
    labelText?: string;
};

const ChangeTimeItem: React.FC<ChangeTimeItemProps> = (props) => {
    const {
        name,
        dataTestId,
        isDisabledDecrease,
        onDecrease,
        value,
        isDisabledIncrease,
        onIncrease,
        step,
        icon,
        labelText = 'min'
    } = props;

    const defineStepNumber = step ? step : 5;
    const numericValue = typeof value === 'number' ? value : 0;

    return (
        <div className={classes.changeTimeItem} key={name} data-testid={`change-time-item-${dataTestId}`}>
            <div className={classes.changeTimeInfo}>
                {icon && <span className={classes.icon}>{icon}</span>}
                {name}
            </div>

            <div className={classes.changeTimeInput} data-training-id={trainingElements.timeControls}>
                <IconButton
                    data-testid={`change-time-decrease-${dataTestId}${isDisabledDecrease ? '-disabled' : ''}`}
                    onClick={() => onDecrease(numericValue - defineStepNumber)}
                    disabled={isDisabledDecrease}
                    variant="primary"
                    size="medium"
                    icon={<Minus />}
                    className={classes.iconButton}
                />

                <div className={classes.changeTimeInputResult} data-training-id={trainingElements.deliveryTime}>
                    <span data-testid={`change-time-${dataTestId}-value`}>{value !== null ? value : 0}</span> {labelText}
                </div>

                <IconButton
                    data-testid={`change-time-increase-${dataTestId}${isDisabledIncrease ? '-disabled' : ''}`}
                    onClick={() => onIncrease(numericValue + defineStepNumber)}
                    disabled={isDisabledIncrease}
                    variant="primary"
                    size="medium"
                    icon={<Plus />}
                    className={classes.iconButton}
                />
            </div>
        </div>
    );
};

export default ChangeTimeItem;
