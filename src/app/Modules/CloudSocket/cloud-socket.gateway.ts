import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import * as request from 'request';
import { ENV } from '../../../config';
import { Socket } from 'socket.io';
import { CloudSocketService } from  './service/cloud-socket.service';

@WebSocketGateway()
export class CloudSocketGateway {

    @WebSocketServer() server: any;

    public url: string;
    public storage: string;
    public statusOfDownloadFile: any;
    public userId: any;
    public fileHistory: any;
    public fileIds: any             = [];
    public foldersData: any         = [];
    public filesData: any           = [];
    public clouds: any              = [];
    public activeDownloadsList: any = [];

    public constructor(
        private cloudSocketService: CloudSocketService
    ) {}


    /**
     * Event on connection
     *
     * @param client
     */
    public handleConnection(client: any): void {
        this.userId = client.handshake.query.user_id;

        if(ENV.production) {
            this.url = ENV.external_storage_host + ':' + ENV.external_storage_port;
        } else {
            this.url = ENV.dev_external_storage_host + ':' + ENV.dev_external_storage_port;
        }

        this.server.use((socket: any, next: any) => {
            socket.join(socket.id);
            next();
        });
    }

    @SubscribeMessage('pass-data')
    onEvent(client: Socket, data: any) {
        const userId: string = data.user_id;

        this.filesData[userId] = data.files;
        this.fileIds[userId]   = data.files.map(function(file: any){
            return file.nzb_file_id
        });
        this.clouds[userId]    = data.files.map(function(file: any){
            return file.cloud;
        });
        this.clouds[userId]    = Array.from(new Set(this.clouds[userId]));

        this.getProgress(data.user_id, client);
    }

    @SubscribeMessage('edit-queued')
    public async editQeued(client: any, data: any) {
        const self: any      = this;
        const action: string = data[0];
        const ids: any       = data[2];
        const userId: string = data[1];
        data[1]              = '';

        this._NZBRequest('editqueue', data).then(() => {
            if(action == 'GroupFinalDelete') {
                ids.forEach((id: number) => {
                    self.updateFileStatus(id, 'deleted', userId);
                });
            }
        });
    }

    @SubscribeMessage('delete-for-me')
    public async deleteFromRedis(client: any, data: any) {
        const action: string = data[0];
        const ids: any       = data[2];
        const userId: string = data[1];
        let downloads: any   = await this.cloudSocketService.getRoomData(userId);

        ids.forEach((id: number) => {
            const index: any = downloads.map(function (item: any) { return item.id; }).indexOf(id);
            downloads.splice(index, 1);
            this.cloudSocketService.updateRoom(userId, downloads);
        });
    }

    /**
     * Check if object is iterable
     *
     * @param object
     */
    public isIterable(object: any) {
        if (object == null) {
            return false;
        }

        return typeof object[Symbol.iterator] === 'function';
    }

