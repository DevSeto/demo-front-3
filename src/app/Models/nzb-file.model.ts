import { Schema } from 'mongoose';

export const NZB_FILE_MODEL: Schema = new Schema({
    user_id     : String,
    file_name   : String,
    file        : Buffer,
    file_id     : String,
    size        : Number,
    cloud       : String,
    created_at  : Date,
    updated_at  : Date
});

NZB_FILE_MODEL.pre('save', function (next) {
    const now: any = new Date();

    if (!this.created_at) {
        this.created_at = now;
    }

    this.updated_at = now;
    next();
});
