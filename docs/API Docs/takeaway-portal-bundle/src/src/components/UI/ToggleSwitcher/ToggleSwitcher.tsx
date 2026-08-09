import React from 'react';
import classNames from 'classnames';
import classes from './ToggleSwitcher.module.scss';

type ToggleSwitcherProps = {
    isSwitcherOn: boolean;
    toggleSwitcher: (event: React.MouseEvent<HTMLDivElement>) => void;
    dataTestId?: string;
    loading?: boolean;
    disabled?: boolean;
};

const ToggleSwitcher: React.FC<ToggleSwitcherProps> = (props) => {
    const { isSwitcherOn, toggleSwitcher, dataTestId, loading, disabled = false } = props;

    return (
        <div
            data-testid={dataTestId}
            className={classNames(
                classes.switcher,
                isSwitcherOn ? classes.on : classes.off,
                loading && classes.disabled,
                disabled && classes.disabledForClicking
            )}
            onClick={toggleSwitcher}
        >
            <div className={classNames(classes.switcherIndicator, isSwitcherOn ? classes.on : classes.off)}>
                {loading && <div className={classNames(classes.spinner, isSwitcherOn ? classes.on : classes.off)} />}
                {isSwitcherOn && <div className={classNames(disabled ? classes.doneIconDisabled : classes.doneIcon)} />}
            </div>
        </div>
    );
};

export default ToggleSwitcher;
