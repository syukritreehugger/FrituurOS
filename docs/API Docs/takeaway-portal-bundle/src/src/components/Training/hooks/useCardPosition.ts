import { useCallback, useEffect, useState } from 'react';
import { computePosition, flip, offset, shift } from '@floating-ui/react-dom';
import { useWindowSize } from '../../../hooks/useWindowSize';

type UseCardPosition = (
    cardRef: React.MutableRefObject<HTMLDivElement | null>,
    element?: Element | null
) => {
    cardPosition?: {
        top: number | string;
        left: number | string;
        transform?: string;
    };
};

const useCardPosition: UseCardPosition = (cardRef, element) => {
    const [cardPosition, setCardPosition] = useState<{ top: number; left: number } | undefined>(undefined);
    const { isLessThanTabletWidth } = useWindowSize();

    const computeCardPosition = useCallback(() => {
        if (!element || !cardRef.current) {
            setCardPosition(undefined);
            return;
        }

        computePosition(element, cardRef.current, {
            placement: isLessThanTabletWidth ? 'top' : 'bottom',
            middleware: [offset(48), flip(), shift({ padding: 24 })]
        }).then((position) => {
            setCardPosition({ top: position.y, left: position.x });
        });
    }, [element, cardRef, isLessThanTabletWidth]);

    useEffect(() => {
        if (!element) {
            setCardPosition(undefined);
            return;
        }

        computeCardPosition();
    }, [element, computeCardPosition]);

    if (!cardPosition) return { cardPosition: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } };
    return { cardPosition };
};

export default useCardPosition;
