import { create } from 'zustand';

type BannerKey = 'restaurant-closed' | 'restaurant-delivery-closed' | 'restaurant-pickup-closed' | 'no-internet-connection';

type BannersStoreType = {
    banners: BannerKey[];
    actions: {
        hideBanner: (key: BannerKey) => void;
        showBanner: (key: BannerKey) => void;
    };
};

const useBannersStore = create<BannersStoreType>((set) => ({
    banners: [],
    actions: {
        hideBanner: (key) =>
            set(({ banners }) => ({
                banners: [...banners.filter((item) => item !== key)]
            })),
        showBanner: (key) =>
            set(({ banners }) => ({
                banners: [...banners, key]
            }))
    }
}));

const useBanners = () => useBannersStore((state) => state.banners);
const useBannersActions = () => useBannersStore((state) => state.actions);

export { useBanners, useBannersActions, useBannersStore };
export type { BannerKey };
