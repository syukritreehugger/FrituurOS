import { Menu } from '@lo/shared/types/menuType';
import { useEffect } from 'react';
import { useOneMenuMapper } from '@lo/shared/hooks/useOneMenuMapper';
import { useNavigate } from 'react-router';
import { useOneMenu } from '@lo/shared/hooks/useOneMenu';
import usePinProtection from '@lo/shared/hooks/usePinProtection';

type UseMenuDataReturnType = {
    menu: Menu | undefined;
    isLoading: boolean;
};

export const useMenuData = (): UseMenuDataReturnType => {
    const navigate = useNavigate();
    const menu = useOneMenu();
    const { data: oneMenuMappedData } = useOneMenuMapper(menu.data);

    const { pinIsChecked, checkPin } = usePinProtection(() => navigate('/orders'));

    useEffect(() => {
        if (!pinIsChecked) {
            checkPin();
        }
    }, [pinIsChecked]);

    return {
        menu: oneMenuMappedData,
        isLoading: (menu.isFetching && !menu.isFetched) || !pinIsChecked
    };
};
