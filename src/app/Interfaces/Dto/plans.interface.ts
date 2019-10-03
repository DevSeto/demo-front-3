import { Document } from 'mongoose';

export interface PlansInterface extends Document {
    readonly name       : string;
    readonly price      : string;
    readonly created_at : Date;
    readonly updated_at : Date;
}