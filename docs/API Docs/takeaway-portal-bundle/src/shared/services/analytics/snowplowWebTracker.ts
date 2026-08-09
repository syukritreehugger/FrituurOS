import { v4 as uuid } from 'uuid';
import { Context, createGlobalContexts, createPageContext } from './contexts';
import { useCookiesStore } from '../../store/cookies';
import { SnowplowBaseTracker } from './snowplowBaseTracker';
import config from '@lo/shared/services/config';
import { getTenant } from '@lo/shared/services/auth';
import { isProduction } from '../../helpers/isProduction';

export default class SnowplowWebTracker extends SnowplowBaseTracker {
    private currentPageViewData: { id: string; name: string };

    constructor() {
        super();
        this.injectSnowplowScript();
        this.currentPageViewData = this.createPageViewData();
    }

    private injectSnowplowScript() {
        window.SNOWPLOW_CONFIG_URL = config.snowplowConfigUrl;

        if (isProduction() && getTenant() === 'uk') {
            window.SNOWPLOW_CONFIG_URL = config.snowplowConfigUrl.replace('-eu-', '-uk-');
        }

        const script = document.createElement('script');
        script.src = '/snowplow.js';
        script.async = true;
        document.body.appendChild(script);
    }

    private createPageViewData() {
        return {
            id: uuid(),
            name: this.getCurrentPageName()
        };
    }

    private getCurrentPageName(): string {
        return window.location.pathname.split('/').filter(Boolean).pop() || 'unknown';
    }

    protected consentIsGiven() {
        return useCookiesStore.getState().accepted === 'all';
    }

    protected async trackSelfDescribingEvent(schema: string, contexts: Context[] = []) {
        if (!this.consentIsGiven()) return;

        window.analytics_pipeline?.('trackSelfDescribingEvent', {
            event: { schema, data: {} },
            context: [
                createPageContext({ id: this.currentPageViewData.id, name: this.currentPageViewData.name }),
                ...(await createGlobalContexts(this.experiments)),
                ...contexts
            ]
        });
        window.analytics_pipeline?.('flushBuffer');
    }

    async viewedPage() {
        const pageName = this.getCurrentPageName();

        if (this.currentPageViewData.name !== pageName) {
            this.currentPageViewData = this.createPageViewData();
        }

        if (!this.consentIsGiven()) return;

        window.analytics_pipeline?.('trackPageView', {
            context: [
                ...(await createGlobalContexts(this.experiments)),
                createPageContext({ id: this.currentPageViewData.id, name: this.currentPageViewData.name })
            ]
        });
        window.analytics_pipeline?.('flushBuffer');
    }

    viewedScreen(): void {
        return;
    }
}
