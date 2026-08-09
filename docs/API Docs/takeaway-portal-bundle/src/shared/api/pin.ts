import axios from '@lo/shared/ajax/axiosSetup';
import { AxiosPromise } from 'axios';

export type PinApiResponse = {
    success: boolean;
    reason?: string;
    token?: string;
};

export function enablePinApi(pin: string): AxiosPromise<PinApiResponse> {
    return axios({
        url: `/restaurant/pin-code/enable`,
        method: 'POST',
        data: { pin }
    });
}

export function disablePinApi(pin: string): AxiosPromise<PinApiResponse> {
    return axios({
        url: `/restaurant/pin-code/disable`,
        method: 'POST',
        data: { pin }
    });
}

export function updatePinApi(oldPin: string, newPin: string): AxiosPromise<PinApiResponse> {
    return axios({
        url: `/restaurant/pin-code/update`,
        method: 'POST',
        data: {
            old_pin: oldPin,
            new_pin: newPin
        }
    });
}

export function checkPinApi(pin: string, dontAskAgain: boolean): AxiosPromise<PinApiResponse> {
    return axios({
        url: `/restaurant/pin-code/check`,
        method: 'POST',
        data: {
            pin: pin,
            dont_ask_again: dontAskAgain
        }
    });
}
