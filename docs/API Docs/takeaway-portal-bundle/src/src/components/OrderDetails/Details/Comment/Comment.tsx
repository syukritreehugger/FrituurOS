import React, { ReactElement } from 'react';
import classes from './Comment.module.scss';
import classNames from 'classnames';

type CommentProps = {
    message?: string | null;
    testID?: string;
    icon?: ReactElement;
    variant?: 'default' | 'chat' | 'error' | 'ghost';
};

const Comment: React.FC<CommentProps> = (props) => {
    const { message, icon, variant = 'default', testID } = props;

    if (!message || message.length === 0) return null;
    return (
        <div className={classNames(classes.comment, classes[variant])}>
            {icon && <div className={classes.icon}>{icon}</div>}
            <p className={classes.text} data-testid={testID}>
                {message}
            </p>
        </div>
    );
};

export default Comment;
