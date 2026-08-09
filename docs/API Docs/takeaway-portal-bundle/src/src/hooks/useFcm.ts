import { useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { isProduction } from '@lo/shared/helpers/isProduction';
import creds from '../firebase.json';
import { saveDeviceApi } from '@lo/shared/api/devices';
import config from '@lo/shared/services/config';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

const useFcm = (): void => {
    const restaurant = useRestaurant();

    const getPermissionIsGranted = async (): Promise<boolean> => {
        try {
            let permission = Notification.permission;

            if (Notification.permission === 'default') {
                permission = await Notification.requestPermission();
            }

            return permission === 'granted';
        } catch (error) {
            return false;
        }
    };

    const registerDeviceForFcm = async () => {
        const messagingIsSupported = await isSupported();
        if (!messagingIsSupported) return;

        const permissionIsGranted = await getPermissionIsGranted();
        if (!permissionIsGranted) return;

        try {
            const registration = await navigator.serviceWorker.register(isProduction() ? '/sw.js' : '/sw-dev.js');
            const firebaseApp = initializeApp(isProduction() ? creds.production : creds.development);
            const messaging = getMessaging(firebaseApp);

            const token = await getToken(messaging, {
                vapidKey: config.fcmVapidKey,
                serviceWorkerRegistration: registration
            });

            const tokenInStorage = localStorage.getItem('fcmToken');

            if (tokenInStorage !== token) {
                localStorage.setItem('fcmToken', token);
                saveDeviceApi({ token, os: 'web' });
            }
        } catch (error) {}
    };

    useEffect(() => {
        // Disabling firebase for development env.
        // It doesn't work with .local domain and creates a lot of errors in console
        if (config.env === 'development' || config.env === 'ci' || !('serviceWorker' in navigator) || !restaurant) return;

        registerDeviceForFcm();
    }, [restaurant.id]);
};

export default useFcm;
