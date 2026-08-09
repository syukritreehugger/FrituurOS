import React, { FC } from 'react';
import classes from './NoOrders.module.scss';

type NoOrdersProps = {
    title: string;
    description: string;
    imageSrc: string;
};

const NoOrders: FC<NoOrdersProps> = (props) => {
    return (
        <div className={classes.container} data-testid="no-orders">
            <img src={props.imageSrc} width={150} height={150} className={classes.image} />
            <div className={classes.title}>{props.title}</div>
            <div className={classes.description}>
                {props.description.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
    );
};

export default NoOrders;
