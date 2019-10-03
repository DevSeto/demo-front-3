import { Schema } from 'mongoose';

export const NZBGET_MODEL: Schema = new Schema({
    user_id                 : String,
    server_name             : String,
    server_host             : String,
    server_port             : String,
    server_username         : String,
    server_password         : String,
    server_connection_limit : String,
    created_at              : Date,
    updated_at              : Date
});

NZBGET_MODEL.pre('save', function (next) {
    const now: any = new Date();
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});