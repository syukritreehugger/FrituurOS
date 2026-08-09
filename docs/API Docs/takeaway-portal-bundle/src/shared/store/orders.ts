import { create } from 'zustand';
import { SortingType } from '../enums/orderSortingTypeEnum';
import { OrderData } from '../types/orderDataType';
import { FilterType } from '../enums/orderFilteringTypeEnum';

type OrdersStoreType = {
    openedOrderId: OrderData['id'] | null;
    newArrivedOrderId: null;
    manuallyChangedOrderIds: OrderData['id'][];
    cancelledOrderReferences: OrderData['public_reference'][];
    sortingType: SortingType | null;
    filters: FilterType[];
    isHotOrdersActive: boolean;
    autoPrintedOrderIds: OrderData['id'][];
    orderUpdatedFromSocket: boolean;
    actions: {
        openOrderDetails: (id: OrderData['id']) => void;
        closeOrderDetails: () => void;
        manuallyChangedOrderStatus: (id: OrderData['id']) => void;
        receivedOrderUpdateFromSockets: (id: OrderData['id']) => void;
        setSortingType: (sortingType: SortingType | null) => void;
        setFilters: (filters: FilterType[]) => void;
        toggleHotOrdersFilter: () => void;
        autoPrintedOrder: (id: OrderData['id']) => void;
        orderCancelled: (reference: OrderData['public_reference']) => void;
        viewedOrderCancelledModal: (reference: OrderData['public_reference']) => void;
        resetOrderUpdatedFromSocket: () => void;
    };
};

export const useOrdersStore = create<OrdersStoreType>((set) => ({
    openedOrderId: null,
    newArrivedOrderId: null,
    manuallyChangedOrderIds: [],
    cancelledOrderReferences: [],
    sortingType: SortingType.BEST_MATCH,
    filters: [],
    isHotOrdersActive: false,
    autoPrintedOrderIds: [],
    orderUpdatedFromSocket: false,
    actions: {
        openOrderDetails: (id) => set({ openedOrderId: id }),
        closeOrderDetails: () => set({ openedOrderId: null }),
        manuallyChangedOrderStatus: (id) => {
            set((state) => {
                const newManuallyChangedOrderIds = [...state.manuallyChangedOrderIds];
                newManuallyChangedOrderIds.push(id);

                return {
                    ...state,
                    manuallyChangedOrderIds: [...new Set(newManuallyChangedOrderIds)]
                };
            });
        },
        receivedOrderUpdateFromSockets: (id) => {
            set((state) => {
                return {
                    ...state,
                    manuallyChangedOrderIds: state.manuallyChangedOrderIds.filter((orderId) => orderId !== id),
                    orderUpdatedFromSocket: true
                };
            });
        },
        orderCancelled: (reference) => {
            set((state) => {
                const newCancelledOrderReferences = [...state.cancelledOrderReferences];
                newCancelledOrderReferences.push(reference);

                return {
                    ...state,
                    cancelledOrderReferences: [...new Set(newCancelledOrderReferences)]
                };
            });
        },
        viewedOrderCancelledModal: (reference) => {
            set((state) => {
                return {
                    ...state,
                    cancelledOrderReferences: state.cancelledOrderReferences.filter((ref) => ref !== reference)
                };
            });
        },
        setSortingType: (sortingType) => set({ sortingType }),
        setFilters: (filters) => set({ filters }),
        toggleHotOrdersFilter: () => {
            set((state) => ({ ...state, isHotOrdersActive: !state.isHotOrdersActive }));
        },
        autoPrintedOrder: (id) => {
            set((state) => {
                const newAutoPrintedOrderIds = [...state.autoPrintedOrderIds];
                newAutoPrintedOrderIds.push(id);

                return {
                    ...state,
                    autoPrintedOrderIds: [...new Set(newAutoPrintedOrderIds)]
                };
            });
        },
        resetOrderUpdatedFromSocket: () => set({ orderUpdatedFromSocket: false })
    }
}));

/** Hooks */
export const useOpenedOrderId = () => useOrdersStore((state) => state.openedOrderId);
export const useSortingType = () => useOrdersStore((state) => state.sortingType);
export const useFilters = () => useOrdersStore((state) => state.filters);
export const useIsHotOrdersActive = () => useOrdersStore((state) => state.isHotOrdersActive);
export const useManuallyChangedOrderIds = () => useOrdersStore((state) => state.manuallyChangedOrderIds);
export const useNewArrivedOrderId = () => useOrdersStore((state) => state.newArrivedOrderId);
export const useAutoPrintedOrderIds = () => useOrdersStore((state) => state.autoPrintedOrderIds);
export const useCancelledOrderReferences = () => useOrdersStore((state) => state.cancelledOrderReferences);
export const useOrderUpdatedFromSocket = () => useOrdersStore((state) => state.orderUpdatedFromSocket);
export const useOrdersStoreActions = () => useOrdersStore((state) => state.actions);
