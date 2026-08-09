import { v4 as uuid } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@lo/shared/localization/i18n';
import config from '@lo/shared/services/config';
import queryClient from '@lo/shared/services/query/queryClient';
import { RestaurantData } from '@lo/shared/types/restaurantDataType';
import { OrderData } from '@lo/shared/types/orderDataType';
import { DateRange, getDateRangeName, isSameDateRange } from '../../helpers/dates';
import { OrderHistoryFilters } from '../../store/orderHistory';
import { OrderHistoryDataItem } from '../../types/orderHistoryType';

export type Context = {
    schema: string;
    data: Record<string, any>;
};

const availableCountries = [
    'uk',
    'au',
    'at',
    'be',
    'bg',
    'ca',
    'dk',
    'fr',
    'de',
    'ie',
    'il',
    'it',
    'lu',
    'nl',
    'nz',
    'no',
    'pl',
    'pt',
    'ro',
    'es',
    'ch',
    'us',
    'sk',
    'xx',
    'all'
];

export async function createGlobalContexts(activeExperiments: Record<string, string> = {}) {
    const restaurantData = queryClient.getQueryData<RestaurantData>(['restaurant']);

    const contexts: Context[] = [
        {
            schema: 'iglu:jet/cx_producer/jsonschema/1-0-1',
            data: { team: 'alpha-team' }
        },
        {
            schema: 'iglu:jet/cx_consent/jsonschema/1-0-0',
            data: { status: ['full'] }
        },
        createPlatformContext(restaurantData),
        await createUserContext()
    ];

    if (restaurantData) {
        contexts.push(createPartnerContext(restaurantData));
    }

    Object.entries(activeExperiments).forEach(([name, variant]) => {
        contexts.push({
            schema: 'iglu:jet/cx_experiment/jsonschema/1-0-0',
            data: {
                name,
                variant,
                platform: 'feature management'
            }
        });
    });

    return contexts;
}

function createPlatformContext(restaurantData?: RestaurantData): Context {
    const environment = config.env === 'production' ? 'prod' : config.env === 'staging' ? 'stag' : 'dev';
    const language = i18n.language?.slice(0, 2) || 'en';
    const version = config.release || 'unknown';
    let country = restaurantData?.country_contact_information.code || '';
    country = availableCountries.includes(country) ? country : 'xx';

    return {
        schema: 'iglu:jet/cx_platform/jsonschema/1-2-0',
        data: { language, country, version, environment }
    };
}

async function createUserContext(): Promise<Context> {
    let anonymousId = await AsyncStorage.getItem('anonymousId');

    if (!anonymousId) {
        anonymousId = uuid();
        AsyncStorage.setItem('anonymousId', anonymousId);
    }

    return {
        schema: 'iglu:jet/cx_user/jsonschema/1-0-5',
        data: { anonymousId }
    };
}

function createPartnerContext(restaurantData: RestaurantData): Context {
    return {
        schema: 'iglu:jet.part/cx_partner/jsonschema/1-0-1',
        data: {
            id: restaurantData.reference,
            status: restaurantData.is_open ? 'open' : 'closed'
        }
    };
}

export function createPageContext({ id, name }: { id: string; name: string }): Context {
    return {
        schema: 'iglu:jet/cx_page/jsonschema/1-0-1',
        data: { name, id }
    };
}

export function createOrderContext(order: OrderData | OrderHistoryDataItem): Context {
    return {
        schema: 'iglu:jet.part/cx_order/jsonschema/1-0-0',
        data: {
            id: order.public_reference,
            total: Math.max(order.restaurant_total, 0),
            status: order.status,
            placedDateTime: order.placed_date
        }
    };
}

export function createComponentContext(name: string, type = 'button', extraData = {}): Context {
    return {
        schema: 'iglu:jet/cx_component/jsonschema/1-0-1',
        data: { name, type, ...extraData }
    };
}

export function createFilterContext(name: string, value: string): Context {
    return {
        schema: 'iglu:jet/cx_filter/jsonschema/1-0-0',
        data: { name, value }
    };
}

export function createProductContext(productId: string, categoryId?: string): Context {
    return {
        schema: 'iglu:jet.part/cx_item/jsonschema/1-0-0',
        data: { id: productId, categoryId: categoryId ?? null }
    };
}

export function createFilterContextsForOrderHistory(filters: OrderHistoryFilters, dateRange?: DateRange): Context[] {
    const filtersData: { name: string; value: string }[] = [];

    filters.statuses.forEach((status) => filtersData.push({ name: 'order_status_filter', value: status }));
    filters.paymentMethods.forEach((method) => filtersData.push({ name: 'payment_method_filter', value: method }));

    if (dateRange && !isSameDateRange(dateRange, 'today')) {
        filtersData.push({ name: 'date_range_filter', value: getDateRangeName(dateRange) ?? 'custom' });
    }

    return filtersData.map(({ name, value }) => createFilterContext(name, value));
}

export function createTimeContext(type: 'cook' | 'delivery', amount: number): Context {
    return {
        schema: 'iglu:jet.part/cx_time/jsonschema/1-0-0',
        data: { type, amount }
    };
}

export function createSettingContext(section: string, name: string, type?: string): Context {
    return {
        schema: 'iglu:jet.part/cx_setting/jsonschema/1-0-1',
        data: { section, name, type: type ?? null }
    };
}
