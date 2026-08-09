import React from 'react';
import { Chip } from '@jet-pie/react';
import { getFilterTitle } from '@lo/shared/helpers/filters/orderHistoryFilters';
import classes from './Options.module.scss';
import { OrderHistoryFilterValue } from '@lo/shared/store/orderHistory';

type OptionsProps<T> = {
    title: string;
    selected: T[];
    options: T[];
    onSelectionChanged: (selected: T[]) => void;
};

const Options = <T extends OrderHistoryFilterValue>(props: OptionsProps<T>) => {
    const { title, selected, options, onSelectionChanged } = props;

    const handleSelect = (key: T) => {
        const newSelected = selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key];
        onSelectionChanged(newSelected);
    };

    return (
        <div className={classes.container}>
            <p className={classes.title}>{title}</p>
            <div className={classes.list}>
                {options.map((option) => (
                    <Chip
                        key={option}
                        onClick={() => handleSelect(option)}
                        selected={selected.includes(option)}
                        label={getFilterTitle(option)}
                        variant="outlined"
                        data-testid={`filters-popup-${option}`}
                        className={classes.chip}
                    />
                ))}
            </div>
        </div>
    );
};

export default Options;
