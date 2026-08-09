import React from 'react';
import { Skeleton } from '@jet-pie/react';
import classes from './MenuSkeleton.module.scss';
import RepeaterContainer from '@lo/web/components/UI/RepeaterContainer/RepeaterContainer';

const MenuSkeleton: React.FC = () => {
    return (
        <div className={classes.container}>
            <div className={classes.slider}>
                <RepeaterContainer times={2}>
                    <div className={classes.sliderItem}>
                        <Skeleton variant="pill" width="160px" />
                    </div>
                </RepeaterContainer>
            </div>
            <RepeaterContainer times={2}>
                <div className={classes.section}>
                    <div className={classes.category}>
                        <Skeleton variant="text" width="120px" />
                    </div>

                    <RepeaterContainer times={3}>
                        <div className={classes.product}>
                            <Skeleton variant="text" width="200px" />
                            <Skeleton variant="text" width="50px" />
                        </div>
                    </RepeaterContainer>
                </div>
            </RepeaterContainer>
        </div>
    );
};

export default MenuSkeleton;
