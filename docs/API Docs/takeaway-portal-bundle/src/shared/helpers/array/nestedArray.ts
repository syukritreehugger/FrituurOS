export function getField<Type, Key extends keyof Type>(object: Type, field: string): Key | Date | number | void {
    if (object) {
        const [head, ...rest] = field.split('.');
        const obj = object as Record<string, any>;
        return !rest.length ? obj[head] : getField(obj[head], rest.join('.'));
    }
}

export function setField<EntityType, ValueType>(object: EntityType, field: string, newValue: ValueType): void {
    const [head, ...rest] = field.split('.');
    const obj = object as Record<string, any>;

    !rest.length ? (obj[head] = newValue) : setField(obj[head], rest.join('.'), newValue);
}
