import React, { FC, PropsWithChildren } from 'react';
import cs from 'classnames';
import { skipTokens } from '@jet-pie/theme/variations/skip';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './TableRow.module.scss';

type TableRowProps = {
    isFetched?: boolean;
    isFetching?: boolean;
    header?: boolean;
    dataTestId?: string;
};

const TableRow: FC<PropsWithChildren<TableRowProps>> = ({
    isFetching = false,
    isFetched = true,
    header = false,
    dataTestId,
    children
}) => {
    const { isLessThanTabletWidth } = useWindowSize();

    const smallSpace = skipTokens.spacing.s02;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const paddingRight = isLessThanTabletWidth ? 0 : header ? smallSpace + scrollbarWidth : smallSpace;

    return (
        <div
            className={cs(classes.row, {
                [classes.header]: header,
                [classes.fetching]: isFetching,
                [classes.notFetched]: !isFetched
            })}
            data-testid={dataTestId}
            style={{ paddingRight }}
        >
            {children}
        </div>
    );
};

export default TableRow;
