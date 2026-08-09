import { DateRange, getDateRangeName } from '../../helpers/dates';
import { OrderHistoryFilters } from '../../store/orderHistory';
import { OrderData } from '../../types/orderDataType';
import { OrderHistoryDataItem } from '../../types/orderHistoryType';
import {
    Context,
    createComponentContext,
    createFilterContext,
    createFilterContextsForOrderHistory,
    createOrderContext,
    createProductContext,
    createSettingContext,
    createTimeContext
} from './contexts';

type SettingsSection = 'pin' | 'delivery display' | 'order list' | 'receipt' | 'tutorials';

type SettingsName =
    | 'pin'
    | 'address'
    | 'postcode'
    | 'order reference'
    | 'name'
    | 'product id'
    | 'auto print'
    | 'tutorials'
    | 'incoming_order_sound'
    | 'order_update_sound'
    | 'other_notification_sound';

export abstract class SnowplowBaseTracker {
    abstract viewedScreen(name: string): void;

    abstract viewedPage(): Promise<void>;

    protected abstract trackSelfDescribingEvent(schema: string, contexts?: Context[]): void;

    protected experiments: Record<string, string> = {};

    experimentActive(name: string, variant: string) {
        const alreadyExists = this.experiments.hasOwnProperty(name);
        this.experiments[name] = variant;

        if (!alreadyExists) {
            this.trackSelfDescribingEvent('iglu:jet/experiment_active/jsonschema/1-0-0');
        }
    }

