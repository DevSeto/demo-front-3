import { Document } from 'mongoose';

export interface UsersInterface extends Document {
    readonly first_name : string;
    readonly last_name  : string;
    readonly email      : string;
    readonly password   : string;
    readonly created_at : Date;
    readonly updated_at : Date;
}