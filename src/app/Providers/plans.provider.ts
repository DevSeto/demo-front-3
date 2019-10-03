import { Connection, Model } from 'mongoose';
import { PLAN_MODEL } from '../Models/plan.model';

export const PLANS_PROVIDER = [
    {
        provide    : 'PlanModelToken',
        useFactory : (connection: Connection): Model<any> => connection.model('Plan', PLAN_MODEL),
        inject     : ['NZBCloud'],
    },
];