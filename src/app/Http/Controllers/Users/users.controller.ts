import { Controller, Get, Post, Bind, Body, Param, HttpStatus, Response } from '@nestjs/common';
import { UsersService } from '../../../Services/users.service';
import { CryptoHelper } from '../../../Helpers/crypto/Crypto';


@Controller('/api/users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService
    ) {}

    /**
     * Get user by id
     *
     * @param userId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('get/:userId')
    @Bind(Param('userId'))
    public async getUserById(userId: string, @Response() res: any): Promise<any> {
        const userData: any = await this.usersService.findById(userId);

        res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            user       : userData
        });
    }

    /**
     * Update user settings
     *
     * @param userId
     * @param res
     * @param userPersonalSettings
     * @returns {Promise<void>}
     */
    @Post('update/:userId')
    @Bind(Param('userId'))
    public async updateUserPersonalSettings(userId: string, @Response() res: any, @Body() userPersonalSettings: any): Promise<any> {
        this.usersService.updateUserById(userId, userPersonalSettings);
        let userData: any   = await this.usersService.findById(userId);
        userData.password   = CryptoHelper.decrypt(userData.password);

        res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            user       : userData
        });
    }
}