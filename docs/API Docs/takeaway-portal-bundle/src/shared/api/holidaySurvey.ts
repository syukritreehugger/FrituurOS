import axios from '@lo/shared/ajax/axiosSetupSMG';
import { HolidaySurveyResponse, HolidaySurveyType } from '../types/holidaySurveyType';

export function getHolidaySurveysQuery(tenant: string, restaurantId: string): Promise<HolidaySurveyType[]> {
    return axios({
        url: `/partners/${tenant}/${restaurantId}/holiday-surveys`,
        method: 'get'
    }).then((response) => response.data.holidaySurveys);
}

export function postHolidaySurveyResponse(
    tenant: string,
    restaurantId: string,
    holidaySurveyId: string,
    restaurantResponse: HolidaySurveyResponse['restaurantResponse']
) {
    return axios({
        url: `/partners/${tenant}/${restaurantId}/holiday-surveys/${holidaySurveyId}/response`,
        method: 'post',
        data: {
            partnerResponse: restaurantResponse
        }
    });
}
