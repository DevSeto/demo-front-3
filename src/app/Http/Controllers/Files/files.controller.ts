import { Controller, Get, Post, HttpStatus, Response, Request, Bind, Param, Body } from '@nestjs/common';
import { NzbGetsService } from '../../../Services/nzbgets.service';
import { FilesService } from '../../../Services/files.service';
import { NzbFilesService } from '../../../Services/nzb-files.service';
import { FoldersService } from '../../../Services/folders.service';
import { MessageCode } from '../../../Helpers/responseMessages/MessageCode';
import { ENV } from '../../../../config';
import * as rp from 'request-promise';
import * as request from 'request';
import * as fs from 'fs';
import * as temp from 'temp';
import * as md5File from 'md5-file/promise';

@Controller('/api/files')
export class FilesController {

    public nzbGetUrl: string;

    constructor(
        private readonly filesService    : FilesService,
        private readonly nzbFilesService : NzbFilesService,
        private readonly foldersService  : FoldersService,
        private readonly nzbGetsService  : NzbGetsService
    ) {
        this.nzbGetUrl = ENV.nzbget_server + ':' + ENV.nzbget_server_port + '/jsonrpc';
    }

    /**
     * Create nzb torrent
     *
     * @param res
     * @param req
     * @returns {Promise<void>}
     */
    @Post('upload-nzb')
    public async uploadNzb(@Response() res: any, @Request() req: any): Promise<any> {
        if (!req.files) {
            const error: any = MessageCode.getMessageFromMessageCode('files:missingFile');
            return res.json(error);
        }
        const self: any      = this;
        const userId: string = req.body.user_id;
        let files: any       = req.files['files[]'];

        if(!Array.isArray(files)) {
            const file: any = files;
            files           = [];

            files.push(file);
        }

        for(let file of files) {
            const fileId: any = await this.createFileId(file);

            const fileData: any = {
                user_id   : userId,
                file_name : file.name,
                file      : file.data,
                file_id   : fileId,
                cloud     : 's3'
            };

            this.nzbFilesService.create(fileData);
        }

        const fileResponse: any = MessageCode.getMessageFromMessageCode('files:successfullyUploaded');
        return res.json(fileResponse);
    }

    /**
     * Create file id by md5 file content
     *
     * @param file
     */
    public async createFileId(file: any) {
        temp.track();

        const stream: any = temp.createWriteStream();

        stream.write(file.data);
        stream.end();

        if(!fs.existsSync(stream.path)) {
           return this.createFileId(file);
        }

        return new Promise((resolve, reject) => {
            md5File(stream.path).then((hash: any) => {
                resolve(hash);
            })
        });
    }

    /**
     * Upload from url
     *
     * @param nzbUrl
     */
    public async uploadByUrl(nzbUrl: string) {
        const fileData: any = {
            method  : 'append',
            nocache : Date.now(),
            params  : [
                '',
                nzbUrl,
                '',
                0,
                false,
                false,
                '',
                0,
                'SCORE'
            ]
        };
        const clientServerOptions: any = {
            uri     : this.nzbGetUrl,
            body    : JSON.stringify(fileData),
            method  : 'POST',
            headers : {
                'Content-Type': 'application/json'
            }
        };

        return new Promise((resolve, reject) => {
            request(clientServerOptions, function (error: any, response: any, body: any) {
                const nzbFileId: number = JSON.parse(body).result;

                resolve(nzbFileId);
            });
        });
    }

