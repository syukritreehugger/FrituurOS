import { RestaurantContacts } from '../types/restaurantContactsType';
import { ReceiptSettings } from '../types/receiptSettingsType';
import { RestaurantSettings } from '../types/restaurantSettingsType';
import { WorktimeSlot } from '../types/worktimeSlotType';
import { NonNullableUISettingsType } from '../types/uiSettingsType';
import { RestaurantData, RestaurantDeliveryService } from '../types/restaurantDataType';
import {
    COURIER_THEN_RESTAURANT,
    GROCERY_UNIFIED_FLOW,
    SCOOBER_UNIFIED_FLOW,
    SOUND_NAMES,
    THIRD_PARTY_GROCERY_FLOW,
    UNIFIED_POS_FLOW
} from '../constants';
import OrderModel from './OrderModel';

export default class RestaurantModel {
    readonly id!: number;
    readonly reference!: string;
    readonly name!: string;
    readonly logo!: string | null;
    readonly is_open!: boolean;
    readonly delivery_enabled!: boolean;
    readonly pickup_enabled!: boolean;
    readonly delivery_service!: RestaurantDeliveryService;
    readonly order_flow!: string;
    readonly storefront_type!: 'restaurant' | 'groceries';
    readonly food_preparation_duration!: number;
    readonly average_delivery_duration!: number;
    readonly timezone!: string;
    readonly language!: string;
    readonly country_contact_information!: RestaurantContacts;
    readonly receipt_settings!: ReceiptSettings;
    readonly restaurant_settings!: RestaurantSettings;
    readonly worktime_slots?: WorktimeSlot[];
    readonly ui_settings!: NonNullableUISettingsType;
    readonly allow_close!: boolean;
    readonly platform!: 'takeaway' | 'just-eat';
    readonly street!: string;
    readonly street_number!: string;
    readonly city!: string;
    readonly phone_number!: string;
    readonly postcode!: string;
    readonly gtins_enabled!: boolean;

    constructor(data: RestaurantData) {
        Object.entries(data).forEach(([key, value]) => {
            (this as any)[key] = value;
        });

        Object.entries(this.ui_settings).forEach(([key, value]) => {
            const isSoundSetting = ['incoming_order_sound', 'order_update_sound', 'other_notification_sound'].includes(key);
            const ui = this.ui_settings as Record<string, any>;

            if (isSoundSetting) {
                const isValidSoundName = typeof value === 'string' && SOUND_NAMES.includes(value);
                ui[key] = isValidSoundName ? value : 'default';
            } else {
                ui[key] = value ?? true;
            }
        });
    }

    // ACL

    get can_change_default_cooking_duration(): boolean {
        return this.order_flow !== COURIER_THEN_RESTAURANT && (this.is_own_delivery || this.is_3PL);
    }

    get can_change_default_delivery_duration(): boolean {
        return this.order_flow !== COURIER_THEN_RESTAURANT && this.is_own_delivery;
    }

    can_change_cooking_duration_of_order(order: OrderModel): boolean {
        return !((this.is_3PL || this.is_scoober || this.is_delco || this.is_haal) && this.is_courier_first && order.is_delivery);
    }

    can_change_delivery_duration_of_order(order: OrderModel): boolean {
        return !this.is_courier_first && this.is_own_delivery && order.is_delivery;
    }

    get can_revert_order_status(): boolean {
        return this.is_own_delivery || this.is_unified_order_flow;
    }

    can_change_confirmed_time_of_order(order: OrderModel): boolean {
        return this.is_own_delivery && !order.is_cancelled && !order.is_delivered && !order.is_new;
    }

    can_update_status_of_order(order: OrderModel): boolean {
        return !(this.is_unified_order_flow && order.is_confirmed && !order.is_ready_for_kitchen);
    }

    // Delivery service getters

    get is_own_delivery(): boolean {
        return this.delivery_service === 'own_delivery';
    }
    get is_scoober(): boolean {
        return this.delivery_service === 'scoober';
    }
    get is_3PL(): boolean {
        return (
            [
                'notime',
                'stuart',
                'yuso',
                'doorhub',
                'gastrokurier',
                'fleetlery',
                'quickzii',
                'step',
                'flink',
                'haal',
                'gastroflow'
            ].includes(this.delivery_service) || this.order_flow === THIRD_PARTY_GROCERY_FLOW
        );
    }
    get is_just_eat_rds(): boolean {
        return this.delivery_service === 'just_eat_rds';
    }

    get is_delco(): boolean {
        return this.delivery_service === 'delco';
    }
    get is_haal(): boolean {
        return this.delivery_service === 'haal';
    }

    // Order flow getters

    get is_courier_first(): boolean {
        return this.order_flow === COURIER_THEN_RESTAURANT;
    }
    get is_unified_order_flow(): boolean {
        return [SCOOBER_UNIFIED_FLOW, GROCERY_UNIFIED_FLOW, UNIFIED_POS_FLOW].includes(this.order_flow);
    }
    get is_grocery_unified_flow(): boolean {
        return this.storefront_type === 'groceries' || this.order_flow === GROCERY_UNIFIED_FLOW;
    }

    get is_just_eat(): boolean {
        return this.platform === 'just-eat';
    }

    get tenant(): string {
        return this.country_contact_information.code;
    }

    get is_address_visible(): boolean {
        return !(this.is_3PL || this.is_scoober || this.is_delco || this.is_haal);
    }

    get show_restaurant_settings_text(): boolean {
        return !(this.is_courier_first || this.is_scoober || this.is_delco || this.is_haal);
    }

    get can_toggle_delivery(): boolean {
        return !(this.is_scoober || this.is_delco || this.is_haal);
    }
}