    /**
     * Get file progress
     */
    public async getProgress(userId: any, client: Socket) {
        let ids: any       = [];
        let downloads: any = await this.cloudSocketService.getRoomData(userId);

        this.status().then((response: any) => {
            this.statusOfDownloadFile = response;
        });

        this.history().then((response: any) => {
            this.fileHistory = response;

            if (this.fileHistory && this.fileHistory.length > 0 && this.foldersData.length) {
                for (let data of this.foldersData) {
                    const fileHistory: any = this.getFileStatus(data.file_id);

                    if (fileHistory && fileHistory.Status.indexOf('SUCCESS') > -1) {
                        this.storingFiles(userId, data);
                        this.removeFileId(userId, data.file_id);
                    } else if(fileHistory) {
                        this.sendNotification(data.file_id, 'failure');
                        this.removeFileId(userId, data.file_id);

                        if(downloads.length >= 0) {
                            const index: any = downloads.map(function (item: any) { return item.id; }).indexOf(data.file_id);

                            downloads.splice(index, 1);
                            this.cloudSocketService.updateRoom(userId, downloads);
                        }

                        client.emit('failure', {
                            id: data.file_id
                        });
                    }
                }
            }
        });

        for(let cloud of this.clouds[userId]) {
            const downloadsCloud: any = await this._Request('cloud-files', userId, cloud);

            if(downloadsCloud.length) {
                for(let files of downloadsCloud) {
                    const index: any = downloads.map(function (item: any) { return item.id; }).indexOf(files.id);

                    if(!files.finish) {
                        if(index < 0) {
                            downloads.push(files);
                        } else {
                            downloads[index] = files;
                        }

                        if (ids.indexOf(files.id)) {
                            ids[files.id] = files.id;
                        } else {
                            ids.push(files.id);
                        }
                    } else {
                        const index: any   = downloads.map(function (item: any) { return item.id; }).indexOf(files.id);
                        downloads.splice(index, 1);

                        client.emit('finish', {
                            id: files.id
                        });
                    }
                }
            }
        }

        this.cloudSocketService.updateRoom(userId, downloads);

        const postData: any = [
            0,
            this.fileIds[userId]
        ];
        const nzbFiles: any = await this._NZBRequest('listgroups', postData);

        if(Object.keys(nzbFiles).length && this.statusOfDownloadFile) {
            for (let file of nzbFiles) {
                if (file) {
                    let title: any  = file['NZBName'].split('____');

                    if(!title[1] && title[1] !== userId) {
                        break;
                    }

                    if(title[0] !== userId) {
                        break;
                    }

                    title                       = title[1];
                    const fileSize: string      = this.formatSizeMB(file['FileSizeMB'], file['FileSizeLo']);
                    const remainingSize: string = this.formatSizeMB(file['FileSizeMB'] - file['RemainingSizeMB'], file['FileSizeLo']);
                    let fileStatus: string      = file['Status'].charAt(0).toUpperCase() + file['Status'].slice(1).toLowerCase();
                    const estimation: string    = this.formatTimeLeft((file['RemainingSizeMB'] - file['PausedSizeMB']) * 1024 / (this.statusOfDownloadFile.DownloadRate / 1024));
                    const fileId: any           = file['NZBID'];
                    const downloadRate: number  = this.statusOfDownloadFile.DownloadRate;
                    let downloadSpeed: string   = this.formatSpeed(downloadRate, fileStatus);
                    const percent: number       = Math.ceil((file['FileSizeMB'] - file['RemainingSizeMB'])/file['FileSizeMB'] * 100);
                    let isPaused: boolean       = false;

                    if (file['Status'] == 'PAUSED') {
                        isPaused = true;
                    }

                    if (fileStatus != 'Downloading' && fileStatus != 'Queued' && fileStatus != 'Paused') {
                        fileStatus = 'Extracting';
                    }

                    if (fileStatus != 'Downloading') {
                        downloadSpeed = '';
                    }

                    const fileProgress: any = {
                        id             : fileId,
                        is_paused      : isPaused,
                        estimation     : estimation,
                        status         : fileStatus,
                        name           : title,
                        percent        : percent,
                        download_speed : downloadSpeed,
                        file_size      : fileSize,
                        remaining_size : remainingSize
                    };

                    if (ids.indexOf(fileId) > -1) {
                        ids[ids.indexOf(fileId)] = fileId;
                    } else {
                        ids.push(fileId);
                    }

                    const index: any = downloads.map(function (item: any) { return item.id; }).indexOf(fileId);
                    if(index < 0) {
                        downloads.push(fileProgress);
                    } else {
                        downloads[index] = fileProgress;
                    }

                    this.cloudSocketService.updateRoom(userId, downloads);

                    const flIndex: any = this.foldersData.map(function (item: any) { return item.file_id; }).indexOf(fileId);
                    if(flIndex < 0) {
                        this.foldersData.push({
                            file_id     : fileId,
                            user_id     : userId,
                            folder_name : file['NZBName']
                        });
                    } else {
                        this.foldersData[flIndex] = {
                            file_id     : fileId,
                            user_id     : userId,
                            folder_name : file['NZBName']
                        };
                    }
                }
            }
        }

        if (ids.length == 0) {
            this.cloudSocketService.updateRoom(userId, []);
        }

        if (downloads.length) {
            client.emit('cloud-files', downloads);
        }
    }

    /**
     * @return array
     */
    public status(postData: any = []) {
        return this._NZBRequest('status', postData);
    }

