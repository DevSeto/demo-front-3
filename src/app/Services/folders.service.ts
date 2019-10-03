import { Component, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { FoldersInterface } from '../Interfaces/Dto/folders.interface';
import { FoldersServicesInterface } from '../Interfaces/Services/folders-services.interface';

@Component()
export class FoldersService implements FoldersServicesInterface {

    constructor(
        @Inject('FolderModelToken') private folderModel: Model<FoldersInterface>
    ) {}

    /**
     * Create folder
     *
     * @param folderData
     * @returns {Promise<FoldersInterface>}
     */
    public async create(folderData: FolderDto): Promise<any> {
        try {
            const folder: any = new this.folderModel(folderData).save();
            return await folder;
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Remove folders by storage
     *
     * @param foldersData
     */
    public async removeFoldersByStorage(foldersData: any): Promise<any> {
        try {
            return await this.folderModel.remove({
                type: foldersData.storage,
                user_id: foldersData.user_id
            });
        } catch(error) {
            console.log(error)
        }
    }

    public deepFind(object: any, path: string) {
        const paths: any = path.split('.');
        let current: any = object;
        let i: number;

        for (i = 0; i < paths.length; ++i) {
            if (current[paths[i]] == undefined) {
                return undefined;
            } else {
                current = current[paths[i]];
            }
        }

        return current;
    }

    /**
     *
     * @param foldersData
     */
    public async updateFolderSizeAndCount(foldersData: any): Promise<any> {
        const conditaion: any      = {
            [foldersData[0].path + '.obj_path']: foldersData[0].path
        };
        const folder: any          = await this.findBy(conditaion,0, 1);

        if(folder) {
            let rootFolderSize: number = folder[0].folder_size;
            const parentFolder: any    = this.deepFind(folder[0],foldersData[0].pr_path);
            let updateData: any        = [];
            let amountOfFiles: number  = parentFolder.amount_of_files;
            let size: number           = parentFolder.folder_size;

            for(let i in foldersData) {
                const currentFolder: any = this.deepFind(folder[0],foldersData[i].path);
                amountOfFiles            = amountOfFiles - 1;
                size                     = size - (currentFolder.size ? parseFloat(currentFolder.size) : 0);
                rootFolderSize           = rootFolderSize - (currentFolder.size ? currentFolder.size : currentFolder.folder_size);

                updateData.push({
                    [foldersData[i].pr_path + '.amount_of_files']: amountOfFiles,
                    [foldersData[i].pr_path + '.folder_size']: size,
                    [foldersData[i].path]: false
                });
            }

            updateData.push({
                'folder_size': rootFolderSize
            });

            updateData = updateData.reduce(function(result: any, current: any) {
                return Object.assign(result, current);
            }, {});


            try {
                if(rootFolderSize <= 0) {
                    return await this.folderModel.remove({
                        $or : [
                            {
                                [foldersData[0].path + '.id']: foldersData[0].id
                            },
                            {
                                [foldersData[0].path + '.folder_id']: foldersData[0].id
                            }
                        ]
                    });
                } else {
                    return await this.folderModel.update({
                        $or : [
                            {
                                [foldersData[0].path + '.id']: foldersData[0].id
                            },
                            {
                                [foldersData[0].path + '.folder_id']: foldersData[0].id
                            }
                        ]
                    },{
                        $set: updateData
                    });
                }
            } catch(error) {
                console.log(error)
            }
        } else {
            return [];
        }

    }

    /**
     * Get all folders
     *
     * @returns {Promise<FoldersInterface[]>}
     */
    public async findAll(): Promise<FoldersInterface[]> {
        try {
            return await this.folderModel.find({}, {folder: 1}).exec();
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Get user folder
     *
     * @param userId
     * @returns {Promise<FoldersInterface[]>}
     */
    public async findByUserId(userId: any): Promise<FoldersInterface[]> {
        try {
            return await this.folderModel.find({user_id: userId}, {folder: 1}).exec();
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Get folder by conditional
     *
     * @param conditional
     * @param offset
     * @param limit
     * @returns {Promise<FoldersInterface[]>}
     */
    public async findBy(conditional: any, offset: number = 0, limit: number = 9): Promise<FoldersInterface[]> {
        try {
            return await this.folderModel.find(conditional, {
                _id         : 1,
                folder      : 1,
                opened      : 1,
                folder_size : 1
            }).skip(offset).limit(limit).sort({ 'created_at': -1 }).exec();
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Get user folder count
     *
     * @param conditional
     */
    public async getUserFolderCount(conditional: any): Promise<any> {
        try {
            return await this.folderModel.count(conditional);
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Share folder
     *
     * @param folderName
     * @param userId
     * @returns {Promise<any>}
     */
    public async shareFolder(folderName: string, userId: string): Promise<any> {
        try {
            const checkExistFolder: any = await this.findBy({user_id: userId});

            if(checkExistFolder.length == 0) {
                const folder: any = await this.folderModel.find({folder_name: folderName},{ folder: 1, folder_name: 1 });
                if(folder.length) {
                    const sharedFolder: any = {
                        folder      : folder[0].folder,
                        folder_name : folder[0].folder_name,
                        user_id     : userId
                    };

                    return await this.create(sharedFolder);
                }

                return false;
            }

            return false;
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Update folder
     *
     * @param userId
     * @param folderData
     */
    public updateFolderById(userId: any, folderData: any) {
        try {
            const conditions: any = {_id: userId};
            const options: any    = {multi: true};

            return this.folderModel.update(conditions, { folder: folderData }, options, function (error: any, num: any) {
                if (error) {
                    throw error;
                }
            });
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Get user nzbcloud storage used space
     *
     * @param userId
     * @returns {Promise<FilesInterface[]>}
     */
    public async getNzbCloudUsedSpace(userId: string): Promise<any> {
        try {
            const response: any = await this.folderModel.aggregate([
                {
                    $match: {
                        user_id: userId,
                        type: 's3'
                    }
                },
                {
                    $group: {
                        _id: '1',
                        space: { $sum: '$folder_size'  }
                    }
                }
            ]).exec();

            const space: number = response.length ? response[0]['space'] : 0;

            return space;
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Get not opened folder count
     *
     * @param userId
     * @returns {Promise<FilesInterface[]>}
     */
    public async getNotOpenedCount(userId: string): Promise<any> {
        try {
            const response: any = await this.folderModel.aggregate([
                {
                    $match: {
                        user_id: userId
                    }
                },
                {
                    $group: {
                        _id: '1',
                        count: { $sum: {$cond: ["$opened", 0, 1]}  }
                    }
                }
            ]).exec();

            const count: number = response.length ? response[0]['count'] : 0;

            return count;
        } catch(error) {
            console.log(error)
        }
    }
}
