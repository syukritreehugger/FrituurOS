import React from 'react';
import { Skeleton } from '@jet-pie/react';
import classes from './ToolbarSkeleton.module.scss';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';

const ToolbarSkeleton: React.FC = () => {
    const { isLessThanDesktopWidth } = useWindowSize();

    if (isLessThanDesktopWidth)
        return (
            <div className={classes.filters}>
                <Skeleton variant="circle" width="48px" height="48px" />
            </div>
        );

    return (
        <div className={classes.container}>
            <div className={classes.title}>
                <Skeleton variant="text" width="120px" height="24px" />
            </div>
            <div className={classes.toggle}>
                <Skeleton variant="text" width="200px" />
                <Skeleton variant="text" width="30px" />
            </div>
            <div className={classes.stockContainer}>
                <Skeleton variant="text" width="100%" height="150px" radius="roundedD" />
            </div>
        </div>
    );
};

export default ToolbarSkeleton;
