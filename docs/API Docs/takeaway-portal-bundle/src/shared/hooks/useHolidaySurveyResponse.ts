import { DefaultError, useMutation } from '@tanstack/react-query';
import { postHolidaySurveyResponse } from '../api/holidaySurvey';
import { HolidaySurveyResponse } from '../types/holidaySurveyType';
import { showInfoToast } from '../services/toaster';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation();

    return useMutation<any, DefaultError, HolidaySurveyResponse>({
        mutationFn: (data) =>
            postHolidaySurveyResponse(data.tenant, data.restaurantId, data.holidaySurveyId, data.restaurantResponse),
        onSuccess: () => {
            showInfoToast(t('orders.live_orders_holiday_survey.survey_popup.holiday_status_toast'));
        }
    });
};
