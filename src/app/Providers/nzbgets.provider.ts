import { Connection, Model } from 'mongoose';
import { NZBGET_MODEL } from '../Models/nzbget.model';

export const NZBGETS_PROVIDER = [
    {
        provide    : 'NzbGetModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('NzbGet', NZBGET_MODEL),
        inject     : ['NZBCloud'],
    },
];