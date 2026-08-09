import { useEffect, useState } from 'react';
import { addOverflowOnBody, removeOverflowFromBody } from '@lo/shared/helpers/overflowBody';

export const useOverflowElement = (): [boolean, (value?: boolean) => void] => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            addOverflowOnBody();
        } else {
            removeOverflowFromBody();
        }
    }, [isOpen]);

    const toggleElement = (value?: boolean) => setIsOpen(value !== undefined ? value : !isOpen);

    return [isOpen, toggleElement];
};
