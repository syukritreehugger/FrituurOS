import { compareDesc, compareAsc } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalNotifications, useLocalNotificationsActions } from '../store/localNotifications';
import useRestaurant from './useRestaurant';
import { getNotificationsApi, markNotificationsAsReadApi } from '../api/notifications';
import transformEntityTimeToDateObjects from '../helpers/transformEntityTimeToDateObjects';
import { queryClient } from '../services/query';
import { Notification } from '../types/notificationType';

export default function useNotifications() {
    const restaurant = useRestaurant();
    const localNotifications = useLocalNotifications();
    const localNotificationsActions = useLocalNotificationsActions();
    const [sorting, setSorting] = useState<'asc' | 'desc'>('asc');

    const query = useQuery<Notification[]>({
        queryKey: ['notifications', restaurant.id],
        queryFn: getNotificationsApi,
        select: (data) =>
            transformEntityTimeToDateObjects(data).sort((itemA, itemB) => compareDesc(itemA.createdAt, itemB.createdAt)),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnReconnect: 'always'
    });

    const markAsReadMutation = useMutation<Notification[]>({
        mutationFn: markNotificationsAsReadApi,
        retry: 2,
        onSuccess(data) {
            queryClient.setQueryData(['notifications', restaurant.id], data);
        }
    });

    const allNotifications = useMemo(
        () =>
            [...localNotifications, ...(query.data ?? [])].sort((itemA, itemB) =>
                sorting === 'asc' ? compareAsc(itemA.createdAt, itemB.createdAt) : compareDesc(itemA.createdAt, itemB.createdAt)
            ),
        [localNotifications, restaurant.reference, query.data, restaurant.timezone, sorting]
    );

    const { urgentNotifications, hasUnread, amountOfUnread } = useMemo(() => {
        return {
            urgentNotifications: allNotifications.filter((item) => ['PrepareOrder'].includes(item.type)) || [],
            hasUnread: allNotifications.some((item) => !item.read),
            amountOfUnread: allNotifications.filter((item) => !item.read).length || 0
        };
    }, [allNotifications]);

    const [selectedTab, setSelectedTab] = useState<'urgent' | 'all'>(urgentNotifications.length > 0 ? 'urgent' : 'all');

    const markAllAsRead = useCallback(() => {
        if (hasUnread) {
            markAsReadMutation.mutate();
            localNotificationsActions.markAllAsRead();
        }
    }, [markAsReadMutation, localNotificationsActions, hasUnread]);

    return {
        isFetching: query.isFetching,
        notifications: allNotifications,
        selectedTab,
        setSelectedTab,
        sorting,
        setSorting,
        urgentNotifications,
        markAllAsRead,
        hasUnread,
        amountOfUnread,
        isStale: query.isStale,
        refetch: query.refetch
    };
}
