import React from 'react';
import classes from './PopupToggle.module.scss';
import classNames from 'classnames';

type PopupSwitcherProps = {
    testID: string;
    isActive: boolean;
    title: string;
    onClick?: () => void;
};

const PopupToggle: React.FC<PopupSwitcherProps> = (props) => {
    const { isActive, title, onClick, testID } = props;

    return (
        <div className={classes.popupSwitcherContainer} onClick={onClick} data-testid={testID}>
            <p
                className={classNames(classes.toggleTitle, {
                    [classes.active]: isActive,
                    [classes.paused]: !isActive
                })}
            >
                {title}
            </p>
            <div className={classes.iconArrow} />
        </div>
    );
};

export default PopupToggle;
