import { useContext } from 'react';
import FeatureManagerContext from '../contexts/FeatureManagerContext';
import { OrderModel } from '../models';

const usePhoneMasking = (order?: OrderModel) => {
    const featureManager = useContext(FeatureManagerContext);
    const featureFlagEnabled = featureManager?.getBooleanValue('at3178-enable-phone-masking') || false;

    const customer = order?.customer;
    const hasMaskingCode = !!customer?.phone_masking_code;
    const hasDisplayPhone = !!customer?.display_phone_number;

    const shouldUseMaskedPhone = featureFlagEnabled && (hasMaskingCode || hasDisplayPhone);

    const visiblePhoneNumber = shouldUseMaskedPhone ? customer?.display_phone_number : customer?.phone_number;

    return {
        phoneMaskingEnabled: featureFlagEnabled,
        visiblePhoneNumber,
        phoneMaskingCode: featureFlagEnabled && hasMaskingCode ? customer?.phone_masking_code : undefined
    };
};

export default usePhoneMasking;
