import { Connection, Model } from 'mongoose';
import { USER_MODEL } from '../Models/user.model';

export const USERS_PROVIDER = [
    {
        provide    : 'UserModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('User', USER_MODEL),
        inject     : ['NZBCloud'],
    },
];