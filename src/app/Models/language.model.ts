import { Schema } from 'mongoose';

export const LANGUAGE_MODEL: Schema = new Schema({
    user_id    : String,
    name       : String,
    icon       : String,
    created_at : Date,
    updated_at : Date,
});

LANGUAGE_MODEL.pre('save', function (next) {
    const now: any = new Date();
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});