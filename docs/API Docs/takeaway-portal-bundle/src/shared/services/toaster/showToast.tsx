import React from 'react';
import { toast, Zoom, ToastOptions } from 'react-toastify';
import { Toast, ToastCompact } from '@jet-pie/react';
import { LOToastOptions } from './types';

export default (message: string, options: LOToastOptions): void => {
    const toastOptions: ToastOptions = {
        onOpen: options.onShow,
        onClose: options.onClose,
        toastId: options.toastId,
        autoClose: options.closeable === false ? false : (options.autoClose ?? 5000),
        position: toast.POSITION.BOTTOM_LEFT,
        transition: Zoom,
        hideProgressBar: true,
        draggable: false,
        closeOnClick: options.onCtaButtonClick === undefined && options.closeable !== false,
        closeButton: false,
        style: { padding: 0, marginBottom: 4 }
    };

    if (options.ctaButtonText && options.onCtaButtonClick) {
        toast(
            <Toast
                message={message}
                variant={options.type}
                action="confirm"
                primaryAction={{ text: options.ctaButtonText, onClick: options.onCtaButtonClick }}
                className="no-margin-bottom"
                data-testid="toaster-container"
            />,
            toastOptions
        );
    } else {
        toast(
            <ToastCompact
                message={message}
                variant={options.type}
                className="no-margin-bottom compact-toast"
                data-testid="toaster-container"
            />,
            toastOptions
        );
    }
};
