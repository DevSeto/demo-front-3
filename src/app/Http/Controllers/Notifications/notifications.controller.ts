import { Controller, HttpStatus, Post, Request, Response } from '@nestjs/common';
import { FilesService } from '../../../Services/files.service';
import { UsersService } from '../../../Services/users.service';
import { ENV } from '../../../../config';

@Controller('/api/notifications')
export class NotificationsController {

    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService
    ) {}

    /**
     * Save user browser notification configuration
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    @Post('config')
    public async addUserNotificationConfig(@Request() req: any, @Response() res: any): Promise<any> {
        this.usersService.updateByUserId(req.body);

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * Send user notification
     *
     * @param req
     * @returns {Promise<void>}
     */
    @Post('send-notification')
    public async sendNotifications(@Request() req: any) {
        let folderUrl: string;
        const status: string = req.body.status ? req.body.status : 'copy';
        const fileId: number = req.body.file_id;
        const fileData: any  = await this.filesService.findBy({nzb_file_id: fileId});

        if(!fileData) {
            return false;
        }

        if(status == 'Success') {
            const folderId: string = req.body.folder_id;
            const storage: string  = req.body.storage;
            folderUrl              = storage !== 's3' ? ENV.notification_config.url + 'files?dir=' + folderId + '&cloud=' + storage : ENV.notification_config.url + 'files?dir=' + folderId;
        } else {
            folderUrl = ENV.notification_config.url;
        }

        let notificationStatus: string = 'Success';
        const userData: any            = await this.usersService.findById(fileData.user_id);

        if(userData !== null && typeof userData.notification_configuration !== 'undefined') {
            const subscription: any = userData.notification_configuration;
            const webpush: any      = require('web-push');

            webpush.setVapidDetails(
                'mailto:admin@nzbcloud.com',
                'BE8PyI95I_jBIfb_LTS_nkUJnOwjLP2zAaGBSFEi3jmFJ3l5ox7-NtNqrVuyPL4Qmt4UxDI-YgwYI1sEMIpoU90',
                'Rs4ALPgHaAgjaOUrihdpNCaSWtUTPu5ZyU-oHBetX0E'
            );

            let notification: any = {
                title : ENV.notification_config.title,
                icon  : ENV.notification_config.icon,
                body  : ENV.notification_config.body,
                url   : folderUrl
            };

            if(status && (status == 'failure' || status == 'password')) {
                notification.body  = 'Upload failed. Nzb file format is invalid.';
                notificationStatus = 'Failed';
            }

            if(subscription) {
                webpush.sendNotification(subscription, JSON.stringify(notification));
            }
        }

        this.filesService.updateFileStatus(fileId, notificationStatus);
    }
}
