import React from 'react';
import ToggleBlock from '../ToggleBlock/ToggleBlock';
import { useTranslation } from 'react-i18next';
import Input from '@lo/web/components/UI/Input/Input';
import useProductIdLengthInput from './useProductIdLengthInput';
import classes from './ReceiptSettings.module.scss';
import { RestaurantModel } from '@lo/shared/models';
import { useIsChainAccount } from '@lo/shared/store/auth';

type ReceiptSettingsProps = {
    restaurant: RestaurantModel;
};

const ReceiptSettings: React.FC<ReceiptSettingsProps> = (props) => {
    const { restaurant } = props;

    const { t } = useTranslation();
    const isChainAccount = useIsChainAccount();
    const [productIdLength, setProductIdLength] = useProductIdLengthInput();

    return (
        !!restaurant && (
            <>
                <ToggleBlock
                    settingType="receipt"
                    settingName="product_id_enabled"
                    message={t('orders.live_orders_settings.restaurant.show_product_id')}
                    isSwitcherOn={restaurant.receipt_settings.product_id_enabled ?? true}
                />

                {!isChainAccount && (
                    <ToggleBlock
                        settingType="receipt"
                        settingName="auto_print_enabled"
                        message={t('orders.live_orders_settings.restaurant.receipt_auto_print')}
                        isSwitcherOn={restaurant.receipt_settings.auto_print_enabled ?? true}
                    />
                )}

                <div className={classes.productIdLength}>
                    <span>{t('orders.live_orders_settings.restaurant.receipt_product_id_length')}</span>
                    <div>
                        <Input
                            type="number"
                            width="30px"
                            min={1}
                            max={100}
                            placeholder="--"
                            value={productIdLength}
                            onChange={setProductIdLength}
                        />
                    </div>
                </div>
            </>
        )
    );
};

export default ReceiptSettings;
