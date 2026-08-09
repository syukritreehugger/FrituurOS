import axios from 'axios';
import config from '../services/config';
import { usePinStore } from '../store/pin';
import { getPlatformHeaders } from './platformHeaders';
import { getAccessToken, getTenant, getSelectedRestaurantId } from '@lo/shared/services/auth';

const axiosSetup = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Content-Type': 'application/json'
    }
});

axiosSetup.interceptors.request.use(async (axiosConfig) => {
    const token = await getAccessToken();
    const selectedRestaurantId = await getSelectedRestaurantId();
    const tenant = getTenant();
    const pinToken = usePinStore.getState().token;

    if (!token) {
        const controller = new AbortController();
        controller.abort();

        return { ...axiosConfig, signal: controller.signal };
    }

    axiosConfig.headers['Authorization'] = `Bearer ${token}`;

    if (pinToken) {
        axiosConfig.headers['X-pin-token'] = pinToken;
    }

    if (selectedRestaurantId) {
        axiosConfig.headers['X-Restaurant-Id'] = selectedRestaurantId;
    }

    if (tenant && tenant !== 'default' && tenant !== 'internal') {
        axiosConfig.headers['X-Tenant'] = tenant;
    }

    const platformHeaders = await getPlatformHeaders();

    Object.entries(platformHeaders).forEach(([key, value]) => {
        axiosConfig.headers[key] = value;
    });

    return axiosConfig;
});

export default axiosSetup;
