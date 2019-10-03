import { Model } from 'mongoose';
import { Component, Inject } from '@nestjs/common';
import { NzbGetsInterface } from '../Interfaces/Dto/nzbgets.interface';
import { NzbGetsServicesInterface } from '../Interfaces/Services/nzbgets-services.interface';

@Component()
export class NzbGetsService implements NzbGetsServicesInterface {

    constructor(
        @Inject('NzbGetModelToken') private nzbGetsModel: Model<NzbGetsInterface>
    ) {}

    /**
     * Create a new usenet server
     *
     * @param usenetServerData
     * @returns {Promise<NzbGetsInterface>}
     */
    public async create(usenetServerData: any): Promise<any> {
        try {
            const usenetServer: any = new this.nzbGetsModel(usenetServerData).save();
            return await usenetServer;
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Update usenet server
     *
     * @param usenetServerId
     * @param usenetServerData
     * @returns {Promise<null|NzbGetsInterface>}
     */
    public async update(usenetServerId: any, usenetServerData: any): Promise<any> {
        try {
            return await this.nzbGetsModel.findOneAndUpdate({_id: usenetServerId}, {$set: usenetServerData}, {upsert: true}, function (err, doc) {
                if (err) {
                    throw err;
                }
            });
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Delete usenet server by id
     *
     * @param usenetServersId
     * @returns {Promise<void>}
     */
    public async deleteUsenetServersById(usenetServersId: any): Promise<any> {
        try {
            return await this.nzbGetsModel.findByIdAndRemove(usenetServersId);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find usenet server by conditional
     *
     * @param nzbGetData
     * @returns {Promise<NzbGetsInterface[]>}
     */
    public async findBy(nzbGetData: any): Promise<any> {
        try {
            return await this.nzbGetsModel.find(nzbGetData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find by usenet server id
     *
     * @param usenetServerId
     * @returns {Promise<null|NzbGetsInterface>}
     */
    public async findById(usenetServerId: any): Promise<any> {
        try {
            return await this.nzbGetsModel.findById(usenetServerId);
        } catch(err) {
            console.log(err)
        }
    }
}