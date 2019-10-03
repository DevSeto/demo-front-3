import { Schema } from 'mongoose';

export const FOLDER_MODEL: Schema = new Schema({
    folder      : JSON,
    folder_name : String,
    folder_size : Number,
    user_id     : String,
    file_id     : Number,
    type        : String,
    opened      : Boolean,
    created_at  : Date,
    updated_at  : Date,
});

FOLDER_MODEL.pre('save', function (next) {
    const now: any = new Date();
    if (!this.created_at) {
        this.created_at = now;
    }

    this.updated_at = now;
    this.opened     = false;
    next();
});
