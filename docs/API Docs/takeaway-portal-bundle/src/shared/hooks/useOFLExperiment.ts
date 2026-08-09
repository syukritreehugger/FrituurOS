import { useContext } from 'react';
import { OFL_FEATURE } from '../constants';
import FeatureManagerContext from '../contexts/FeatureManagerContext';

const useOFLExperiment = () => {
    const featureManager = useContext(FeatureManagerContext);
    const featureManagerValue = featureManager?.getBooleanValue(OFL_FEATURE) || false;
    const isWeb = typeof document !== 'undefined';

    return {
        isOFL: isWeb || featureManagerValue === true
    };
};

export default useOFLExperiment;
