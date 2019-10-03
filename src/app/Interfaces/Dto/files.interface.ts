import { Document } from 'mongoose';

export interface FilesInterface extends Document {
    readonly nzb_file_id : number;
    readonly user_id     : string;
    readonly file_name   : string;
    readonly size        : number;
    readonly type        : string;
}