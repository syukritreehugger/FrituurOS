export const addOverflowOnBody = (): void => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
};

export const removeOverflowFromBody = (): void => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'visible';
};
