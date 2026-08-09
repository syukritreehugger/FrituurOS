import React, { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { createFeatureManager } from '@justeat/feature-management';
import config from '../services/config';
import useRestaurant from '../hooks/useRestaurant';
import { isProduction } from '../helpers/isProduction';
import analytics from '../services/analytics';

export type FeatureManager = ReturnType<typeof createFeatureManager> | undefined | null;

type FMSettings = Parameters<typeof createFeatureManager>[0];

const FeatureManagerContext = createContext<FeatureManager>(null);

const getFeatureManagerSettings = (restaurantId: number, country?: string): FMSettings => {
    const restrictionsProviders = new Map();

    if (country) {
        restrictionsProviders.set('Country', () => country);
    }

    return {
        keyPrefix: 'tk-liveorders', // the key prefix - usually your team / component scope
        cdn: {
            host: 'https://features.api.justeattakeaway.com',
            scope: 'tk-liveorders',
            environment: config.env !== 'production' ? 'development' : 'production',
            key: config.jetFmObfuscationKey, // obfuscation key provided with scope
            poll: false
        },
        getContext: () => {
            return {
                restrictionsProviders,
                anonUserId: restaurantId.toString()
            };
        },
        logger: {
            logError: (message) => !isProduction() && console.error(message),
            logWarn: (message) => !isProduction() && console.warn(message),
            logInfo: (message) => !isProduction() && console.log(message)
        },
        onTrack: (key: string, variantName: string) => analytics.experimentActive(key, variantName)
    };
};

export const FeatureManagerProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const restaurant = useRestaurant();
    const [featureManager, setFeatureManager] = useState<FeatureManager | undefined | null>(null);

    useEffect(() => {
        if (config.env === 'ci' || config.env === 'test') {
            setFeatureManager(undefined);
            return;
        }

        const settings = getFeatureManagerSettings(restaurant.id, restaurant.country_contact_information.code);
        const manager = createFeatureManager(settings);
        manager
            .loadFromCdn()
            .then(() => setFeatureManager(manager))
            .catch(() => setFeatureManager(undefined));
    }, [restaurant.id]);

    return <FeatureManagerContext.Provider value={featureManager}>{children}</FeatureManagerContext.Provider>;
};

export default FeatureManagerContext;
