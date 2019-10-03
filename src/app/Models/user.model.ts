import { Schema } from 'mongoose';
import { CryptoHelper } from '../Helpers/crypto/Crypto';

export const USER_MODEL: Schema = new Schema({
    first_name                 : String,
    last_name                  : String,
    email                      : String,
    password                   : String,
    active                     : Boolean,
    notification_configuration : JSON,
    language                   : String,
    plan                       : String,
    created_at                 : Date,
    updated_at                 : Date
});

USER_MODEL.pre('save', function (next) {
    let now = new Date();
    if (!this.created_at) {
        this.created_at = now;
    }

    if (!this.notification) {
        this.notification_configuration = '';
    }

    if (!this.first_name) {
        this.first_name = '';
    }

    if (!this.last_name) {
        this.last_name = '';
    }

    if (!this.password) {
        this.password = '';
    } else {
        this.password = CryptoHelper.encrypt(this.password);
    }

    if (!this.plan) {
        this.plan = 'free';
    }

    if (!this.language) {
        this.language = 'en';
    }

    this.active = true;
    this.updated_at = now;
    next();
});

USER_MODEL.pre('update', function (next) {
    let now: any      = new Date();
    const update: any = this._update;
    if (update.$set && update.$set.password) {
        this.update({}, {password: CryptoHelper.encrypt(update.$set.password)});
    }

    if (update.$set) {
        this.update({}, {updated_at: now});
    }

    next();
});
