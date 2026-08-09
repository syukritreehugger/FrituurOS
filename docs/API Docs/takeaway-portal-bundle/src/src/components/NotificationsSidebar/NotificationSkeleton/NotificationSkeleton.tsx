import React from 'react';
import classes from './NotificationSkeleton.module.scss';
import { Skeleton } from '@jet-pie/react';

const NotificationSkeleton: React.FC = () => {
    return (
        <div className={classes.container} data-testid="notifications-loader">
            <div className={classes.icon}>
                <Skeleton variant="circle" width="20px" height="20px" />
            </div>
            <div className={classes.lines}>
                <Skeleton variant="box" width="200px" />
                <Skeleton variant="box" width="160px" />
            </div>
        </div>
    );
};

export default NotificationSkeleton;
