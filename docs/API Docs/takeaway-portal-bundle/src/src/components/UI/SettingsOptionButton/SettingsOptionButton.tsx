import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classes from './SettingsOptionButton.module.scss';

type SettingsOptionButtonProps = {
    onClick?: () => void;
    title: string;
    description?: string;
    selected: boolean;
    dataTest?: string;
};

const SettingOptionButton: React.FC<SettingsOptionButtonProps> = (props): ReactElement => {
    const { onClick, title, description, selected, dataTest } = props;

    return (
        <div
            data-testid={dataTest}
            className={classNames(classes.buttonContainer, selected ? classes.checked : null)}
            onClick={onClick}
        >
            <div className={classes.buttonContent}>
                <div className={classes.buttonLabel}>{title}</div>
                {description && <div className={classes.buttonSubLabel}>{description}</div>}
            </div>
        </div>
    );
};

export default SettingOptionButton;
