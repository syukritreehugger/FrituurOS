import { Config } from './types';

const config: Config = {
    env: process.env.ENVIRONMENT || process.env.NODE_ENV!,
    apiUrl: process.env.API_URL ?? '',
    liveOrdersUrl: process.env.LIVE_ORDERS ?? '',
    courierAppUrl: process.env.COURIER_APP ?? '',
    socketHost: process.env.SOCKET_HOST ?? '',
    fcmVapidKey: process.env.FCM_VAPID_KEY ?? '',
    jetFmObfuscationKey: process.env.JET_FM_OBFUSCATION_KEY ?? '',
    release: process.env.RELEASE ?? 'unknown',
    smartGatewayApiUrl: process.env.SMART_GATEWAY_API ?? '',
    codePushKeyIos: '',
    codePushKeyAndroid: '',
    partnerHubUrl: {
        default: process.env.PARTNER_HUB ?? '',
        au: process.env.PARTNER_HUB_AU ?? '',
        at: process.env.PARTNER_HUB_AT ?? '',
        ch: process.env.PARTNER_HUB_CH ?? '',
        de: process.env.PARTNER_HUB_DE ?? '',
        dk: process.env.PARTNER_HUB_DK ?? '',
        es: process.env.PARTNER_HUB_ES ?? '',
        ie: process.env.PARTNER_HUB_IE ?? '',
        it: process.env.PARTNER_HUB_IT ?? '',
        nl: process.env.PARTNER_HUB_NL ?? '',
        pl: process.env.PARTNER_HUB_PL ?? '',
        sk: process.env.PARTNER_HUB_SK ?? '',
        uk: process.env.PARTNER_HUB_UK ?? ''
    },
    keycloakUrl: {
        default: process.env.KEYCLOAK_URL ?? '',
        internal: process.env.KEYCLOAK_INTERNAL_URL ?? '',
        uk: process.env.KEYCLOAK_URL_UK ?? '',
        es: process.env.KEYCLOAK_URL_ES ?? '',
        ie: process.env.KEYCLOAK_URL_IE ?? '',
        it: process.env.KEYCLOAK_URL_IT ?? '',
        au: process.env.KEYCLOAK_URL_AU ?? '',
        nz: process.env.KEYCLOAK_URL_NZ ?? ''
    },
    keycloakRedirectAppUrl: '',
    snowplowConfigUrl: process.env.SNOWPLOW_CONFIG_URL ?? ''
};

export default config;
