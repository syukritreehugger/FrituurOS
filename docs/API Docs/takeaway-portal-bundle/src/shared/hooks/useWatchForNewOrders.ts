import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useOrders from '@lo/shared/hooks/useOrders';
import { playSound } from '@lo/shared/helpers/playSound';
import { showInfoToast } from '@lo/shared/services/toaster';
import { isNewOrderNotAccepted } from '@lo/shared/helpers/isNewOrderNotAccepted';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

export default () => {
    const { t } = useTranslation();
    const { data } = useOrders();
    const restaurant = useRestaurant();

    const sound = restaurant.ui_settings.other_notification_sound || 'default';

    useEffect(() => {
        let newOrdersWatcherIntervalId: number | undefined = undefined;

        if (data && data.array.length > 0 && data.array.length < 500) {
            newOrdersWatcherIntervalId = setInterval(() => {
                if (isNewOrderNotAccepted(data.array)) {
                    showInfoToast(t('orders.live_orders_messages.main.have_you_accepted_order'), {
                        onShow: () => playSound(sound),
                        toastId: 'new-order'
                    });
                }
            }, 10000) as unknown as number;
        }

        return () => {
            clearInterval(newOrdersWatcherIntervalId);
        };
    }, [sound, data]);
};
