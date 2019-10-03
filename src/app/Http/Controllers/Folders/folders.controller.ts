import { Controller, Post, HttpStatus, Response, Request, Body, Get, Bind, Param } from '@nestjs/common';
import { FoldersService } from '../../../Services/folders.service';
import { FilesService } from '../../../Services/files.service';
import { ENV } from '../../../../config';
import { CryptoHelper } from '../../../Helpers/crypto/Crypto';
import * as rp from 'request-promise';

@Controller('/api/folders')
export class FoldersController {

    constructor(
        private readonly foldersService: FoldersService,
        private readonly filesService: FilesService
    ) {}

    /**
     * Save folder structure
     *
     * @param folders
     * @returns {Promise<void>}
     */
    @Post()
    public async upload(@Response() res: any, @Body() folders: any): Promise<any> {
        for(let folderId in folders) {
            if(folders.hasOwnProperty(folderId)) {
                const folder: any = await this.foldersService.create(folders[folderId]);
                if(folder) {
                    const nzbFileId: string   = folders[folderId].file_id;
                    const id: string          = folder._id;
                    const folder_path: string = folder.folder[0].folder_id;
                    const folderSize: number  = folder.folder[0].folder_size;
                    const storage: string     = folder.type;
                    const fileData: any       = {
                        folder_id   : id,
                        folder_path : folder_path,
                        size        : folderSize,
                        cloud       : storage
                    };
                    this.filesService.updateFile(nzbFileId, fileData);
                    this.sendNotification(nzbFileId, folders[folderId].folder[0].folder_id, storage);
                }
            }
        }
    }

