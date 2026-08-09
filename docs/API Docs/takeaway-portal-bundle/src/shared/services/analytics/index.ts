import { SnowplowBaseTracker } from './snowplowBaseTracker';
import SnowplowWebTracker from './snowplowWebTracker';

const tracker: SnowplowBaseTracker = new SnowplowWebTracker();

export default tracker;
