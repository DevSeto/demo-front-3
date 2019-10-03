import { Controller, Get,  Post, Param, HttpStatus, Response, Body, Bind } from '@nestjs/common';
import { NzbGetsService } from '../../../Services/nzbgets.service';
import { FilesService } from '../../../Services/files.service';
import { MessageCode } from '../../../Helpers/responseMessages/MessageCode';
import { ENV } from '../../../../config';

@Controller('/api/nzbget')
export class NzbGetController {

    constructor(
        private readonly nzbGetsService : NzbGetsService,
        private readonly filesService   : FilesService
    ) {}

    /**
     * Create User Usenet Server Configuration
     *
     * @param res
     * @param usenetServerConfiguration
     * @returns {Promise<void>}
     */
    @Post('/usenet-server')
    public async createUserUsenetServer(@Response() res: any, @Body() usenetServerConfiguration: any): Promise<any> {
        const checkUsenetServer: any = await this.nzbGetsService.findBy({ server_host: usenetServerConfiguration.server_host});
        if (checkUsenetServer.length > 0) {
            const error: any = MessageCode.getMessageFromMessageCode('nzbGet:create:alreadyExist');
            return res.json(error);
        }

        const usenetServer: any = await this.nzbGetsService.create(usenetServerConfiguration);
        if (usenetServer == '') {
            const error: any = MessageCode.getMessageFromMessageCode('nzbGet:create:error');
            return res.json(error);
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status        : true,
            httpStatus    : HttpStatus.OK,
            usenet_server : usenetServer,
            userMessage   : 'Your usenet server has been successfully added.'
        });
    }

    /**
     * Edit User Usenet Server Configuration
     *
     * @param usenetServerId
     * @param res
     * @param usenetServer
     * @returns {Promise<void>}
     */
    @Post('/update-usenet-server/:usenetServerId')
    @Bind(Param('usenetServerId'))
    public async editUserUsenetServers(usenetServerId: string, @Response() res: any, @Body() usenetServer: any): Promise<any> {
        let usenetServers: any = await this.nzbGetsService.update(usenetServerId, usenetServer);

        return res.status(HttpStatus.ACCEPTED).send({
            status         : true,
            httpStatus     : HttpStatus.OK,
            usenet_servers : usenetServers,
            userMessage    : 'Your usenet server has been successfully updated.'
        });
    }

    /**
     * Get User Usenet Servers Configuration
     *
     * @param userId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('/get-user-usenet-servers/:userId')
    @Bind(Param('userId'))
    public async getUserUsenetServers(userId: string, @Response() res: any): Promise<any> {
        const usenetServers: any = await this.nzbGetsService.findBy({ user_id: userId });

        return res.status(HttpStatus.ACCEPTED).send({
            status         : true,
            httpStatus     : HttpStatus.OK,
            usenet_servers : usenetServers
        });
    }

    /**
     * Delete User Usenet Server Configuration
     *
     * @param res
     * @param body
     * @returns {Promise<void>}
     */
    @Post('/delete-usenet-server')
    public async deleteUserUsenetServer(@Response() res: any, @Body() body: any): Promise<any> {
        this.nzbGetsService.deleteUsenetServersById(body.id);
        const message: any = MessageCode.getMessageFromMessageCode('nzbGet:successfullyDeleted');
        return res.json(message);
    }

    /**
     * Update file status
     *
     * @param res
     * @param body
     */
    @Post('update-file-status')
    public async updateFileStatus(@Response() res: any, @Body() body: any): Promise<any> {
        if (body.status == 'deleted') {
            const condition: any = {
                nzb_file_id : body.id,
                user_id     : body.user_id
            };
            this.filesService.deleteFileByNzbId(condition);
        } else {
            this.filesService.updateFileStatus(body.id, body.status);
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }
}
