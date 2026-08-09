type CookieOptions = {
    path?: string;
    expires?: number | string | Date;
};

export const getCookie = (name: string): string | undefined => {
    const matches = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

export const setCookie = (name: string, value: string | number, options: CookieOptions = {}): void => {
    let expires = options && options.expires && options.expires;

    if (options && options.path && typeof options.path === 'undefined') {
        options.path = '/';
    }

    if (typeof expires == 'number' && expires) {
        const d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }

    if (expires && expires instanceof Date) {
        options.expires = expires.toUTCString();
    }

    let updatedCookie = `${name}=${encodeURIComponent(value)}`;

    for (const propName in options) {
        updatedCookie += '; ' + propName;
        const propValue = (options as Record<string, any>)[propName];
        if (propValue !== true) {
            updatedCookie += '=' + propValue;
        }
    }

    document.cookie = updatedCookie;
};

export const removeCookie = (name: string, path?: string, domain?: string): void => {
    document.cookie =
        encodeURIComponent(name) +
        '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
        (domain ? '; domain=' + domain : '') +
        (path ? '; path=' + path : '');
};