    orders = {
        confirmedOrder: (order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/order_accept/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        movedOrderToInDelivery: (order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/order_onItsWay/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        deliveredOrder: (order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/order_done/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        movedOrderBackToKitchen: (order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/order_update/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        changedOrderDuration: (type: 'cook' | 'delivery', amount: number, order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/order_update/jsonschema/1-0-0', [
                createOrderContext(order),
                createTimeContext(type, amount)
            ]);
        },

        updatedConfirmedOrder: (order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/order_update/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        viewedOrderTabsInfo: () => {
            this.trackSelfDescribingEvent('iglu:jet/content_view/jsonschema/1-0-0', [
                createComponentContext('order_tab_tutorial', 'dialog')
            ]);
        },

        selectedOrdersTab: (tab: 'prepare' | 'handover' | 'done') => {
            this.trackSelfDescribingEvent('iglu:jet/content_view/jsonschema/1-0-0', [
                createComponentContext(tab, 'header', { position: 2 })
            ]);
        },

        openedScanner: () => {
            this.trackSelfDescribingEvent('iglu:jet.part/qrCode_scan/jsonschema/1-0-0');
        },

        scannedOrder: (order: OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/orderScanFetch_success/jsonschema/1-0-0', [createOrderContext(order)]);
        }
    };

    menu = {
        productIsOutOfStock: (productId: string, categoryId: string, backToStockAt?: Date) => {
            const contexts = [createProductContext(productId, categoryId)];

            if (backToStockAt) {
                contexts.push({
                    schema: 'iglu:jet.part/cx_response/jsonschema/1-0-1',
                    data: { date: backToStockAt }
                });
            }

            this.trackSelfDescribingEvent('iglu:jet.part/item_offline/jsonschema/1-0-0', contexts);
        },

        productIsBackInStock: (productId: string, categoryId: string) => {
            this.trackSelfDescribingEvent('iglu:jet.part/item_online/jsonschema/1-0-0', [
                createProductContext(productId, categoryId)
            ]);
        },

        allProductsAreBackInStock: (productIds: string[]) => {
            const productContexts = productIds.map((id) => createProductContext(id));
            this.trackSelfDescribingEvent('iglu:jet.part/item_allOnline/jsonschema/1-0-0', productContexts);
        },

        scrolledToTop: () => {
            this.trackSelfDescribingEvent('iglu:jet/navigation_select/jsonschema/1-0-0');
        },

        clickedOnSearch: () => {
            this.trackSelfDescribingEvent('iglu:jet.part/searchMenu_access/jsonschema/1-0-0');
        },

        clearedSearch: (query: string) => {
            this.trackSelfDescribingEvent('iglu:jet.part/searchMenu_clear/jsonschema/1-0-0', [
                {
                    schema: 'iglu:jet.part/cx_query/jsonschema/1-0-0',
                    data: { value: query.length }
                }
            ]);
        },

        clickedOnShowMoreResults: (query: string) => {
            this.trackSelfDescribingEvent('iglu:jet.part/searchMenu_accessAllResults/jsonschema/1-0-0', [
                {
                    schema: 'iglu:jet.part/cx_query/jsonschema/1-0-0',
                    data: { value: query.length }
                }
            ]);
        },

        clickedOnSearchListItem: (query: string) => {
            this.trackSelfDescribingEvent('iglu:jet.part/searchMenu_accessPreliminaryList/jsonschema/1-0-0', [
                {
                    schema: 'iglu:jet.part/cx_query/jsonschema/1-0-0',
                    data: { value: query.length }
                }
            ]);
        },

        turnedOnOutOfStockFilter: () => {
            this.trackSelfDescribingEvent('iglu:jet/filter_add/jsonschema/1-0-1', [
                createFilterContext('out_of_stock_filter', 'on')
            ]);
        },

        turnedOffOutOfStockFilter: (element: 'button' | 'toggle') => {
            this.trackSelfDescribingEvent('iglu:jet/filter_remove/jsonschema/1-0-1', [
                createFilterContext('out_of_stock_filter', 'on'),
                createComponentContext('out_of_stock_filter', element)
            ]);
        },

        selectedCategory: (categoryId: string) => {
            this.trackSelfDescribingEvent('iglu:jet.part/menuCategory_select/jsonschema/1-0-0', [
                {
                    schema: 'iglu:jet/cx_productCategory/jsonschema/1-0-0',
                    data: { id: categoryId }
                }
            ]);
        }
    };

    orderHistory = {
        openedOrder: (order: OrderHistoryDataItem | OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/orderModal_view/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        closedOrder: (order: OrderHistoryDataItem | OrderData) => {
            this.trackSelfDescribingEvent('iglu:jet.part/orderModal_dismiss/jsonschema/1-0-0', [createOrderContext(order)]);
        },

        appliedDateRange: (dateRange: DateRange) => {
            this.trackSelfDescribingEvent('iglu:jet.part/orderHistoryFilter_add/jsonschema/1-0-0', [
                createFilterContext('date_range_filter', getDateRangeName(dateRange) ?? 'custom'),
                {
                    schema: 'iglu:jet.part/cx_dateRange/jsonschema/1-0-0',
                    data: { date_start: dateRange[0], date_end: dateRange[1] }
                }
            ]);
        },

        appliedFilters: (filters: OrderHistoryFilters) => {
            this.trackSelfDescribingEvent(
                'iglu:jet.part/orderHistoryFilter_add/jsonschema/1-0-0',
                createFilterContextsForOrderHistory(filters)
            );
        },

        removedFilter: (
            filter: 'order_status_filter' | 'payment_method_filter' | 'date_range_filter',
            value: string,
            component?: string
        ) => {
            this.trackSelfDescribingEvent('iglu:jet.part/orderHistoryFilter_remove/jsonschema/1-0-0', [
                createFilterContext(filter, value),
                createComponentContext(component ?? value)
            ]);
        },

        removedAllFilters: (filters: OrderHistoryFilters, dateRange?: DateRange, component?: string) => {
            const contexts = createFilterContextsForOrderHistory(filters, dateRange);

            if (component) {
                contexts.push(createComponentContext(component));
            }

            this.trackSelfDescribingEvent('iglu:jet.part/orderHistoryFilter_remove/jsonschema/1-0-0', contexts);
        },

        exported: (type: 'print' | 'pdf' | 'csv') => {
            this.trackSelfDescribingEvent('iglu:jet.part/orderHistory_export/jsonschema/1-0-0', [createComponentContext(type)]);
        }
    };

    settings = {
        toggled: (section: SettingsSection, name: SettingsName, value: boolean) => {
            this.trackSelfDescribingEvent(`iglu:jet.part/settings_${value ? 'enable' : 'disable'}/jsonschema/1-0-0`, [
                createSettingContext(section, name)
            ]);
        },

        changedSound: (value: string) => {
            this.trackSelfDescribingEvent('iglu:jet.part/settings_update/jsonschema/1-0-0', [
                createSettingContext('sound', 'name', value)
            ]);
        },

        changedDuration: (type: 'cook' | 'delivery', value: number) => {
            this.trackSelfDescribingEvent('iglu:jet.part/settings_update/jsonschema/1-0-0', [createTimeContext(type, value)]);
        }
    };
}
