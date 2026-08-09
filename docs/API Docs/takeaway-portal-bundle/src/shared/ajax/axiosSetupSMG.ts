import axios from 'axios';
import config from '../services/config';
import { getAccessToken } from '@lo/shared/services/auth';

const axiosSetupSMG = axios.create({
    baseURL: config.smartGatewayApiUrl,
    headers: {
        'content-type': 'application/json'
    }
});

axiosSetupSMG.interceptors.request.use(async (axiosConfig) => {
    const token = await getAccessToken();

    if (!token) {
        const controller = new AbortController();
        controller.abort();

        return { ...axiosConfig, signal: controller.signal };
    }

    axiosConfig.headers['Authorization'] = `Bearer ${token}`;

    return axiosConfig;
});

export default axiosSetupSMG;
