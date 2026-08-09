import React, { FC, useCallback, useEffect, useRef, useState, ImgHTMLAttributes } from 'react';
import axiosSetup from '@lo/shared/ajax/axiosSetup';

interface AuthenticatedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
    src: string;
    onError?: () => void;
}

const AuthenticatedImage: FC<AuthenticatedImageProps> = ({ src, alt, onError, ...props }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const onErrorRef = useRef(onError);
    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        let active = true;

        const fetchImage = async () => {
            try {
                const response = await axiosSetup.get(src, { responseType: 'blob' });
                if (active) {
                    const objectUrl = URL.createObjectURL(response.data);
                    setImageSrc(objectUrl);
                }
            } catch (error) {
                console.error('Failed to load authenticated image', error);
                if (active) {
                    onErrorRef.current?.();
                }
            }
        };

        if (src) {
            fetchImage();
        }

        return () => {
            active = false;
        };
    }, [src]);

    const handleImgError = useCallback(() => {
        onErrorRef.current?.();
    }, []);

    useEffect(() => {
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [imageSrc]);

    if (!imageSrc) {
        return null;
    }

    return <img src={imageSrc} alt={alt || ''} onError={handleImgError} {...props} />;
};

export default AuthenticatedImage;
