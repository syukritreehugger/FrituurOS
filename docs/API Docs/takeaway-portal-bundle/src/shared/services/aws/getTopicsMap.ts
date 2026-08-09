import { mqtt } from 'aws-iot-device-sdk-v2';
import queryClient from '../query/queryClient';
import { HolidaySurveyType } from '../../types/holidaySurveyType';
import addOrUpdateItemInArray from '../../helpers/array/addOrUpdateItemInArray';
import { RestaurantModel } from '../../models';
import { TextDecoder } from 'text-decoding';

type mqttTopic = [string, mqtt.QoS, (topic: any, payload: any) => void];

const getSurveyDataFromPayload = (payload: ArrayBuffer) => {
    const decoder = new TextDecoder('utf8');
    const holidaySurveyString = decoder.decode(new Uint8Array(payload));
    const holidaySurveyJson = JSON.parse(holidaySurveyString);
    return JSON.parse(holidaySurveyJson.Data);
};

export default (restaurant: RestaurantModel): mqttTopic[] => {
    return [
        [
            `partners/${restaurant.country_contact_information.code}/holidaysurveys`,
            mqtt.QoS.AtLeastOnce,
            (topic, payload) => {
                queryClient.setQueryData<HolidaySurveyType[]>(['holidaySurvey'], (holidaySurveys) => {
                    return (
                        holidaySurveys &&
                        addOrUpdateItemInArray(getSurveyDataFromPayload(payload), [...holidaySurveys], 'surveyId')
                    );
                });
            }
        ],
        [
            `partners/${restaurant.country_contact_information.code}-${restaurant.reference}/holidaysurveys`,
            mqtt.QoS.AtLeastOnce,
            (topic, payload) => {
                queryClient.setQueryData<HolidaySurveyType[]>(['holidaySurvey'], (holidaySurveys) => {
                    return (
                        holidaySurveys &&
                        addOrUpdateItemInArray(getSurveyDataFromPayload(payload), [...holidaySurveys], 'surveyId')
                    );
                });
            }
        ],
        [
            `liveorders/${restaurant.reference}/debug`,
            mqtt.QoS.AtLeastOnce,
            () => {
                // Debug topic, no action needed
            }
        ]
    ];
};