    /**
     * @param postData array
     *
     * @return array
     */
    public history(postData: any = []) {
        return this._NZBRequest('history', postData);
    }

    /**
     * @param method string
     * @param postData array
     */
    public _NZBRequest(method: string, postData: any = []) {
        const params: any              = postData.params ? postData.params.split('.') : (postData ? postData : []);
        const clientServerOptions: any = {
            json                    : true,
            method                  : 'POST',
            uri                     : ENV.nzbget_server + ':' + ENV.nzbget_server_port + '/jsonrpc',
            form                    : JSON.stringify({'method': method, 'nocache': (new Date).getTime(), 'params': params}),
            resolveWithFullResponse : true
        };

        return new Promise((resolve, reject) => {
            request(clientServerOptions, function (error: any, response: any, body: any) {
                if(body && body.result) {
                    resolve(body.result);
                } else {
                    resolve([]);
                }
            });
        });
    }

    /**
     *
     * @param method
     * @param userId
     * @private
     */
    public async _Request(method: string, userId: string, cloud: string) {
        const options: any = {
            method             : 'POST',
            rejectUnauthorized : false,
            url                : '',
            form               : {
                user_id: userId
            }
        };

        return new Promise((resolve, reject) => {
            if (cloud == 'gdrive') {
                cloud = 'google-drive';
            }

            options.url = this.url + '/' + cloud + '/get-process';

            request(options, function (error: any, response: any, body: any) {
                if (!error && response.statusCode == 200 && body !== '') {
                    body = JSON.parse(body);

                    resolve(body);
                }
            });
        });
    }

    /**
     * Get status of file
     *
     * @param fileId
     * @returns {any}
     */
    public getFileStatus(fileId: any) {
        const fileHistory: any = this.fileHistory.filter(
            function (file: any) {
                if (file.ID == fileId) {
                    return file;
                }
            }
        );

        return fileHistory[0];
    }

    /**
     * Edit
     *
     * @param params
     */
    public editNzbQueue(params: any) {
        return this._NZBRequest('editqueue', params);
    }

    /**
     * Storing file to cloud
     *
     * @param fileId
     */
    public storingFiles(userId: string, fileId: any) {
        const self: any   = this;
        const key: number = this.getKey(userId, fileId.file_id);

        if(this.filesData[userId][key]) {
            let storage: any  = this.filesData[userId][key].cloud;

            if(storage == 'gdrive') {
                storage = 'google-drive';
            }

            if(!this.url) {
                if(ENV.production) {
                    this.url = ENV.external_storage_host + ':' + ENV.external_storage_port;
                } else {
                    this.url = ENV.dev_external_storage_host + ':' + ENV.dev_external_storage_port;
                }
            }

            const url: string  = this.url + '/' + storage + '/storing-files';
            const options: any = {
                json                    : true,
                method                  : 'POST',
                rejectUnauthorized      : false,
                uri                     : url,
                form                    : fileId,
                resolveWithFullResponse : true
            };

            request(options);
        }
    }

    /**
     * Get key from object
     *
     * @param id
     */
    public getKey(userId: string, id: number) {
        const countOfUploads: number = this.filesData[userId].length;

        for (let i = 0; i < countOfUploads; i++) {
            if (this.filesData[userId][i].nzb_file_id == id) return i;
        }
    }

    /**
     * Send user notification
     *
     * @param nzbFileId
     * @param status
     */
    public sendNotification(nzbFileId: string, status: string) {
        let url: any;

        const data: any = {
            file_id: nzbFileId,
            status: status
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
            rejectUnauthorized      : false,
            resolveWithFullResponse : true
        };
        request(clientServerOptions);
    }

