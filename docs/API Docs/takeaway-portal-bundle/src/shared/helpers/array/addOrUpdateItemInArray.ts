export default <T extends Record<string, unknown>>(item: T, array: T[], compareField = 'id'): T[] => {
    const index = array.findIndex((a) => a[compareField] === item[compareField]);

    if (index === -1) {
        return [...array, item];
    }

    return array.map((existing, i) => (i === index ? item : existing));
};
