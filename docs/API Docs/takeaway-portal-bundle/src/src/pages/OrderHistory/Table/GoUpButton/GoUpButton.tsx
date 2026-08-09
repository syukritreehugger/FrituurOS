import React, { FC } from 'react';
import cn from 'classnames';
import { ChevronUp } from '@jet-pie/react/esm/icons';
import { IconButton } from '@jet-pie/react';
import classes from './GoUpButton.module.scss';

type GoUpButton = {
    visible: boolean;
    onClick: () => void;
};

const GoUpButton: FC<GoUpButton> = ({ visible, onClick }) => {
    return (
        <IconButton
            className={cn(classes.button, { [classes.visible]: visible })}
            variant="primary"
            size="small"
            icon={<ChevronUp />}
            onClick={onClick}
        />
    );
};

export default GoUpButton;
