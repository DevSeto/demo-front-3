import { Document } from 'mongoose';

export interface NzbGetsInterface extends Document {
    readonly status                  : boolean;
    readonly server_name             : string;
    readonly server_host             : string;
    readonly server_port             : number;
    readonly server_username         : string;
    readonly server_password         : string;
    readonly server_connection_limit : number;
    readonly created_at              : Date;
    readonly updated_at              : Date;
}