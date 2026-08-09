import Keycloak from 'keycloak-js';
import axios from 'axios';
import * as Sentry from '@sentry/browser';
import { useAuthStore } from '../../store/auth';
import { AVAILABLE_TENANTS } from '../../constants';
import { actualizeAccountApi } from '../../api/account';
import { usePinStore } from '../../store/pin';
import config from '../config';
import { saveLog } from '../../helpers/logs';
import { isProduction } from '../../helpers/isProduction';
import disableWebPushNotifications from '../../helpers/notification/disableWebPushNotifications';

function isJetEmployee() {
    return localStorage.getItem('isJetEmployee') === 'true';
}

function needToActualize() {
    return localStorage.getItem('needToActualizeAccount') === 'true';
}

export function getTenant(): string {
    if (isJetEmployee()) {
        return 'internal';
    }

    if (isProduction()) {
        return (
            Object.keys(AVAILABLE_TENANTS).find(
                (key) => AVAILABLE_TENANTS[key as keyof typeof AVAILABLE_TENANTS] === window.location.origin
            ) ?? 'default'
        );
    }

    const tenantFromUrl = new URLSearchParams(window.location.search).get('tenant');

    if (tenantFromUrl && AVAILABLE_TENANTS[tenantFromUrl as keyof typeof AVAILABLE_TENANTS]) {
        localStorage.setItem('tenant', tenantFromUrl);
        return tenantFromUrl;
    }

    return localStorage.getItem('tenant') || 'default';
}

function createKeycloakInstance() {
    const tenant = getTenant() as keyof typeof config.keycloakUrl;
    const keycloakUrl = config.keycloakUrl[tenant];
    const clientId = isJetEmployee() ? 'tkwy-employee' : 'live-orders';
    const [url, realm] = keycloakUrl.split('/realms/');

    return new Keycloak({
        url,
        realm,
        clientId
    });
}

let keycloak = createKeycloakInstance();

export async function getAssignedRestaurants(): Promise<string[]> {
    if (isJetEmployee() && keycloak.tokenParsed) return keycloak.tokenParsed.rids;
    const info = await keycloak.loadUserInfo();
    return (info as { rids: string[] }).rids;
}

export async function getSelectedRestaurantId() {
    return sessionStorage.getItem('selectedRestaurantId') || localStorage.getItem('selectedRestaurantId');
}

async function saveSelectedRestaurantId() {
    const currentSelectedId = sessionStorage.getItem('selectedRestaurantId') || localStorage.getItem('selectedRestaurantId');
    const availableIds = await getAssignedRestaurants();

    if (!currentSelectedId || !availableIds.includes(currentSelectedId)) {
        localStorage.setItem('selectedRestaurantId', availableIds[0]);
    }
}

/**
 * For Jet employees we need to pass restaurant_id & tenant to the login url
 * This is not possible with the keycloak-js library, so we need to redirect manually
 */
async function loginAsJetEmployee() {
    const isAuthenticated = await keycloak.init({ checkLoginIframe: false });

    if (isAuthenticated && keycloak.token) {
        await saveSelectedRestaurantId();
        useAuthStore.getState().actions.loginSuccess(keycloak.token);

        Sentry.addBreadcrumb({
            category: 'Auth',
            message: 'JET employee logged in'
        });

        return;
    }

    const selectedRestaurantId = localStorage.getItem('selectedRestaurantId');
    const loginUrl = await keycloak.createLoginUrl({ idpHint: 'okta' });

    window.location.href = `${loginUrl}&tenant=legacy-tkwy&restaurant_id=${selectedRestaurantId}`;
}

export async function login() {
    if (window.Cypress) {
        const token = localStorage.getItem('testToken');
        useAuthStore.getState().actions.loginSuccess(token || '');
        return;
    }

    if (isJetEmployee()) {
        return loginAsJetEmployee();
    }

    const isAuthenticated = await keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false });

    if (isAuthenticated && keycloak.token && keycloak.tokenParsed) {
        await saveSelectedRestaurantId();

        if (needToActualize()) {
            localStorage.removeItem('needToActualizeAccount');
            await actualizeAccountApi();
        }

        useAuthStore.getState().actions.loginSuccess(keycloak.token);
        saveLog('[Auth] User logged in');
        Sentry.addBreadcrumb({
            category: 'Auth',
            message: 'User logged in'
        });
    } else {
        localStorage.setItem('needToActualizeAccount', 'true');
        keycloak.login({ redirectUri: window.location.href });
    }
}

/**
 * Used for cross-login
 */
export async function loginByCode(code: string) {
    const response = await axios.post(
        `${config.keycloakUrl.internal}/protocol/openid-connect/token`,
        {
            client_id: 'tkwy-employee',
            grant_type: 'authorization_code',
            code,
            redirect_uri: window.location.origin + window.location.pathname
        },
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }
    );

    localStorage.setItem('isJetEmployee', 'true');

    keycloak = createKeycloakInstance();

    const isAuthenticated = await keycloak.init({
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        idToken: response.data.id_token,
        checkLoginIframe: false
    });

    if (isAuthenticated && keycloak.tokenParsed && keycloak.token) {
        const { rids } = keycloak.tokenParsed;

        localStorage.setItem('selectedRestaurantId', rids[0]);
        useAuthStore.getState().actions.loginSuccess(keycloak.token);
    } else {
        Sentry.captureException('Login by code failed');
        throw new Error('Login failed');
    }
}

export async function getAccessToken() {
    // For smoke tests & Cypress
    const testToken = localStorage.getItem('testToken');
    if (testToken) return testToken;

    await refreshTokenIfExpired();

    return keycloak.token;
}

let refreshTokenPromise: Promise<any> | null = null;

export async function refreshTokenIfExpired() {
    if (!keycloak.didInitialize) {
        return;
    }

    if (refreshTokenPromise) {
        return refreshTokenPromise;
    }

    try {
        if (!keycloak.isTokenExpired(30)) {
            return;
        }
    } catch (error) {
        Sentry.addBreadcrumb({
            category: 'Auth',
            message: 'Token expired check failed',
            data: error as Record<string, any>
        });

        keycloak.clearToken();
        keycloak.login({ redirectUri: window.location.href });
    }

    refreshTokenPromise = (async function () {
        try {
            await keycloak.updateToken(30);
            refreshTokenPromise = null;

            Sentry.addBreadcrumb({
                category: 'Auth',
                message: 'Token refreshed successfully'
            });
        } catch (error) {
            Sentry.addBreadcrumb({
                category: 'Auth',
                message: 'Token refresh failed',
                data: error as Record<string, any>
            });

            keycloak.clearToken();
            keycloak.login({ redirectUri: window.location.href });
        }
    })();

    return refreshTokenPromise;
}

export async function logout(reason?: string) {
    useAuthStore.getState().actions.logoutStarted();

    await Promise.allSettled([
        disableWebPushNotifications(),
        saveLog('[Auth] User logged out', { reason }),
        usePinStore.getState().actions.setToken(null)
    ]);

    ['isJetEmployee', 'selectedRestaurantId'].forEach((key) => localStorage.removeItem(key));

    keycloak.logout();
}
