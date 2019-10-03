import { Schema } from 'mongoose';

export const PLAN_MODEL: Schema = new Schema({
    user_id    : String,
    name       : String,
    price      : String,
    created_at : Date,
    updated_at : Date
});

PLAN_MODEL.pre('save', function (next) {
    const now: any = new Date();
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});