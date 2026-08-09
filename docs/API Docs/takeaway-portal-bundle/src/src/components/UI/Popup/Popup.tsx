import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { useRefCallback } from '@lo/web/hooks/useRefCallback';
import FadeBackground from '../FadeBackground/FadeBackground';
import classes from './Popup.module.scss';
import { BottomSheet, useOnClickOutside } from '@jet-pie/react';

type PopupProps = PropsWithChildren<{
    isOpen: boolean;
    title?: string;
    width?: string;
    bottomSheetHeight?: string;
    hasPopupPadding?: boolean;
    hasBottomSheetPadding?: boolean;
    dataTestId?: string;
    onClose: () => void;
    onClickOutsideClose?: boolean;
    className?: string;
}>;

const Popup: React.FC<PopupProps> = (props) => {
    const {
        isOpen,
        onClose,
        title,
        dataTestId,
        width,
        bottomSheetHeight,
        hasBottomSheetPadding = true,
        hasPopupPadding = true,
        onClickOutsideClose = true,
        className,
        children
    } = props;
    const { width: screenWidth, isLessThanTabletWidth, isLessThanDesktopWidth } = useWindowSize();
    const { containerRef } = useOnClickOutside(() => {
        onClickOutsideClose && onClose();
    });
    const [contentRef, getContentRef] = useRefCallback();
    const centerPopup = contentRef && contentRef.clientWidth / screenWidth > 0.7;

    if (isLessThanTabletWidth) {
        return (
            <BottomSheet
                headerTitle={title}
                headerContentModifiers="default"
                height={bottomSheetHeight}
                isOpened={isOpen}
                onClose={onClose}
                data-testid={dataTestId}
                hasBodyPadding={hasBottomSheetPadding}
                shouldCloseOnOverlayClick
            >
                <div className={classes.mobileContainer}>{children}</div>
            </BottomSheet>
        );
    }

    return isOpen ? (
        <div className={classNames({ [classes.popupCentered]: centerPopup })}>
            {(isLessThanDesktopWidth || centerPopup) && <FadeBackground isVisible={isOpen} onClickBackground={onClose} />}
            <div
                className={classNames(classes.popup, { [classes.withPaddings]: hasPopupPadding }, className)}
                data-testid={dataTestId}
                style={{ width }}
                ref={containerRef}
            >
                {title && <h4>{title}</h4>}
                <div ref={getContentRef}>{children}</div>
            </div>
        </div>
    ) : null;
};

export default Popup;
