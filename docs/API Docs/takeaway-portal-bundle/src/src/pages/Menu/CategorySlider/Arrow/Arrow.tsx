import React from 'react';
import classNames from 'classnames';
import classes from './Arrow.module.scss';
import ChevronLeftSmall from '@jet-pie/react/esm/icons/ChevronLeft';
import ChevronRightSmall from '@jet-pie/react/esm/icons/ChevronRight';

type ArrowProps = {
    direction: 'left' | 'right';
    onClick: () => void;
};

const Arrow: React.FC<ArrowProps> = (props) => {
    const { direction, onClick } = props;
    const icon =
        direction === 'left' ? <ChevronLeftSmall height={20} width={20} /> : <ChevronRightSmall height={20} width={20} />;

    return (
        <button className={classNames(classes.arrowButton, classes[direction])} onClick={onClick}>
            {icon}
        </button>
    );
};
export default Arrow;
