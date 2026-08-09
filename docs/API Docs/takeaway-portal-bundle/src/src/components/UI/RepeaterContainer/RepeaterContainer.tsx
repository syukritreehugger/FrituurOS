import React, { ReactElement } from 'react';

type RepeaterContainerProps = {
    times: number;
    children: ReactElement;
};

const RepeaterContainer: React.FC<RepeaterContainerProps> = (props) => {
    return <>{[...Array(props.times)].map((_, index) => React.cloneElement(props.children, { key: index }))}</>;
};

export default RepeaterContainer;
