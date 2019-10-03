import { Connection, Model } from 'mongoose';
import { USER_SETTINGS_MODEL } from '../Models/user-settings.model';

export const USER_SETTINGS_PROVIDER = [
    {
        provide    : 'UserSettingsModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('UserSettings', USER_SETTINGS_MODEL),
        inject     : ['NZBCloud'],
    },
];