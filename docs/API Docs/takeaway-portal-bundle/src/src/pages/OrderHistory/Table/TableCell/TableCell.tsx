import React, { FC, PropsWithChildren } from 'react';
import cn from 'classnames';
import CensoredText from '@lo/web/components/UI/CensoredText/CensoredText';
import classes from './TableCell.module.scss';
import { useIsChainAccount } from '@lo/shared/store/auth';

type TableCellProps = {
    align?: 'left' | 'center' | 'right';
    dataTestId?: string;
    cutLongText?: boolean;
    hideForChainAccounts?: boolean;
};

const TableCell: FC<PropsWithChildren<TableCellProps>> = ({
    align = 'left',
    dataTestId,
    cutLongText = false,
    hideForChainAccounts = false,
    children
}) => {
    const isChainAccount = useIsChainAccount();

    return (
        <div className={cn(classes.cell, classes[align])}>
            <span className={cn(classes.content, { [classes.cutLongText]: cutLongText })} data-testid={dataTestId}>
                {hideForChainAccounts && isChainAccount ? <CensoredText /> : children}
            </span>
        </div>
    );
};

export default TableCell;
