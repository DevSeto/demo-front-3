import { Document } from 'mongoose';

export interface LanguagesInterface extends Document {
    readonly name       : string;
    readonly icon       : string;
    readonly created_at : Date;
    readonly updated_at : Date;
}