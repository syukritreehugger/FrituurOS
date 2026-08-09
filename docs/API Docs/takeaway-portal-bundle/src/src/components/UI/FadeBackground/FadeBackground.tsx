import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classes from './FadeBackground.module.scss';

type FadeBackgroundProps = {
    isVisible: boolean;
    blur?: boolean;
    onClickBackground?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const FadeBackground: React.FC<FadeBackgroundProps> = (props: FadeBackgroundProps): ReactElement => {
    const { isVisible, onClickBackground, blur = false } = props;
    return (
        <div
            data-testid="fade-background"
            className={classNames(classes.container, { [classes.visible]: isVisible, [classes.blur]: blur })}
            onClick={onClickBackground}
        />
    );
};

export default FadeBackground;
