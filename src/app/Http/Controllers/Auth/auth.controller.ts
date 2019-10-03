import { Controller, Get, Post, Bind, Body, Param, HttpStatus, Response } from '@nestjs/common';
import { UsersService } from '../../../Services/users.service';
import { MessageCode } from '../../../Helpers/responseMessages/MessageCode';
import { CryptoHelper } from '../../../Helpers/crypto/Crypto';
import { Mail } from '../../../Modules/Mail/component/mail.component';
import { ENV } from '../../../../config';

@Controller('/api/auth')
export class AuthController {
    public mail: any;

    constructor(
        private readonly usersService: UsersService
    ) {
        this.mail = new Mail;
    }

    /**
     * User login
     *
     * @param res
     * @param userLogin
     * @returns {Promise<void>}
     */
    @Post('login')
    public async login(@Response() res: any, @Body() userLogin: LoginUserDto): Promise<any> {
        if (!userLogin.email) {
            const response: any = MessageCode.getMessageFromMessageCode('auth:login:missingEmail');
            return res.json(response);
        } else if (!userLogin.password) {
            const response: any = MessageCode.getMessageFromMessageCode('auth:login:missingPassword');
            return res.json(response);
        } else {
            const userData: any = await this.usersService.login(userLogin);
            if (userData == '') {
                const response: any = MessageCode.getMessageFromMessageCode('user:notFound');
                return res.json(response);
            }

            userData.user.password = CryptoHelper.decrypt(userData.user.password);

            return res.status(HttpStatus.ACCEPTED).send({
                status     : true,
                httpStatus : HttpStatus.OK,
                user       : userData.user,
                auth_token : userData.auth_token
            });
        }
    }

    /**
     * Get user by id
     *
     * @param res
     * @param userLogin
     * @returns {Promise<void>}
     */
    @Post('get-user')
    public async getUser(@Response() res: any, @Body() data: any): Promise<any> {
        const userData: any = await this.usersService.findBy({_id: data.user_id});
        const token: string = await this.usersService.generateToken(userData);

        if (userData == '') {
            const response: any = MessageCode.getMessageFromMessageCode('user:notFound');
            return res.json(response);
        }

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            user       : userData.user,
            auth_token : token
        });
    }

    /**
     * Create new user
     *
     * @param res
     * @param newUser
     * @returns {Promise<void>}
     */
    @Post()
    public async createUser(@Response() res: any, @Body() newUser: CreateUserDto): Promise<any> {
        const checkUser: any = await this.usersService.findByEmail(newUser);
        if (checkUser !== null) {
            const error: any = MessageCode.getMessageFromMessageCode('user:create:emailAlreadyExist');
            return res.json(error);
        }

        const userData: any = await this.usersService.create(newUser);
        if (userData == '') {
            const error: any = MessageCode.getMessageFromMessageCode('user:create:error');
            return res.json(error);
        }

        // let activeAccountUrl: string;
        // if(ENV.production) {
        //     activeAccountUrl = ENV.production_host + '/' + 'active-account/' + user.user._id;
        // } else {
        //     activeAccountUrl = ENV.dev_ip + '/' + 'active-account/' + user.user._id;
        // }
        //
        // this.mail.send({
        //     to       : newUser.email,
        //     subject  : 'Welcome to the NZB Cloud',
        //     template : {
        //         name      : 'email_registration.html',
        //         arguments : [
        //             {
        //                 key   : /{{activeLink}}/g,
        //                 value : activeAccountUrl
        //             }
        //         ]
        //     }
        // });

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            user       : userData.user,
            auth_token : userData.auth_token
        });
    }

    /**
     * Active user account by id
     *
     * @param userId
     * @param res
     * @returns {Promise<void>}
     */
    @Get('active-account/:userId')
    @Bind(Param('userId'))
    public async activeAccount(userId: string, @Response() res: any): Promise<any> {
        const userData: any = await this.usersService.findAndChangeStatus(userId);

        res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK,
            user       : userData.user,
            auth_token : userData.auth_token
        });
    }

    /**
     * Password recovery
     *
     * @param res
     * @param user
     * @returns {Promise<void>}
     */
    @Post('password/recovery')
    public async passwordRecovery(@Response() res: any, @Body() user: any): Promise<any> {
        const email: string  = user.email;
        const checkUser: any = await this.usersService.findByEmail({email: email});
        if (checkUser == null) {
            const error = MessageCode.getMessageFromMessageCode('user:notFound');
            return res.json(error);
        }

        const data: any                  = {
            user_id : checkUser._id,
            date    : Date.now()
        };
        const passwordRecoveryData: string = Buffer.from(JSON.stringify(data)).toString('base64');
        let passwordRecoveryLink: string;

        if(ENV.production) {
            passwordRecoveryLink = ENV.production_host + '/' + 'password-recovery/' + passwordRecoveryData;
        } else {
            passwordRecoveryLink = ENV.dev_ip + '/' + 'password-recovery/' + passwordRecoveryData;
        }

        this.mail.send({
            to       : email,
            subject  : 'Password recovery',
            template : {
                name      : 'email_password.html',
                arguments : [
                    {
                        key   : /{{passwordRecoveryLink}}/g,
                        value : passwordRecoveryLink
                    }
                ]
            }
        });

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }

    /**
     * Change Password
     *
     * @param res
     * @param data
     * @returns {Promise<void>}
     */
    @Post('password/change')
    public async changePassword(@Response() res: any, @Body() data: any): Promise<any> {
        const userId: string   = data.user_id;
        const password: string = data.password;
        this.usersService.updateUserById(userId, {password: password});

        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }
}
