import React from 'react';
import classNames from 'classnames';
import { AVAILABLE_LANGUAGES } from '@lo/shared/constants';
import { useTranslation } from 'react-i18next';
import classes from './LanguageSelector.module.scss';
import { languageFlagsMap } from '../../../common/js/languageFlags';

type LanguageSelectorProps = {
    isOpen: boolean;
    onChange: (locale: string) => void;
    close: () => void;
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onChange, close }) => {
    const { t } = useTranslation();

    return (
        <div className={classNames(classes.container, { [classes.isOpen]: isOpen })}>
            <div className={classes.header}>
                <button className={classes.backButton} onClick={close} />
                <span className={classes.title}>{t('orders.live_orders_navigation.menu.language')}</span>
            </div>

            {Object.keys(AVAILABLE_LANGUAGES).map((item) => {
                const LanguageFlagIcon = languageFlagsMap[item];
                return (
                    <button
                        key={item}
                        data-testid={`language-item-${item}`}
                        className={classes.languageItem}
                        onClick={() => onChange(item)}
                    >
                        <LanguageFlagIcon className={classes.languageItemFlag} />
                        {AVAILABLE_LANGUAGES[item]}
                    </button>
                );
            })}
        </div>
    );
};
