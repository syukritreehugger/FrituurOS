import useRestaurant from '@lo/shared/hooks/useRestaurant';
import useUpdateSetting from '@lo/shared/hooks/useUpdateSetting';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const useProductIdLengthInput = (): [number | undefined, ChangeEventHandler<HTMLInputElement>] => {
    const initialValue = useRestaurant().receipt_settings.product_id_length;
    const updateSetting = useUpdateSetting('receipt', 'product_id_length');
    const [inputProductIdValue, setInputProductIdValue] = useState<number | undefined>(initialValue || undefined);

    const debounced = useDebouncedCallback((value) => {
        updateSetting.mutate(value);
    }, 1500);

    const handleProductIdLengthChange = (e) => {
        const value = e.target.value;

        if (value >= 0 && value <= 100) {
            setInputProductIdValue(value);
            debounced(value);
        }
    };

    useEffect(() => {
        return debounced.flush;
    }, []);

    return [inputProductIdValue, handleProductIdLengthChange];
};

export default useProductIdLengthInput;
