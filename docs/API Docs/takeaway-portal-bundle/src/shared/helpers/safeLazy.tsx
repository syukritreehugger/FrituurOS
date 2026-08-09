import React, { lazy } from 'react';
import retryOnFailure from './retryOnFailure';

export default function safeLazy<T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    fallbackComponent: React.ReactNode = <div>An error has occurred</div>
): React.LazyExoticComponent<T> {
    return lazy(() =>
        retryOnFailure(factory).catch(() => {
            return {
                default: (() => fallbackComponent) as unknown as T
            };
        })
    );
}
