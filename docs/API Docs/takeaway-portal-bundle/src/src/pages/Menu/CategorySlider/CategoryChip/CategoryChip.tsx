import { Chip } from '@jet-pie/react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useIntersection } from '@lo/web/hooks/useIntersection';
import classes from './CategoryChip.module.scss';

type CategoryChipProps = {
    label: string;
    selected?: boolean;
    disabled?: boolean;
    dataTestId: string;
    onClick?: () => void;
    onVisibilityChange: (isVisible: boolean) => void;
};

const CategoryChip = forwardRef<number | undefined, CategoryChipProps>((props, ref) => {
    const { label, selected = false, disabled = false, dataTestId, onClick, onVisibilityChange } = props;
    const chipRef = useRef<HTMLDivElement | null>(null);
    const isVisible = useIntersection(chipRef.current);
    useImperativeHandle(ref, () => chipRef.current?.offsetLeft, []);

    useEffect(() => {
        onVisibilityChange(isVisible);
    }, [isVisible]);

    const handleClick = () => {
        onClick && onClick();
    };

    return (
        <div ref={chipRef} className={classes.chipContainer}>
            <Chip
                selected={selected}
                disabled={disabled}
                label={label}
                variant="primary"
                onClick={handleClick}
                data-testid={dataTestId}
            />
        </div>
    );
});

CategoryChip.displayName = 'CategoryChip';

export default CategoryChip;
