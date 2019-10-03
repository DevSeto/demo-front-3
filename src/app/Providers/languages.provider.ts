import { Connection, Model } from 'mongoose';
import { LANGUAGE_MODEL } from '../Models/language.model';

export const LANGUAGES_PROVIDER = [
    {
        provide    : 'LanguageModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('Language', LANGUAGE_MODEL),
        inject     : ['NZBCloud'],
    },
];