import { isEqual } from 'date-fns';

export function differenceInObjects<ObjectType extends object>(
    objectA: ObjectType,
    objectB: ObjectType,
    prefix?: string
): string[] {
    if (!objectA && !objectB) return [];
    const changedFields: string[] = [];

    const keysA = Object.keys(objectA);
    const keysB = Object.keys(objectB);

    if (keysA.length !== keysB.length) return [];

    keysA.forEach((key) => {
        const fieldA = (objectA as Record<string, any>)[key];
        const fieldB = (objectB as Record<string, any>)[key];

        if (!fieldA || !fieldB) return [];

        if (fieldA instanceof Date && fieldB instanceof Date && !isEqual(fieldA, fieldB)) {
            changedFields.push(key);
        } else if (Array.isArray(fieldA) && Array.isArray(fieldB)) {
            if (fieldA.length !== fieldB.length) {
                changedFields.push(key);
            } else {
                Object.keys(fieldA).forEach((index) => {
                    const i = Number(index);
                    if (typeof fieldA[i] === 'object' && typeof fieldB[i] === 'object') {
                        changedFields.push(...differenceInObjects(fieldA[i], fieldB[i], `${key}.${index}`));
                    } else if (fieldA[i] !== fieldB[i]) {
                        changedFields.push(`${key}.${index}`);
                    }
                });
            }
        } else if (typeof fieldA === 'object' && typeof fieldB === 'object' && fieldA && fieldB) {
            changedFields.push(...differenceInObjects(fieldA as Record<string, unknown>, fieldB as Record<string, unknown>, key));
        } else if (fieldA !== fieldB) {
            changedFields.push(key);
        }
    });

    return prefix ? changedFields.map((item) => prefix + '.' + item) : changedFields;
}
