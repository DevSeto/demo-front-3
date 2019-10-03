import { Model } from 'mongoose';
import { Component, Inject } from '@nestjs/common';
import * as redis from 'redis';

@Component()
export class CloudSocketService {

    public redisClient: any;

    constructor() {
        this.redisClient = redis.createClient();
    }

    /**
     *
     * @param room
     * @param data
     */
    public async updateRoom(room: string, data: any): Promise<any> {
        if(!data.length) {
            this.redisClient.del(room);
        } else {
            this.redisClient.set(room, JSON.stringify(data));
        }
    }

    /**
     * Get room by user id
     *
     * @param userId
     */
    public async getRoomData(room: string): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            this.redisClient.get(room, function(error: any, object: any) {

                if (object == null) {
                    resolve([]);
                } else {
                    resolve(JSON.parse(object));
                }
            });
        });
    }

}
