import config from '../services/config';

export const externalLinksList = (tenant: string) => {
    return [
        { name: 'Partner Hub', url: config.partnerHubUrl[tenant] ?? config.partnerHubUrl['default'], icon: 'Restaurant' },
        { name: 'Live Orders', url: config.liveOrdersUrl, icon: 'Order' },
        { name: 'Courier App', url: config.courierAppUrl, icon: 'Moped' },
        { name: 'Webshop', url: shopLinks.find((entry) => entry.key === tenant)?.url ?? '', icon: 'Basket' },
        {
            name: 'Knowledge Center',
            url: knowledgeCentreLinks.find((entry) => entry.key === tenant)?.url ?? '',
            icon: 'Atom'
        }
    ];
};

const shopLinks = [
    {
        key: 'uk',
        url: 'https://jet.my.site.com/JustEatUKvforcesite/services/auth/sso/GB2B_JET_Keycloak_UK'
    },
    {
        key: 'ie',
        url: 'https://jet.my.site.com/JustEatvforcesite/services/auth/sso/GB2B_JET_Keycloak_IE'
    },
    {
        key: 'es',
        url: 'https://jet.my.site.com/JustEatvforcesite/services/auth/sso/GB2B_JET_Keycloak_ES'
    },
    {
        key: 'it',
        url: 'https://jet.my.site.com/JustEatvforcesite/services/auth/sso/GB2B_JET_Keycloak_IT'
    },
    {
        key: 'au',
        url: 'https://menulogmerchandise.com.au/'
    },
    {
        key: 'nz',
        url: 'https://shop.menulog.co.nz/'
    },
    {
        key: 'nl',
        url: 'https://jet.my.site.com/Thuisbezorgdvforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'be',
        url: 'https://jet.my.site.com/Takeawayvforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'lu',
        url: 'https://jet.my.site.com/Takeawayvforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'bg',
        url: 'https://jet.my.site.com/Takeawayvforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'de',
        url: 'https://jet.my.site.com/Lieferandovforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'at',
        url: 'https://jet.my.site.com/Lieferandovforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'pl',
        url: 'https://jet.my.site.com/Pysznevforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'dk',
        url: 'https://jet.my.site.com/JustEatvforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'ch',
        url: 'https://jet.my.site.com/JustEatvforcesite/services/auth/sso/GB2B_JET_Takeaway'
    },
    {
        key: 'sk',
        url: 'https://jet.my.site.com/Bistrovforcesite/services/auth/sso/GB2B_JET_Takeaway'
    }
];

const knowledgeCentreLinks = [
    {
        key: 'at',
        url: 'https://partnerinfo.lieferando.at/de'
    },
    {
        key: 'be',
        url: 'https://partnerinfo.takeaway.com/be-nl'
    },
    {
        key: 'bg',
        url: 'https://partnerinfo.takeaway.com/bg-bg'
    },
    {
        key: 'ch',
        url: 'http://partnerinfo.just-eat.ch/fr'
    },
    {
        key: 'de',
        url: 'https://partnerinfo.lieferando.de/de'
    },
    {
        key: 'dk',
        url: 'https://partnerinfo.just-eat.dk/dk'
    },
    {
        key: 'es',
        url: 'https://partnerinfo.just-eat.es/es'
    },
    {
        key: 'it',
        url: 'https://partnerinfo.justeat.it/it'
    },
    {
        key: 'ie',
        url: 'http://partnerinfo.just-eat.ie/en'
    },
    {
        key: 'nl',
        url: 'https://partnerinfo.thuisbezorgd.nl/nl'
    },
    {
        key: 'pl',
        url: 'https://partnerinfo.pyszne.pl/pl'
    },
    {
        key: 'sk',
        url: 'http://partnerinfo.bistro.sk/sk'
    },
    {
        key: 'uk',
        url: 'https://partnerinfo.just-eat.co.uk/en'
    }
];
