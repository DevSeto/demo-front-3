import { Schema } from 'mongoose';

export const USER_SETTINGS_MODEL: Schema = new Schema({
    user_id     : String,
    language_id : String,
    plan_id     : String,
    created_at  : Date,
    updated_at  : Date,
});

USER_SETTINGS_MODEL.pre('save', function (next) {
    const now: any = new Date();
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});