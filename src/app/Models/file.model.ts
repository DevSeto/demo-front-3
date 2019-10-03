import { Schema } from 'mongoose';

export const FILE_MODEL: Schema = new Schema({
    nzb_file_id : Number,
    user_id     : String,
    a_d_user_id : String,
    folder_id   : String,
    folder_path : String,
    cloud       : String,
    file_name   : String,
    file_id     : String,
    size        : Number,
    status      : String,
    created_at  : Date,
    updated_at  : Date
});

FILE_MODEL.pre('save', function (next) {
    const now: any = new Date();

    if (!this.a_d_user_id) {
        this.a_d_user_id = '';
    }

    if (!this.created_at) {
        this.created_at = now;
    }

    if (!this.status) {
        this.status = 'download';
    }

    this.updated_at = now;
    next();
});
