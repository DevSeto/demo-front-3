import { Connection, Model } from 'mongoose';
import { FOLDER_MODEL } from '../Models/folder.model';

export const FOLDERS_PROVIDER = [
    {
        provide    : 'FolderModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('Folder', FOLDER_MODEL),
        inject     : ['NZBCloud'],
    },
];