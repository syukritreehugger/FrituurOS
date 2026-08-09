import config from '../services/config';

export const isProduction = (): boolean => config.env === 'production';
