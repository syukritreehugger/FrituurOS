import { useQuery } from '@tanstack/react-query';
import { getHolidaySurveysQuery } from '../api/holidaySurvey';
import useRestaurant from './useRestaurant';
import { useState } from 'react';

const useHolidaySurvey = () => {
    const restaurant = useRestaurant();
    const [activeSurveyIndex, setActiveSurveyIndex] = useState<number>(0);

    const loadNextSurvey = () => setActiveSurveyIndex(activeSurveyIndex + 1);

    const { data: holidaySurveys } = useQuery({
        queryKey: ['holidaySurvey'],
        queryFn: () => getHolidaySurveysQuery(restaurant.country_contact_information.code, restaurant.reference),
        select: (data) => data,
        staleTime: 1000 * 60 * 60 * 12
    });

    return { data: holidaySurveys?.[activeSurveyIndex], loadNextSurvey };
};

export default useHolidaySurvey;
