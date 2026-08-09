import useRestaurant from '@lo/shared/hooks/useRestaurant';

const useBrandInMarket = () => {
    const restaurant = useRestaurant();

    switch (restaurant.tenant) {
        case 'uk':
        case 'ie':
        case 'ch':
        case 'es':
        case 'it':
        case 'dk':
            return 'Just Eat';
        case 'be':
        case 'bg':
        case 'lu':
            return 'Takeaway.com';
        case 'nl':
            return 'Thuisbezorgd.nl';
        case 'de':
        case 'at':
            return 'Lieferando';
        case 'pl':
            return 'Pyszne.pl';
        case 'sk':
            return 'Bistro.sk';
        case 'ca':
            return 'Skip';
        case 'au':
        case 'nz':
            return 'Menulog';
        default:
            return 'Just Eat Takeaway.com';
    }
};

export default useBrandInMarket;