    /**
     * Get folders
     *
     * @param res
     * @param data
     * @returns {Promise<void>}
     */
    @Post('get')
    public async getFolders(@Response() res: any, @Body() data: any): Promise<any> {
        const storage: string     = data.type;
        const userId: string      = data.user_id;
        const offset: number      = data.offset ? data.offset - 1 : 0;
        const limit: number       = data.limit ? data.limit : 9;
        const conditaion: any     = {
            user_id: userId,
            type: storage
        };
        const folderCount: number = await this.foldersService.getUserFolderCount(conditaion);
        const foldersData: any    = await this.foldersService.findBy(conditaion, offset, limit);
        let folders: any          = [];

        for (let i = 0; i < foldersData.length; i++) {
            if(foldersData[i].folder[0]) {
                foldersData[i].folder[0]._id = foldersData[i]._id;
                foldersData[i].folder[0].opened = foldersData[i].opened;
                folders.push(foldersData[i].folder)
            }
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            folders    : folders,
            count      : folderCount,
        });
    }

    /**
     * Delete folder
     *
     * @param res
     * @param data
     * @returns {foldersData<void>}
     */
    @Post('delete-folder')
    public async deleteFolder(@Response() res: any, @Body() foldersData: any): Promise<any> {
        if(foldersData.length) {
            const self: any = this;
            foldersData.forEach(function(data: any) {
                if(data.storage || data.cloud == 's3') {
                    self.deleteFromStorage(data.cloud, data.id);
                }
            });

            self.foldersService.updateFolderSizeAndCount(foldersData);

            return res.status(HttpStatus.ACCEPTED).send({
                status     : true,
                httpStatus : HttpStatus.OK
            });
        } else {
            return res.status(HttpStatus.ACCEPTED).send({
                status     : true,
                httpStatus : HttpStatus.NOT_MODIFIED
            });
        }
    }

    /**
     * Delete folders by storage type
     *
     * @param res
     * @param data
     * @returns {foldersData<void>}
     */
    @Post('delete-folders-by-storage')
    public async deleteFoldersByStorage(@Response() res: any, @Body() foldersData: any): Promise<any> {
        let data: any;
        let conditaion: any;

        if(foldersData.storage_type == 'gdrive') {
            data = {
                user_id: foldersData.user_id,
                storage: 'google-drive',
            };
            conditaion = {
                user_id : foldersData.user_id,
                type    : 'google-drive',
            };
        } else {
            data = {
                user_id: foldersData.user_id,
                storage: foldersData.storage_type,
            };
            conditaion = {
                user_id : foldersData.user_id,
                type    : foldersData.storage_type
            };
        }
        const foldersDatas: any = await this.foldersService.findBy(conditaion, 0, 1000);

        if(foldersDatas[0]) {
            let result: any = [];

            if(foldersData.storage_type == 'gdrive' || foldersData.storage_type == 'onedrive') {
                let storage: string;

                if(foldersData.storage_type == 'gdrive') {
                    storage = 'google-drive';
                } else {
                    storage = 'onedrive';
                }

                function findById(object: any, field: string) {
                    for (let p in object) {
                        if (object[field]) {
                            return result.push(object[field]);
                        }
                        if (typeof object[p] === 'object') {
                            findById(object[p], field);
                        }
                    }
                }

                findById(foldersDatas[0].folder, 'file_id');

                result.forEach((id: string) => {
                    this.deleteFolderFromStorage(storage, id, foldersData.user_id);
                });
            } else {
                result = foldersDatas[0].folder_name;
                this.deleteFolderFromStorage(foldersData.storage_type, result, foldersData.user_id);
            }
        }

        this.foldersService.removeFoldersByStorage(data);
        this.filesService.removeFilesByStorage(data);

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * Delete file from storage
     *
     * @param cloud
     * @param id
     */
    public deleteFolderFromStorage(cloud: string, id: string, userId: string) {
        let url: any;
        const data: any = {
            user_id: userId,
            path : id
        };

        if(ENV.production) {
            url = ENV.external_storage_host + ':' + ENV.external_storage_port + '/' + cloud + '/delete-folder';
        } else {
            url = ENV.dev_external_storage_host + ':' + ENV.dev_external_storage_port + '/' + cloud + '/delete-folder';
        }

        const clientServerOptions: any = {
            json                    : true,
            method                  : 'POST',
            uri                     : url,
            form                    : data,
            resolveWithFullResponse : true,
            strictSSL: false
        };

        rp(clientServerOptions);
    }

    /**
     * Delete file from storage
     *
     * @param cloud
     * @param id
     */
    public deleteFromStorage(cloud: string, id: string) {
        let url: any;
        const data: any = {
            file_id : id
        };

        if(ENV.production) {
            url = ENV.external_storage_host + ':' + ENV.external_storage_port + '/' + cloud + '/delete-file';
        } else {
            url = ENV.dev_external_storage_host + ':' + ENV.dev_external_storage_port + '/' + cloud + '/delete-file';
        }

        const clientServerOptions: any = {
            json                    : true,
            method                  : 'POST',
            uri                     : url,
            form                    : data,
            resolveWithFullResponse : true,
            strictSSL: false
        };

        rp(clientServerOptions);
    }

    /**
     * Get File from folder
     *
     * @param res
     * @param body
     * @returns {Promise<void>}
     */
    @Post('get-file')
    public async getFileData(@Response() res: any, @Body() body: any): Promise<any> {
        let fileData: any      = [];
        const fileId: string   = body.file_id;
        const folderId: string = body.folder_id;
        const folderData: any  = await this.foldersService.findBy({
            '_id': folderId,
        });

        if(folderData.length) {
            const file: any = this.getFileDataFromFolder(folderData[0].folder, fileId);

            if(file) {
                const cloud: string = file.cloud_type == 'gdrive' ? 'google-drive' : file.cloud_type;
                fileData = {
                    id    : file.file_id,
                    url   : file.video_url,
                    title : file.name,
                    cloud : cloud,
                    hash  : false,
                    size  : this.humanFileSize(file.size),
                    path  : file.obj_path
                };

                if(file.video_hash) {
                    fileData.hash = file.video_hash;
                }
            }
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            file       : fileData
        });
    }

    /**
     * Get user nzbcloud storage used space
     *
     * @param userId
     * @param res
     */
    @Get('/get-nzbcloud-used-space/:userId')
    @Bind(Param('userId'))
    public async getNzbCloudUsedSpace(userId: string, @Response() res: any): Promise<any> {
        const nzbCloudSpace: any = await this.foldersService.getNzbCloudUsedSpace(userId);

        return res.status(HttpStatus.ACCEPTED).send({
            status         : true,
            httpStatus     : HttpStatus.OK,
            usedSpace      : nzbCloudSpace
        });
    }

    /**
     * Get not opened folder count
     *
     * @param userId
     * @param res
     */
    @Get('/get-not-opened-count/:userId')
    @Bind(Param('userId'))
    public async getNotOpenedCount(userId: string, @Response() res: any): Promise<any> {
        const count: number = await this.foldersService.getNotOpenedCount(userId);

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            count      : count
        });
    }

    /**
     * Update folder
     *
     * @param userId
     * @param res
     * @param userPersonalSettings
     * @returns {Promise<void>}
     */
    @Post('update/:userId')
    @Bind(Param('userId'))
    public async updateFolder(userId: string, @Response() res: any, @Body() folderData: any): Promise<any> {
        this.foldersService.updateFolderById(userId, folderData);

        res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * User friendly size format
     *
     * @param bytes
     * @param si
     * @returns {string}
     */
    public humanFileSize(bytes: number, si: any = true) {
        const thresh: number = si ? 1000 : 1024;

        if(Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units: any = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

        let u: number    = -1;

        do {
            bytes /= thresh;
            ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);

        return bytes.toFixed(1) + ' ' + units[u];
    }

    /**
     * Get file data from folder object
     *
     * @param folders
     * @param fileId
     */
    public getFileDataFromFolder(folders: any, fileId: string) {
        function getObjects(object: any, key: any, value: any) {
            let objects: any = [];
            for (var i in object) {
                if (!object.hasOwnProperty(i)) {
                    continue;
                };

                if (typeof object[i] == 'object') {
                    objects = objects.concat(getObjects(object[i], key, value));
                }

                if (i == key && object[i] == value || i == key && value == '') {
                    objects.push(object);
                } else if (object[i] == value && key == ''){
                    if (objects.lastIndexOf(object) == -1){
                        objects.push(object);
                    }
                }
            }
            return objects;
        }

        const file: any = getObjects(folders, 'id', fileId);

        return file[0];
    }

    /**
     * Send user notification
     *
     * @param nzbFileId
     * @param folderId
     * @param storage
     */
    public sendNotification(nzbFileId: string, folderId: string, storage: string) {
        let url: any;

        const data: any = {
            file_id   : nzbFileId,
            folder_id : folderId,
            storage   : storage,
            status    : 'Success'
        };

        if(ENV.production) {
            url = ENV.production_host + ':' + ENV.production_port + '/api/notifications/send-notification';
        } else {
            url = ENV.dev_host + ':' + ENV.dev_port + '/api/notifications/send-notification';
        }

        const clientServerOptions: any = {
            json                    : true,
            method                  : 'POST',
            uri                     : url,
            form                    : data,
            resolveWithFullResponse : true,
            strictSSL: false
        };
        rp(clientServerOptions);
    }
}
