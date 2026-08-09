import { format, toZonedTime } from 'date-fns-tz';

export const formatTime = (utc_datetime: Date | null, outputFormat = 'HH:mm', timezone?: string): string | null => {
    if (!utc_datetime) return null;

    if (timezone) {
        return format(toZonedTime(utc_datetime, timezone), outputFormat, { timeZone: timezone });
    } else {
        return format(utc_datetime, outputFormat);
    }
};
