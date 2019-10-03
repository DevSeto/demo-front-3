import { Model } from 'mongoose';
import { Component, Inject } from '@nestjs/common';
import { FilesInterface } from '../Interfaces/Dto/files.interface';
import { FilesServicesInterface } from '../Interfaces/Services/files-services.interface';

@Component()
export class FilesService implements FilesServicesInterface {

    constructor(
        @Inject('FileModelToken') private fileModel: Model<FilesInterface>
    ) {}

    /**
     * Create file
     *
     * @param fileData
     * @returns {Promise<any>}
     */
    public async create(fileData: FileDto): Promise<any> {
        try {
            const createdFile: any = new this.fileModel(fileData).save();
            return await createdFile;
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Delete file
     *
     * @param fileId
     * @returns {Promise<any>}
     */
    public async deleteFile(fileId: string): Promise<any> {
        try {
            return await this.fileModel.remove({_id: fileId});
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Delete file by nzb id
     *
     * @param condition
     * @returns {Promise<any>}
     */
    public async deleteFileByNzbId(condition: any): Promise<any> {
        try {
            return await this.fileModel.remove(condition);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find file by conditional
     *
     * @param fileData
     * @returns {Promise<null|FilesInterface>}
     */
    public async findBy(fileData: any): Promise<any> {
        try {
            return await this.fileModel.findOne(fileData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find files by conditional
     *
     * @param fileData
     * @returns {Promise<null|FilesInterface>}
     */
    public async findByAll(fileData: any): Promise<any> {
        try {
            return await this.fileModel.find(fileData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get user files id
     *
     * @param userId
     * @returns {Promise<FilesInterface[]>}
     */
    public async getUserFilesIdByUserId(userId: any): Promise<any> {
        try {
            return await this.fileModel.find({
                user_id    : userId,
                status     : 'download',
                created_at : {
                    $gt: new Date(new Date(Date.now() - 24*60*60 * 1000))
                }
            },{
                nzb_file_id : 1,
                a_d_user_id : 1,
                user_id     : 1,
                cloud       : 1
            });
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get user files
     *
     * @param userId
     * @returns {Promise<FilesInterface[]>}
     */
    public async getUserFilesByUserId(userId: any, limit: number): Promise<any> {
        try {
            return await this.fileModel.find({ user_id: userId , status: ['Success', 'Failed']}).sort({ 'created_at': -1 }).limit(limit);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get user files count
     *
     * @param userId
     * @returns {Promise<FilesInterface[]>}
     */
    public async getUserFilesCountByUserId(userId: any): Promise<any> {
        try {
            return await this.fileModel.find({ user_id: userId , status: ['Success', 'Failed']}).count();
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get file status
     *
     * @param nzbFileId
     * @param status
     * @returns {Promise<null|FilesInterface>}
     */
    public async updateFileStatus(nzbFileId: any, status: any): Promise<any> {
        try {
            return await this.fileModel.findOneAndUpdate({nzb_file_id: nzbFileId}, {status: status}, {upsert: true});
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Update File
     *
     * @param nzbFileId
     * @param data
     * @returns {Promise<null|FilesInterface>}
     */
    public async updateFile(nzbFileId: string, data: any): Promise<any> {
        try {
            return await this.fileModel.findOneAndUpdate({nzb_file_id: nzbFileId}, data, {upsert: true});
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Remove folders by storage
     *
     * @param foldersData
     */
    public async removeFilesByStorage(foldersData: any): Promise<any> {
        try {
            return await this.fileModel.remove({
                cloud: foldersData.storage,
                user_id: foldersData.user_id
            });
        } catch(error) {
            console.log(error)
        }
    }
}