    /**
     * Get nzb information
     *
     * @param nzbId
     * @param nzbUrl
     * @param userId
     */
    public async getNzbData(nzbId: number, nzbUrl: string, userId: string): Promise<any> {
        const md5File: any     = require('md5-file');
        const temp: any        = require('temp');
        const fileContent: any = await this.getFileContentFromUrl(nzbUrl);
        const folderData: any  = {
            method  : 'listgroups',
            nocache : Date.now(),
            params  : [
                0,
                [nzbId]
            ]
        };

        const clientServerOptions: any = {
            uri     : this.nzbGetUrl,
            body    : JSON.stringify(folderData),
            method  : 'POST',
            headers : {
                'Content-Type': 'application/json'
            }
        };


        return new Promise((resolve, reject) => {
            request(clientServerOptions, (error: any, response: any, body: any) => {
                const result: any = JSON.parse(body).result;

                if(result.length && result[0].FileSizeLo > 0) {
                    temp.track();

                    const stream: any = temp.createWriteStream();

                    stream.write(fileContent);
                    stream.end();

                    const fileId: string = md5File.sync(stream.path);
                    const fileData: any  = {
                        user_id   : userId,
                        file_name : result[0].NZBName,
                        file      : fileContent,
                        file_id   : fileId,
                        size      : result[0].FileSizeLo,
                        cloud     : 's3'
                    };

                    this.nzbFilesService.create(fileData);

                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Delete nzb
     *
     * @param nzbId
     */
    public deleteNzb(nzbId: number) {
        const data: any                = {
            method  : 'editqueue',
            nocache : Date.now(),
            params  : [
                'GroupFinalDelete',
                '',
                [nzbId]
            ]
        };
        const clientServerOptions: any = {
            uri     : this.nzbGetUrl,
            body    : JSON.stringify(data),
            method  : 'POST',
            headers : {
                'Content-Type': 'application/json'
            }
        };

        request(clientServerOptions)
    }

    /**
     * Create nzb torrent by url
     *
     * @param res
     * @param req
     * @returns {Promise<void>}
     */
    @Post('upload-nzb-by-url')
    public async uploadNzbByUrl(@Response() res: any, @Request() req: any): Promise<any> {
        if (!req.url) {
            const error: any = MessageCode.getMessageFromMessageCode('files:missingFile');
            return res.json(error);
        }

        const userId: string = req.body.user_id;
        const nzbUrl: string = req.body.url;

        if(!this.isValidUrl(nzbUrl)) {
            const fileResponse: any = MessageCode.getMessageFromMessageCode('files:missingFile');
            return res.json(fileResponse);
        }

        const nzbId: any   = await this.uploadByUrl(nzbUrl);
        const nzbData: any = await this.getNzbData(nzbId, nzbUrl, userId);

        this.deleteNzb(nzbId);

        if(nzbData) {
            const fileResponse: any = MessageCode.getMessageFromMessageCode('files:successfullyUploaded');
            return res.json(fileResponse);
        } else {
            const fileResponse: any = MessageCode.getMessageFromMessageCode('files:missingFile');
            return res.json(fileResponse);
        }
    }

    /**
     * Check if url is valid
     *
     * @param url
     */
    public isValidUrl(url: string) {
        const regex: any = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

        if(!regex.test(url)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Get file content
     *
     * @param url
     */
    public getFileContentFromUrl(url: string) {
        return new Promise((resolve, reject) => {
            const http: any  = require('http');
            const https: any = require('https');
            let client: any  = http;

            if (url.toString().indexOf("https") === 0) {
                client = https;
            }

            client.get(url, (resp: any) => {
                let data = '';

                resp.on('data', (chunk: any) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    resolve(data);
                });

            }).on("error", (error: any) => {
                reject(error);
            });
        });
    }

    /**
     * Update nzb storage
     *
     * @param res
     * @param req
     * @returns {Promise<void>}
     */
    @Post('update-nzb-storage')
    public async updateNzbSorage(@Response() res: any, @Body() body: any): Promise<any> {
        const fileId: string = body.file_id;
        const cloud: string  = body.cloud;

        this.nzbFilesService.updateNzbCloud(fileId, cloud);

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
        });
    }

    /**
     * Download nzb files
     *
     * @param userId
     * @param res
     */
    @Get('/download-nzb-files/:userId')
    @Bind(Param('userId'))
    public async downloadNzb(userId: string, @Response() res: any): Promise<any> {
        const self: any        = this;
        const files: any       = await this.nzbFilesService.getUserNzbFilesByUserId(userId, {
            file_name : 1,
            file      : 1,
            file_id   : 1,
            cloud     : 1,
            _id       : 1
        });
        const priority: number = 100;

        const curentActiveDownloads: any = await this.filesService.findByAll({
            status  : 'download',
            user_id : userId
        });

        files.forEach(function(file: any) {
            self.upload(file, userId,priority - curentActiveDownloads.length);
        });

        this.nzbFilesService.deleteBy({ user_id: userId});

        const fileResponse: any = MessageCode.getMessageFromMessageCode('files:successfullyUploaded');
        return res.json(fileResponse);
    }

    /**
     * Get last downloads
     *
     * @param userId
     * @param res
     */
    @Get('/get-last-downloads/:userId')
    @Bind(Param('userId'))
    public async lastDownloads(userId: string, @Response() res: any): Promise<any> {
        const lastDownloads: any = await this.filesService.getUserFilesByUserId(userId, 4);
        const count: number      = await this.filesService.getUserFilesCountByUserId(userId);

        return res.status(HttpStatus.ACCEPTED).send({
            status         : true,
            httpStatus     : HttpStatus.OK,
            last_downloads : lastDownloads,
            count          : count
        });
    }


    /**
     * Get all downloads
     *
     * @param userId
     * @param res
     */
    @Get('/get-all-downloads/:userId')
    @Bind(Param('userId'))
    public async allDownloads(userId: string, @Response() res: any): Promise<any> {
        const allDownloads: any = await this.filesService.getUserFilesByUserId(userId, 100);

        return res.status(HttpStatus.ACCEPTED).send({
            status         : true,
            httpStatus     : HttpStatus.OK,
            last_downloads : allDownloads
        });
    }

    /**
     * Delete last downloads
     *
     * @param res
     * @param req
     * @returns {Promise<void>}
     */
    @Post('/delete-last-downloads')
    public async deleteLastDownloads(@Response() res: any, @Request() req: any): Promise<any> {
        if(req.body.folder_id) {
            const folderId: any = req.body.folder_id;

            this.filesService.deleteFile(folderId);

            return res.status(HttpStatus.ACCEPTED).send({
                status     : true,
                httpStatus : HttpStatus.OK,
            });
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status     : false,
            httpStatus : HttpStatus.OK,
        });
    }

    /**
     * Get user nzb files
     *
     * @param userId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('/get-nzb-files/:userId')
    @Bind(Param('userId'))
    public async getNzbFiles(userId: string, @Response() res: any): Promise<any> {
        const filesData: any = await this.nzbFilesService.getUserNzbFilesByUserId(userId, {
            file_name : 1,
            cloud     : 1,
            _id       : 1
        });

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            files      : filesData
        });
    }

    /**
     * Delete user nzb file
     *
     * @param id
     * @param res
     * @returns {Promise<void>}
     */
    @Get('/delete-nzb-file/:id')
    @Bind(Param('id'))
    public async deleteNzbFile(id: string, @Response() res: any): Promise<any> {
        this.nzbFilesService.delete(id);

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * Delete user file
     *
     * @param id
     * @param res
     * @returns {Promise<void>}
     */
    @Post('/delete-file')
    public async deleteFile(@Response() res: any, @Body() body: any): Promise<any> {
        this.filesService.deleteFileByNzbId({
            user_id     : body.user_id,
            nzb_file_id : body.id
        });

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * Delete all user nzb files
     *
     * @param userId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('/delete-all-nzb-files/:userId')
    @Bind(Param('userId'))
    public async deleteAllNzbFiles(userId: string, @Response() res: any): Promise<any> {
        this.nzbFilesService.deleteBy({ user_id: userId});

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * Check if file have child download
     *
     * @param fileId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('/check-file-child/:fileId')
    @Bind(Param('fileId'))
    public async checkIfFileHaveChild(fileId: string, @Response() res: any): Promise<any> {
        const file: any    = await this.filesService.findBy({
            nzb_file_id : fileId
        });
        let check: boolean = false;

        if(Object.keys(file).length) {
            const files: any = await this.filesService.findByAll({
                file_id : file.file_id
            });

            if(Object.keys(files).length > 1) {
                check = true
            }
        }


        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            check      : check
        });
    }

    /**
     * Upload nzb torrent
     *
     * @param file
     * @param userId
     */
    public async upload(file: any, userId: string, priority: number) {
        const fs: any             = require('fs');
        const path: any           = require('path');
        const ursa: any           = require('ursa');
        const appDir: string      = path.dirname(require.main.filename);
        const privateKey: string  = fs.readFileSync(appDir + '/../private.pem').toString();
        const self: any           = this;
        const cloud: string       = file.cloud;
        const filesService: any   = this.filesService;
        const foldersService: any = this.foldersService;
        const fileContent: any    = Buffer.from(file.file).toString('base64');
        const fileData: any       = {
            method  : 'append',
            nocache : Date.now(),
            params  : [
                userId + '____' + file.file_name,
                fileContent,
                '',
                priority,
                false,
                false,
                '',
                0,
                'SCORE'
            ]
        };
        const usenetServers: any  = await this.nzbGetsService.findBy({ user_id: userId });

        const checkIfExistActiveDownload: any = await filesService.findByAll({
            status      : 'download',
            file_id     : file.file_id,
            cloud       : 's3',
            a_d_user_id : ''
        });

        if(checkIfExistActiveDownload.length) {
            const data: any = checkIfExistActiveDownload[0];
            const fileData: any = {
                nzb_file_id : data.nzb_file_id,
                a_d_user_id : data.user_id,
                user_id     : userId,
                file_id     : data.file_id,
                file_name   : data.file_name,
                cloud       : cloud
            };

            filesService.create(fileData);
        } else {
            if(usenetServers.length) {
                let i: number         = 1;
                let usenetServer: any = [];

                usenetServers.forEach(function (server: any) {
                    const key: any = ursa.createPrivateKey(fs.readFileSync(appDir + '/../private.pem'));

                    usenetServer.push({
                        ['*Server' + i + '.name:']           : server.server_name,
                        ['*Server' + i + '.host:']           : server.server_host,
                        ['*Server' + i + '.port:']           : server.server_port,
                        ['*Server' + i + '.user:']           : key.privateEncrypt(server.server_username, 'utf8', 'base64'),
                        ['*Server' + i + '.pass:']           : key.privateEncrypt(server.server_password, 'utf8', 'base64'),
                        ['*Server' + i + '.maxConnections:'] : server.server_connection_limit,
                        [ '*OwnUserId:']                     : userId,
                    });
                    i++;
                });

                fileData.params.push(usenetServer);
            }
            const clientServerOptions: any = {
                uri     : this.nzbGetUrl,
                body    : JSON.stringify(fileData),
                method  : 'POST',
                headers : {
                    'Content-Type': 'application/json'
                }
            };

            request(clientServerOptions, function (error: any, response: any, body: any) {
                const nzbFileId: string        = JSON.parse(body).result;
                const fileData: any            = {
                    nzb_file_id : nzbFileId,
                    user_id     : userId,
                    file_id     : file.file_id,
                    file_name   : file.file_name,
                    cloud       : cloud
                };

                filesService.create(fileData);

                const folderData: any          = {
                    method  : 'history',
                    nocache : Date.now(),
                    params  : [
                        0,
                        nzbFileId
                    ]
                };
                const clientServerOptions: any = {
                    uri     : self.nzbGetUrl,
                    body    : JSON.stringify(folderData),
                    method  : 'POST',
                    headers : {
                        'Content-Type': 'application/json'
                    }
                };

                request(clientServerOptions, function (error: any, response: any, body: any) {
                    const regexStart: any = /"result" : ((.|\n)*)"ID"/gm;

                    if(regexStart.test(body)) {
                        body                     = body.replace(regexStart,'"result":[{"ID"');
                        const regexEnd: any      = /[^ServerStats" : ]*$/;
                        body                     = body.replace(regexEnd,'[]}]}');
                        const result: any        = JSON.parse(body).result[0];
                        const fileStatus: string = result.Status;

                        if(fileStatus.indexOf('COPY') > -1) {
                            let folderName: string = result.NZBName.split('____');
                            if(folderName[1] !== '') {
                                folderName = folderName[1];
                            } else {
                                folderName = folderName[0];
                            }

                            foldersService.shareFolder(folderName,userId);
                            self.sendNotification(nzbFileId);
                        }
                    }
                });

                setTimeout(function () {
                    const nzbData: any       = {
                        method  : 'editqueue',
                        nocache : Date.now(),
                        params  : [
                            'GroupResume',
                            '',
                            [nzbFileId]
                        ]
                    };
                    const clientOptions: any = {
                        uri     : ENV.nzbget_server + ':' + ENV.nzbget_server_port + '/jsonrpc',
                        body    : JSON.stringify(nzbData),
                        method  : 'POST',
                        headers : {
                            'Content-Type': 'application/json'
                        }
                    };

                    request(clientOptions);
                }, 2000);
            });
        }
    }

    /**
     * Send user notification
     *
     * @param nzbFileId
     */
    public sendNotification(nzbFileId: string) {
        let url: string;

        const data: any = {
            file_id: nzbFileId
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

    /**
     * Get difference of two arrays
     *
     * @param first
     * @param second
     */
    public difference(first: any, second: any) {
        let result: any = [];

        for (let i = 0; i < first.length; i++) {
            if (second.indexOf(first[i]) === -1) {
                result.push(first[i]);
            }
        }

        return result;
    }

    /**
     * Get user files id
     *
     * @param userId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('/get-files-id/:userId')
    @Bind(Param('userId'))
    public async getUserFilesId(userId: string, @Response() res: any): Promise<any> {
        const filesData: any               = await this.filesService.getUserFilesIdByUserId(userId);
        let activeDownloadUserId: string   = '';

        if(filesData.length) {
            activeDownloadUserId = filesData.filter(function(file: any) {
                return file.a_d_user_id !== '' ? file.a_d_user_id : false;
            }).map(function(file: any) {
                return file.a_d_user_id;
            })[0];
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status      : true,
            httpStatus  : HttpStatus.OK,
            files       : filesData,
            a_d_user_id : activeDownloadUserId,
        });
    }
}