    /**
     * Update file status
     *
     * @param id
     * @param status
     */
    public async updateFileStatus(id: number, status: string, userId: string) {
        let url: any;

        const data: any = {
            id      : id,
            user_id : userId,
            status  : status
        };

        if(ENV.production) {
            url = ENV.production_host + ':' + ENV.production_port + '/api/nzbget/update-file-status';
        } else {
            url = ENV.dev_host + ':' + ENV.dev_port + '/api/nzbget/update-file-status';
        }

        const clientServerOptions: any = {
            json                    : true,
            method                  : 'POST',
            uri                     : url,
            form                    : data,
            rejectUnauthorized      : false,
            resolveWithFullResponse : true
        };

        request(clientServerOptions);

        let downloads: any = await this.cloudSocketService.getRoomData(userId);
        const index: any   = downloads.map(function (item: any) { return item.id; }).indexOf(id);
        downloads.splice(index, 1);
        this.cloudSocketService.updateRoom(userId, downloads);
    }

    /**
     * Remove file id from object
     *
     * @param fileId
     */
    public removeFileId(userId: string, fileId: any) {
        const index: any = this.fileIds[userId].indexOf(fileId);
        delete this.fileIds[index];

        const params: any = ['HistoryFinalDelete', '', fileId];
        this.editNzbQueue(params);
    }

    /**
     * Calculate estimated time for downloaded file
     *
     * @param sec
     * @returns {any}
     */
    public formatTimeLeft(sec: any) {
        const days: any    = Math.floor(sec / 86400);
        const hours: any   = Math.floor((sec % 86400) / 3600);
        const minutes: any = Math.floor((sec / 60) % 60);
        const seconds: any = Math.floor(sec % 60);

        if(isFinite(days)) {
            if (days > 10) {
                return days + 'd';
            }

            if (days > 0) {
                return days + 'd ' + hours + 'h';
            }
        }

        if (hours > 0) {
            return hours + 'h ' + (minutes < 10 ? '0' : '') + minutes + 'm';
        }

        if (minutes > 0) {
            return minutes + 'm ' + (seconds < 10 ? '0' : '') + seconds + 's';
        }

        if (!isNaN(seconds)) {
            return seconds + 's';
        } else {
            return '';
        }
    }

    /**
     * Get downloaded file download speed
     *
     * @param bytesPerSec
     * @param status
     * @returns {any}
     */
    public formatSpeed(bytesPerSec: any, status: any) {
        if (status !== 'Downloading') {
            return '';
        }

        if (bytesPerSec === false) {
            return '-/-';
        }

        if (bytesPerSec >= 100 * 1024 * 1024) {
            return Math.round(bytesPerSec / 1024.0 / 1024.0) + ' MB/s';
        } else if (bytesPerSec >= 10 * 1024 * 1024) {
            return (bytesPerSec / 1024.0 / 1024.0).toFixed(1) + ' MB/s';
        } else if (bytesPerSec >= 1024 * 1024) {
            return (bytesPerSec / 1024.0 / 1024.0).toFixed(2) + ' MB/s';
        } else {
            return Math.round(bytesPerSec / 1024.0) + ' KB/s' == '0 KB/s' ? '' : Math.round(bytesPerSec / 1024.0) + ' KB/s';
        }
    }

    /**
     * Convert downloaded file size as user friendly
     *
     * @param sizeMB
     * @param sizeLo
     * @returns {any}
     */
    public formatSizeMB(sizeMB: any, sizeLo: any) {
        if (sizeMB == undefined) {
            return '-/-';
        }

        if (sizeMB >= 1024 * 1024 * 100) {
            return Math.round(sizeMB / 1024.0 / 1024.0) + ' TB';
        } else if (sizeMB >= 1024 * 1024 * 10) {
            return (sizeMB / 1024.0 / 1024.0).toFixed(1) + ' TB';
        } else if (sizeMB >= 1024 * 1000) {
            return (sizeMB / 1024.0 / 1024.0).toFixed(2) + ' TB'
        } else if (sizeMB >= 1024 * 100) {
            return Math.round(sizeMB / 1024.0) + ' GB';
        } else if (sizeMB >= 1024 * 10) {
            return (sizeMB / 1024.0).toFixed(1) + ' GB';
        } else if (sizeMB >= 1000) {
            return (sizeMB / 1024.0).toFixed(2) + ' GB';
        } else if (sizeMB >= 100) {
            return Math.round(sizeMB) + ' MB';
        } else if (sizeMB >= 10) {
            return (sizeMB).toFixed(1) + ' MB';
        } else {
            return (sizeMB).toFixed(2) + ' MB';
        }
    }
}
