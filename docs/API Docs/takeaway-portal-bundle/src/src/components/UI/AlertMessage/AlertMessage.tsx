import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classes from './AlertMessage.module.scss';
import AlertCircleFilled from '@jet-pie/react/esm/icons/AlertCircleFilled';
import AlertTriangle from '@jet-pie/react/esm/icons/AlertTriangle';
import CheckCircle from '@jet-pie/react/esm/icons/CheckCircle';
import InfoCircleFilled from '@jet-pie/react/esm/icons/InfoCircleFilled';
import { colors } from '../../../common/js/colorTokens';

export type AlertMessageProps = {
    type?: 'success' | 'info' | 'warning' | 'error';
    noRounding?: boolean;
    iconSize?: number;
    message: string;
    testID?: string;
};

const _iconSize = {
    width: 14,
    height: 14
};

const icons: {
    [key in Exclude<AlertMessageProps['type'], undefined>]: (size: { width: number; height: number }) => ReactElement;
} = {
    info: (size) => <InfoCircleFilled {...size} fill={colors.alias.contentSubdued} />,
    success: (size) => <CheckCircle {...size} fill={colors.alias.supportPositive} />,
    warning: (size) => <AlertTriangle {...size} fill={colors.alias.supportWarning} />,
    error: (size) => <AlertCircleFilled {...size} fill={colors.alias.supportError} />
};

const AlertMessage: React.FC<AlertMessageProps> = (props) => {
    const { type = 'info', message, testID, noRounding = false, iconSize } = props;
    const sizeProps = { width: iconSize ?? _iconSize.width, height: iconSize ?? _iconSize.height };

    return (
        <div
            className={classNames(classes.container, classes[type], {
                [classes.noRounding]: noRounding
            })}
            data-testid={testID}
        >
            {icons[type](sizeProps)}
            <p className={classNames(classes.message, classes[type])}>{message}</p>
        </div>
    );
};

export default AlertMessage;
