import React, { useState } from 'react';
import { Button, Modal } from '@jet-pie/react';
import classes from './HolidaySurvey.module.scss';
import { Close } from '@jet-pie/react/esm/icons';
import { HolidaySurveyResponse, HolidaySurveyType } from '@lo/shared/types/holidaySurveyType';
import useHolidaySurveyResponse from '@lo/shared/hooks/useHolidaySurveyResponse';
import holidaySurveyClosedImg from '../../static/images/holiday-survey-closed.png';
import holidaySurveyOpenImg from '../../static/images/holiday-survey-open.png';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

type HolidaySurveyProps = {
    holidaySurvey: HolidaySurveyType;
    loadNextSurvey: () => void;
};

const HolidaySurvey: React.FC<HolidaySurveyProps> = ({ holidaySurvey, loadNextSurvey }) => {
    const { t } = useTranslation();
    const restaurant = useRestaurant();

    const [responded, setResponded] = useState<boolean>(false);
    const [response, setResponse] = useState<HolidaySurveyResponse['restaurantResponse']>('noanswer');

    const { mutate: respondHolidaySurvey } = useHolidaySurveyResponse();
    const holidayDate = format(new Date(holidaySurvey.holidayDate), 'E dd MMM');

    const selectedLanguage = localStorage.getItem('lang') || 'en';

    const getHolidayNameTranslation = () => {
        return (
            holidaySurvey.translations.find((translation) => translation.language === selectedLanguage)?.holidayName ||
            holidaySurvey.translations[0].holidayName
        );
    };

    const onClosedClick = () => {
        setResponded(true);
        setResponse('yes');
    };

    const onOpenendClick = () => {
        setResponded(true);
        setResponse('no');
    };

    const onIgnoredClick = () => {
        setResponse('noanswer');
        respond();
    };

    const respond = () => {
        const responseData: HolidaySurveyResponse = {
            tenant: restaurant.country_contact_information.code,
            restaurantId: restaurant.reference,
            holidaySurveyId: holidaySurvey.surveyId,
            restaurantResponse: response
        };

        respondHolidaySurvey(responseData);
        loadNextSurvey();
        setResponded(false);
        setResponse('noanswer');
    };

    const Header = () => {
        return (
            <div className={classes.headerText}>
                {!responded ? (
                    <span data-testid="holiday-survey-holidayName">
                        {t('orders.live_orders_holiday_survey.survey_popup.closed_on')} {getHolidayNameTranslation()}?
                    </span>
                ) : (
                    <span data-testid="holiday-survey-thanks">
                        {t('orders.live_orders_holiday_survey.survey_popup.thanks_for_update')}
                    </span>
                )}
            </div>
        );
    };

    const Content = () => {
        return (
            <>
                {!responded ? (
                    <>
                        <span>
                            {t('orders.live_orders_holiday_survey.survey_popup.content_text_with_name', {
                                holidaydate: holidayDate,
                                holidayname: getHolidayNameTranslation()
                            })}
                            {'?'}
                        </span>
                    </>
                ) : (
                    <>
                        {response === 'yes' && (
                            <>
                                <div className={classes.imgResponse}>
                                    <img src={holidaySurveyClosedImg} />
                                </div>
                                <span>{t('orders.live_orders_holiday_survey.survey_popup.content_closed')} </span>
                            </>
                        )}
                        {response === 'no' && (
                            <>
                                <div className={classes.imgResponse}>
                                    <img src={holidaySurveyOpenImg} />
                                </div>
                                <span>{t('orders.live_orders_holiday_survey.survey_popup.content_open')} </span>
                            </>
                        )}
                        <span>{holidayDate}</span>
                    </>
                )}
            </>
        );
    };

    const Buttons = () => {
        return (
            <div className={classes.buttonContainer}>
                {!responded ? (
                    <>
                        <Button size="medium" variant="secondary" onClick={onClosedClick} data-testid="holiday-survey-yes-closed">
                            {t('orders.live_orders_holiday_survey.survey_popup.yes_closed')}
                        </Button>
                        <Button size="medium" variant="secondary" onClick={onOpenendClick} data-testid="holiday-survey-no-open">
                            {t('orders.live_orders_holiday_survey.survey_popup.no_open')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button size="medium" onClick={respond} data-testid="holiday-survey-done">
                            {t('orders.live_orders_holiday_survey.survey_popup.done')}
                        </Button>
                        <Button
                            size="medium"
                            variant="secondary"
                            onClick={() => setResponded(false)}
                            data-testid="holiday-survey-change-response"
                        >
                            {t('orders.live_orders_holiday_survey.survey_popup.change_response')}
                        </Button>
                    </>
                )}
            </div>
        );
    };

    return (
        <Modal isOpen={true} onClose={respond} size="medium" shouldCloseOnOverlayClick={false}>
            <div className={classes.header}>
                <div className={classes.headerTitleContainer}>
                    <Header />
                </div>
                <Close height={21} width={21} onClick={onIgnoredClick} />
            </div>
            <div className={classes.content}>
                <Content />
            </div>
            <Buttons />
        </Modal>
    );
};

export default HolidaySurvey;
