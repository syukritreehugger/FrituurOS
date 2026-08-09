import newOrderSound from '@lo/web/src/static/sounds/default_sound.mp3';
import airhorn from '@lo/web/src/static/sounds/airhorn.mp3';
import alert1 from '@lo/web/src/static/sounds/alert1.mp3';
import alert2 from '@lo/web/src/static/sounds/alert2.mp3';
import alert3 from '@lo/web/src/static/sounds/alert3.mp3';
import banjo from '@lo/web/src/static/sounds/banjo.mp3';
import bladerunner from '@lo/web/src/static/sounds/bladerunner.mp3';
import bong from '@lo/web/src/static/sounds/bong.mp3';
import bumptious from '@lo/web/src/static/sounds/bumptious.mp3';
import doorbell from '@lo/web/src/static/sounds/doorbell.mp3';
import doorbellNotification from '@lo/web/src/static/sounds/doorbell_notification.mp3';
import radio from '@lo/web/src/static/sounds/radio.mp3';
import signalRing from '@lo/web/src/static/sounds/signal_ring.mp3';
import warning from '@lo/web/src/static/sounds/warning.mp3';
import { SoundName } from '../types/uiSettingsType';

export const SOUND_MAP: Record<SoundName, { file: string; name: string }> = {
    default: {
        file: newOrderSound,
        name: 'default'
    },
    airhorn: {
        file: airhorn,
        name: 'airhorn'
    },
    bladerunner: {
        file: bladerunner,
        name: 'bladerunner'
    },
    bong: {
        file: bong,
        name: 'bong'
    },
    bumptious: {
        file: bumptious,
        name: 'bumptious'
    },
    doorbell_notification: {
        file: doorbellNotification,
        name: 'doorbell_notification'
    },
    doorbell: {
        file: doorbell,
        name: 'doorbell'
    },
    banjo: {
        file: banjo,
        name: 'banjo'
    },
    radio: {
        file: radio,
        name: 'radio'
    },
    signal_ring: {
        file: signalRing,
        name: 'signal_ring'
    },
    alert1: {
        file: alert1,
        name: 'alert1'
    },
    alert2: {
        file: alert2,
        name: 'alert2'
    },
    alert3: {
        file: alert3,
        name: 'alert3'
    },
    warning: {
        file: warning,
        name: 'warning'
    }
} as const;

let audioElement: HTMLAudioElement | null = null;

export const playSound = (soundName: SoundName) => {
    if (!audioElement || audioElement.ended) {
        audioElement = new Audio(SOUND_MAP[soundName].file);
        audioElement.play().catch((error) => console.error('Error playing sound:', error));
    }
};
