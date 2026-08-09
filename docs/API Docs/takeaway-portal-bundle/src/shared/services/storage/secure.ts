/*
 * We can safely use the async storage library on the web.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorageKey } from './';

const setItem = async (key: SecureStorageKey, value: string) => {
    await AsyncStorage.setItem(key, value);
};

const getItem = async (key: SecureStorageKey) => {
    return AsyncStorage.getItem(key);
};

const removeItem = async (key: SecureStorageKey) => {
    await AsyncStorage.removeItem(key);
};

const multiRemove = async (keys: SecureStorageKey[]) => {
    return AsyncStorage.multiRemove(keys);
};

export default { setItem, getItem, removeItem, multiRemove };
