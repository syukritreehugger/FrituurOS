import React from 'react';
import classes from './Total.module.scss';
import classNames from 'classnames';

type TotalItemProps = {
    title: string;
    value: string;
    currency: string;
    bold?: boolean;
    dataTestId?: string;
};

const TotalItem: React.FC<TotalItemProps> = (props) => {
    const { title, value, currency, bold = false, dataTestId } = props;

    return (
        <div className={classNames(classes.item, { [classes.bold]: bold })}>
            <p>{title}</p>
            <p className={classes.value} data-testid={dataTestId}>
                {currency} {value}
            </p>
        </div>
    );
};

export default TotalItem;
