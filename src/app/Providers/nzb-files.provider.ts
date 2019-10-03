import { Connection, Model } from 'mongoose';
import { NZB_FILE_MODEL } from '../Models/nzb-file.model';

export const NZB_FILES_PROVIDER = [
    {
        provide    : 'NzbFileModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('nzbfiles', NZB_FILE_MODEL),
        inject     : ['NZBCloud'],
    },
];