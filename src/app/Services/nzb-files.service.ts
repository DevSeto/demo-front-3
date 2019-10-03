import { Model } from 'mongoose';
import { Component, Inject } from '@nestjs/common';
import { NzbFilesInterface } from '../Interfaces/Dto/nzb-files.interface';
import { NzbFilesServicesInterface } from '../Interfaces/Services/nzb-files-services.interface';

@Component()
export class NzbFilesService implements NzbFilesServicesInterface {

    constructor(
        @Inject('NzbFileModelToken') private nzbFileModel: Model<NzbFilesInterface>
    ) {}

    /**
     * Create nzb file
     *
     * @param fileData
     * @returns {Promise<any>}
     */
    public async create(fileData: FileDto): Promise<any> {
        try {
            const createdFile: any = new this.nzbFileModel(fileData).save();
            return await createdFile;
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Delete nzb file
     *
     * @param id
     * @returns {Promise<any>}
     */
    public async delete(id: string): Promise<any> {
        try {
            return await this.nzbFileModel.findByIdAndRemove(id);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Delete nzb file by condition
     *
     * @param condition
     * @returns {Promise<any>}
     */
    public async deleteBy(condition: any): Promise<any> {
        try {
            return await this.nzbFileModel.remove(condition);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find nzb file by conditional
     *
     * @param fileData
     * @returns {Promise<null|FilesInterface>}
     */
    public async findBy(fileData: any): Promise<any> {
        try {
            return await this.nzbFileModel.findOne(fileData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get user nzb files
     *
     * @param userId
     * @param fields
     * @returns {Promise<NzbFilesInterface[]>}
     */
    public async getUserNzbFilesByUserId(userId: any, fields: any): Promise<any> {
        try {
            return await this.nzbFileModel.find({ user_id: userId }, fields);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Update nzb cloud
     *
     * @param fileId
     * @param cloud
     */
    public async updateNzbCloud(fileId: any, cloud: any): Promise<any> {
        try {
            return await this.nzbFileModel.findOneAndUpdate({_id: fileId}, {cloud: cloud}, {upsert: true});
        } catch(err) {
            console.log(err)
        }
    }
}