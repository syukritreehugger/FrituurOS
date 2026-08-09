import { useEffect } from 'react';
import { useLocation } from 'react-router';
import analytics from '@lo/shared/services/analytics';

export default function useTrackPageView() {
    const location = useLocation();

    useEffect(() => {
        analytics.viewedPage();
    }, [location.pathname]);
}
