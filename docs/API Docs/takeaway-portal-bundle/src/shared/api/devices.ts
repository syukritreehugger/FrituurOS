import axios from '@lo/shared/ajax/axiosSetup';

export function saveDeviceApi(data: { token: string; os: 'ios' | 'android' | 'sunmi' | 'web' }) {
    return axios({
        url: '/devices/create',
        method: 'post',
        data
    });
}

export function removeDeviceApi(token: string) {
    return axios({
        url: `/devices/${token}`,
        method: 'delete'
    });
}
