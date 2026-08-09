import axios from '@lo/shared/ajax/axiosSetup';
import {
    OrderHistoryDataItem,
    OrderHistoryExportType,
    OrderHistorySortingColumn,
    OrderHistorySortingDirection
} from '../types/orderHistoryType';
import transformEntityTimeToDateObjects from '../helpers/transformEntityTimeToDateObjects';
import { OrderData } from '../types/orderDataType';

type ExportParams = {
    dateFrom: Date;
    dateTo: Date;
    sortingColumn: OrderHistorySortingColumn;
    sortingDirection: OrderHistorySortingDirection;
    statuses: string[];
    paymentMethods: string[];
    exportType: OrderHistoryExportType;
};

export function getOrdersApi(): Promise<OrderData[]> {
    return axios({
        url: '/orders',
        method: 'get'
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}

export function confirmOrderApi(params: {
    id: number;
    cookingTime: number | null;
    deliveryDurationTime: number | null;
    estimatedDeliveryTime: Date | null;
}): Promise<OrderData> {
    const estimatedDeliveryTime = params.estimatedDeliveryTime
        ? params.estimatedDeliveryTime.toISOString().split('.')[0] + 'Z'
        : null;

    return axios({
        url: `/orders/${params.id}/confirm-order`,
        method: 'post',
        data: {
            food_preparation_duration: params.cookingTime,
            delivery_time_duration: params.deliveryDurationTime,
            estimated_delivery_time: estimatedDeliveryTime
        }
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}

export function updateOrderStatusApi(params: { id: number; status: string }): Promise<OrderData> {
    return axios({
        url: `/orders/${params.id}`,
        method: 'patch',
        data: { status: params.status }
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}

export function createOrderIssueApi(params: {
    id: number;
    partnerProductIds: string[];
    menuProductIds: string[];
}): Promise<OrderData> {
    return axios({
        url: `/orders/${params.id}/issue-status`,
        method: 'post',
        data: {
            status: 'order_issue',
            partner_product_id_list: params.partnerProductIds,
            menu_product_id_list: params.menuProductIds
        }
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}

export function getOrderReceiptApi(id: number, lang: string, phoneMaskingEnabled = false): Promise<string> {
    return axios({
        url: `/orders/${id}/receipt`,
        method: 'get',
        params: {
            translation: lang,
            phone_masking_enabled: Number(phoneMaskingEnabled)
        }
    }).then((response) => response.data);
}

export function getEscPosOrderReceiptApi(
    id: number,
    lang: string,
    largeReceipt: boolean,
    phoneMaskingEnabled = false
): Promise<number[]> {
    return axios({
        url: `/orders/${id}/esc-pos-receipt`,
        method: 'get',
        params: {
            translation: lang,
            line_character_length: largeReceipt ? 48 : undefined,
            phone_masking_enabled: Number(phoneMaskingEnabled)
        }
    }).then((response) => response.data);
}

export function getOrderHistoryApi(date_from: Date, date_to: Date): Promise<OrderHistoryDataItem[]> {
    const dateFromString = date_from.toISOString().split('.')[0] + 'Z'; // cut the milliseconds
    const dateToString = date_to.toISOString().split('.')[0] + 'Z'; // cut the milliseconds

    return axios({
        url: `/orders/history?date_from=${dateFromString}&date_to=${dateToString}`,
        method: 'get'
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}

export function getOrderHistoryExportApi(params: ExportParams): Promise<Blob> {
    const fromDateWithoutMilliseconds = params.dateFrom.toISOString().split('.')[0] + 'Z';
    const toDateWithoutMilliseconds = params.dateTo.toISOString().split('.')[0] + 'Z';

    return axios({
        url: `/orders/history/export/${params.exportType}`,
        method: 'get',
        responseType: 'blob',
        params: {
            date_from: fromDateWithoutMilliseconds,
            date_to: toDateWithoutMilliseconds,
            sort_by: params.sortingColumn,
            sort: params.sortingDirection,
            statuses: params.statuses,
            payment_methods: params.paymentMethods
        }
    }).then((response) => response.data);
}

export function getOrderApi(id: number): Promise<OrderData> {
    return axios({
        url: `/orders/${id}`,
        method: 'get'
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}
