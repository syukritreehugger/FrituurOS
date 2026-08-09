import axios from '@lo/shared/ajax/axiosSetup';

export const actualizeAccountApi = async () => {
    return axios.post('/account/actualize');
};
