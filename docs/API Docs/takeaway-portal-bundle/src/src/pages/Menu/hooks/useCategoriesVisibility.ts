import { useEffect, useState } from 'react';

type UseCategoriesVisibilityReturnType = {
    sectionsVisibility: boolean[];
    updateSectionsVisibility: (index: number) => (value: boolean) => void;
};

export const useCategoriesVisibility = (data: any[]): UseCategoriesVisibilityReturnType => {
    const [sectionsVisibility, setSectionsVisibility] = useState<boolean[]>([]);

    useEffect(() => {
        if (data.length === 0) return;
        setSectionsVisibility(sectionsVisibility.length > 0 ? sectionsVisibility : data.map(() => false));
    }, [data]);

    const updateSectionsVisibility = (index: number) => (value: boolean) => {
        setSectionsVisibility((prevSectionVisibility) =>
            prevSectionVisibility.map((currentValue, i) => (i === index ? value : currentValue))
        );
    };

    return { sectionsVisibility, updateSectionsVisibility };
};
