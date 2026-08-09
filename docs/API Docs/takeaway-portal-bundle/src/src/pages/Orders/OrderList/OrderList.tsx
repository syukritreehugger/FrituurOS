import React, { useState, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@jet-pie/react';
import { Check, InfoCircle, PickUp, PrepareBag } from '@jet-pie/react/esm/icons';
import useOrders from '@lo/shared/hooks/useOrders';
import useTrainingControl from '@lo/shared/hooks/useTrainingControl';
import classes from './OrderList.module.scss';
import RepeaterContainer from '@lo/web/components/UI/RepeaterContainer/RepeaterContainer';
import OrderItemSkeleton from '../OrderItemSkeleton/OrderItemSkeleton';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import PrepareTab from './PrepareTab/PrepareTab';
import DoneTab from './DoneTab/DoneTab';
import HandoverTab from './HandoverTab/HandoverTab';
import analytics from '@lo/shared/services/analytics';
import { trainingElements } from '@lo/shared/types/trainings';

const OrderList: FC = () => {
    const restaurant = useRestaurant();
    const { isFetching } = useOrders();
    const { t } = useTranslation();
    const { isLessThanDesktopWidth } = useWindowSize();
    const [tab, setTab] = useState<'prepare' | 'handover' | 'done'>('prepare');

    useTrainingControl('prepareTab', { select: () => setTab('prepare') });
    useTrainingControl('handoverTab', {
        select: () => {
            setTab('handover');
        }
    });
    useTrainingControl('doneTab', { select: () => setTab('done') });

    const onTabChange = (newTab: typeof tab) => {
        analytics.orders.selectedOrdersTab(newTab);
        setTab(newTab);
    };

    const renderTab = () => {
        if (isFetching) {
            return (
                <RepeaterContainer times={3}>
                    <OrderItemSkeleton />
                </RepeaterContainer>
            );
        }

        switch (tab) {
            case 'prepare':
                return <PrepareTab />;
            case 'handover':
                return <HandoverTab />;
            case 'done':
                return <DoneTab />;
        }
    };

    return (
        <div className={classes.container} data-testid="order-list">
            <div className={classes.header}>
                <h3>{t('orders.live_orders_order_list.other.your_orders')}</h3>
                <Tooltip
                    width="280px"
                    mode="MANUAL"
                    title={t('orders.live_orders_order_list.other.tooltip_title') ?? ''}
                    content={t('orders.live_orders_order_list.other.tooltip_content') ?? ''}
                >
                    <InfoCircle height={20} width={20} onClick={() => analytics.orders.viewedOrderTabsInfo()} />
                </Tooltip>
            </div>
            <div className={classes.tabs}>
                <div data-training-id={trainingElements.prepareTab}>
                    <Chip
                        variant="outlined"
                        label={t(`orders.live_orders_order_list.tabs.${restaurant.is_grocery_unified_flow ? 'pick' : 'prepare'}`)}
                        icon={!isLessThanDesktopWidth && <PrepareBag />}
                        selected={tab === 'prepare'}
                        data-testid="prepare-tab"
                        onClick={() => onTabChange('prepare')}
                    />
                </div>
                <div data-training-id={trainingElements.handoverTab}>
                    <Chip
                        variant="outlined"
                        label={t('orders.live_orders_order_list.tabs.handover')}
                        icon={!isLessThanDesktopWidth && <PickUp />}
                        selected={tab === 'handover'}
                        data-testid="handover-tab"
                        onClick={() => onTabChange('handover')}
                    />
                </div>
                <div data-training-id={trainingElements.doneTab}>
                    <Chip
                        variant="outlined"
                        label={t('orders.live_orders_order_list.tabs.done')}
                        icon={!isLessThanDesktopWidth && <Check />}
                        selected={tab === 'done'}
                        data-testid="done-tab"
                        onClick={() => onTabChange('done')}
                    />
                </div>
            </div>

            <div className={classes.divider} />

            {renderTab()}
        </div>
    );
};

export default OrderList;
