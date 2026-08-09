import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import classes from './SettingsBlock.module.scss';

type SettingsBlockProps = {
    title: string;
    isLast?: true;
};

const SettingsBlock: React.FC<PropsWithChildren<SettingsBlockProps>> = ({ title, isLast, children }) => {
    return (
        <div className={classNames(classes.container, { [classes.last]: isLast })}>
            <div className={classes.title}>{title}</div>
            <div className={classes.settings}>{children}</div>
        </div>
    );
};

export default SettingsBlock;
