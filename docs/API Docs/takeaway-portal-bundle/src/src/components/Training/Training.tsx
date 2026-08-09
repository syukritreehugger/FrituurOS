import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import TrainingCenter from './TrainingCenter/TrainingCenter';
import { useActiveTrainingStep, useIsTrainingActive, useTrainingReview, useTrainingActions } from '@lo/shared/store/trainings';
import Step from './Step';
import useOrders from '@lo/shared/hooks/useOrders';

const Training = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setNavigate } = useTrainingActions();
    const step = useActiveTrainingStep();
    const isActive = useIsTrainingActive();
    const isReview = useTrainingReview();
    const { data } = useOrders();

    const firstNewOrder = data?.array.find((order) => order.is_new) ?? null;
    const newOrdersExist = !!firstNewOrder;

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate, setNavigate]);

    useEffect(() => {
        if (isActive && firstNewOrder && location.pathname !== '/orders') {
            navigate('/orders');
        }
    }, [firstNewOrder?.id]);

    if (!isActive) {
        return null;
    }

    if (newOrdersExist) return null;

    return (
        <>
            {step && !isReview && <Step key={step.id} data={step} />}
            <TrainingCenter />
        </>
    );
};

export default Training;
