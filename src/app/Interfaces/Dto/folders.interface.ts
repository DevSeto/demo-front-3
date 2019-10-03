import { Document } from 'mongoose';

export interface FoldersInterface extends Document {
    readonly folder      : JSON;
    readonly folder_name : String;
    readonly created_at  : Date;
    readonly updated_at  : Date;
}