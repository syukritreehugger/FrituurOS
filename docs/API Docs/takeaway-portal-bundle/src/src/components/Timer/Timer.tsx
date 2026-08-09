import React from 'react';
import classNames from 'classnames';
import { skipTokens } from '@jet-pie/theme/variations/skip';
import { Check, CloseCircleFilled, ClockFilled, User, CalendarFilled } from '@jet-pie/react/esm/icons';
import useOrderTimer from '@lo/shared/hooks/useOrderTimer';
import OrderModel from '@lo/shared/models/OrderModel';
import classes from './Timer.module.scss';

type TimerProps = {
    order: OrderModel;
};

const Timer: React.FC<TimerProps> = ({ order }) => {
    const {
        progressBar,
        minutesLeft,
        showDate,
        showCountdown,
        showTime,
        requestedDate,
        requestedTime,
        deliveredTime,
        isDelayed
    } = useOrderTimer(order);

    return (
        <div className={classNames(classes.container, { [classes.delayed]: isDelayed })}>
            {progressBar !== null && (
                <svg className={classes.progressBarContainer}>
                    <circle
                        cx={progressBar.center}
                        cy={progressBar.center}
                        fill="transparent"
                        r={progressBar.radius}
                        stroke={skipTokens.global.mozzarella30}
                        strokeWidth={progressBar.width}
                    />
                    <circle
                        cx={progressBar.center}
                        cy={progressBar.center}
                        fill="transparent"
                        r={progressBar.radius}
                        stroke={progressBar.color}
                        strokeWidth={progressBar.width}
                        strokeDasharray={progressBar.dashArray}
                        strokeDashoffset={progressBar.dashOffset}
                        strokeLinecap="round"
                    />
                </svg>
            )}

            {order.is_cancelled && (
                <>
                    <span className={classes.cancelledIcon} data-testid={`order-${order.public_reference}-cancelled-icon`}>
                        <CloseCircleFilled fill={skipTokens.global.red} width={13} height={13} />
                    </span>
                    <User fill={skipTokens.global.red} width={35} height={35} />
                </>
            )}

            {showDate && (
                <>
                    <CalendarFilled fill={skipTokens.global.charcoal80} width={24} height={24} />
                    <div className={classes.time} data-testid={`order-${order.public_reference}-date`}>
                        {requestedDate}
                    </div>
                </>
            )}

            {showCountdown && (
                <>
                    <div className={classes.time} data-testid={`order-${order.public_reference}-time-left`}>
                        {minutesLeft ?? '--'}
                    </div>
                    <div className={classes.units}>min</div>
                </>
            )}

            {showTime && (
                <>
                    {order.is_delivered ? <Check /> : <ClockFilled fill={skipTokens.global.charcoal80} width={24} height={24} />}
                    <div
                        className={classNames(classes.time, { [classes.delivered]: order.is_delivered })}
                        data-testid={`order-${order.public_reference}-time`}
                    >
                        {order.is_delivered ? deliveredTime : requestedTime}
                    </div>
                </>
            )}
        </div>
    );
};

export default Timer;
