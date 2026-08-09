import axiosSMG from '@lo/shared/ajax/axiosSetupSMG';
import transformEntityTimeToDateObjects from '../helpers/transformEntityTimeToDateObjects';
import { OneMenuOfflineItem, OneMenu, OnlineItemsData, OfflineItemsData } from '../types/oneMenuType';
import { queryClient } from '../services/query';
import { RestaurantData } from '../types/restaurantDataType';

const getOneMenuBaseUrl = () => {
    const restaurant = queryClient.getQueryData<RestaurantData>(['restaurant']);
    return `/applications/partner-app/partners/${restaurant?.country_contact_information.code}/${restaurant?.reference}`;
};

export async function getOneMenu(): Promise<OneMenu> {
    const oneMenuBaseUrl = getOneMenuBaseUrl();

    return axiosSMG<OneMenu>({
        url: `${oneMenuBaseUrl}/menu`,
        method: 'get'
    }).then((response) => ({
        ...response.data,
        categories: response.data.categories.map((category) => ({
            ...category,
            products: transformEntityTimeToDateObjects(category.items)
        }))
    }));
}

export async function getOfflineItems(): Promise<OneMenuOfflineItem[]> {
    const oneMenuBaseUrl = getOneMenuBaseUrl();

    return axiosSMG<OneMenuOfflineItem[]>({
        url: `${oneMenuBaseUrl}/offline-items`,
        method: 'get'
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}

export async function takeItemsOnline(data: OnlineItemsData) {
    const oneMenuBaseUrl = getOneMenuBaseUrl();

    return axiosSMG<OneMenuOfflineItem[]>({
        url: `${oneMenuBaseUrl}/online-item-requests`,
        method: 'post',
        data
    });
}

export async function takeItemsOffline(data: OfflineItemsData) {
    const oneMenuBaseUrl = getOneMenuBaseUrl();

    return axiosSMG<OneMenuOfflineItem[]>({
        url: `${oneMenuBaseUrl}/offline-item-requests`,
        method: 'post',
        data
    });
}
