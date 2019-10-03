import * as mongoose from 'mongoose';
import {ENV} from '../../../config';

const CONNECT_URL: string = `mongodb://
                            ${ENV.db.username}:
                            ${ENV.db.password}@
                            ${ENV.db.host}:
                            ${ENV.db.port}/
                            ${ENV.db.database}`.replace(/\s+/g, '');

export const DATABASE_PROVIDERS = [
    {
        provide: 'NZBCloud',
        useFactory: async () : Promise<mongoose.Connection> => {
            try {
                (mongoose as any).Promise = global.Promise;
                return await mongoose.connect(CONNECT_URL, {
                    useMongoClient: true,
                });
            } catch(err) {
                console.log(err)
            }
        },
    },
];