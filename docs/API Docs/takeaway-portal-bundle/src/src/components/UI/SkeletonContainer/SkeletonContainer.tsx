import { Skeleton } from '@jet-pie/react';
import { SkeletonBaseProps, SkeletonVariant } from '@jet-pie/react/esm/components/Skeleton/types';
import React, { FC, PropsWithChildren } from 'react';

type SkeletonContainerProps = {
    isLoading: boolean;
    variant?: SkeletonVariant;
} & SkeletonBaseProps;

const SkeletonContainer: FC<PropsWithChildren<SkeletonContainerProps>> = ({
    isLoading,
    variant = 'box',
    children,
    ...skeletonProps
}) => {
    return isLoading ? <Skeleton variant={variant} {...skeletonProps} /> : <>{children}</>;
};

export default SkeletonContainer;
