import { Document } from 'mongoose';

export interface UserSettingsInterface extends Document {
    readonly user_id     : string;
    readonly language_id : string;
    readonly plan_id     : string;
    readonly created_at  : Date;
    readonly updated_at  : Date;
}