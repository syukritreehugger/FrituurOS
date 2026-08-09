import { MQTTCredentials } from '../types/mqttCredentialsType';
import axios from '@lo/shared/ajax/axiosSetupSMG';

export function getMQTTCredentials(tenant: string, restaurantId: string): Promise<MQTTCredentials> {
    return axios({
        url: `/applications/orderpad-app/secrets?iotcoreconfigs=true`,
        method: 'get',
        headers: {
            'X-JE-Tenant': tenant,
            'X-JE-ClientId': `lo-${restaurantId}`
        }
    }).then((response) => response.data);
}
