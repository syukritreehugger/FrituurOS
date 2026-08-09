import React, { FC } from 'react';

type TotalTableProps = {
    title: string;
    value: string;
    dataTestId?: string;
};

const TotalTable: FC<TotalTableProps> = ({ title, value, dataTestId }) => {
    return (
        <table style={{ width: '100%' }} data-testid={dataTestId}>
            <tbody>
                <tr>
                    <td style={{ textAlign: 'left' }}>{title}</td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{value}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default TotalTable;
