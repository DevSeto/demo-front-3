import { Connection, Model } from 'mongoose';
import { FILE_MODEL } from '../Models/file.model';

export const FILES_PROVIDER = [
    {
        provide    : 'FileModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('Files', FILE_MODEL),
        inject     : ['NZBCloud'],
    },
];