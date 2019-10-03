import { Document } from 'mongoose';

export interface NzbFilesInterface extends Document {
    readonly user_id   : string;
    readonly file_name : string;
    readonly file      : Buffer;
}