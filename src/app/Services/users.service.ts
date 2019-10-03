import { Component, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersInterface } from '../Interfaces/Dto/users.interface';
import { IJwtOptions, UsersServicesInterface } from '../Interfaces/Services/users-services.interface';
import { CryptoHelper } from '../Helpers/crypto/Crypto';
import { ENV } from '../../config';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';

@Component()
export class UsersService implements UsersServicesInterface {

    private _options : IJwtOptions = {
        algorithm : 'HS256',
        expiresIn : '31 days',
        jwtid     : ENV.JWT_ID,
    };

    constructor(
        @Inject('UserModelToken') private userModel: Model<UsersInterface>
    ) {}

    /**
     * Get jwt options
     *
     * @returns {IJwtOptions}
     */
    get options(): IJwtOptions {
        return this._options;
    }

    /**
     * Set jwt options
     *
     * @param value
     */
    set options(value: IJwtOptions) {
        this._options.algorithm = value.algorithm;
    }

    /**
     * login user
     *
     * @param credentials
     * @returns {Promise<any>}
     */
    public async login(credentials: LoginUserDto): Promise<any> {
        try {
            const user: any = await this.userModel.findOne({
                email    : credentials.email,
                password : CryptoHelper.encrypt(credentials.password),
                active   : true
            });

            if (!user) {
                return false;
            }

            const token: string = await this.generateToken(user);
            const userData: any  = {
                auth_token : token,
                user       : user
            };
            return await userData;
        } catch(err) {
            console.log(err)
        }
    }

    public async generateToken(userData: any) {
        const payload: any = {
            user_id : userData._id,
            email   : userData.email
        };
        const token: string = await jwt.sign(payload, ENV.JWT_KEY, this._options);

        return token;
    }

    /**
     * Create a new user
     *
     * @param data
     * @returns {Promise<any>}
     */
    public async create(data: any): Promise<any> {
        try {
            const createdUser: any = new this.userModel(data).save();
            const payload: any     = {
                email : data.email
            };
            let token: string      = await jwt.sign(payload, ENV.JWT_KEY, this._options);
            const userData: any    = {
                auth_token : token,
                user       : await createdUser
            };

            return await userData;
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get all users
     *
     * @returns {Promise<UsersInterface[]>}
     */
    public async findAll(): Promise<UsersInterface[]> {
        try {
            return await this.userModel.find().exec();
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find by email
     *
     * @param userData
     * @returns {Promise<null|UsersInterface>}
     */
    public async findByEmail(userData: any): Promise<any> {
        try {
            return this.userModel.findOne({
                email: userData.email
            });
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find user by needed
     *
     * @param userData
     * @returns {Promise<null|UsersInterface>}
     */
    public async findBy(userData: any): Promise<any> {
        try {
            return await this.userModel.findOne(userData, function(error: any, user: any) {
                if(error) {
                    console.log(error);
                }
            });
        } catch(error) {
            console.log(error)
        }
    }

    /**
     * Find by user id
     * 
     * @param userId
     * @returns {Promise<null|UsersInterface>}
     */
    public async findById(userId: any): Promise<any> {
        try {
            return await this.userModel.findById(userId);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find user and set active status
     * @param userId
     * @returns {Promise<null|UsersInterface>}
     */
    public async findAndChangeStatus(userId: any): Promise<any> {
        try {
            if(!mongoose.Types.ObjectId.isValid(userId)) {
                return false;
            }
            const user: any = await this.userModel.findById(userId);

            if(user) {
                const status: any = {
                    active: true
                };
                this.updateUserById(userId, status);


                const payload: any   = {
                    user_id : user._id,
                    email   : user.email
                };
                let token: string    = await jwt.sign(payload, ENV.JWT_KEY, this._options);

                const userData: any  = {
                    auth_token : token,
                    user       : user
                };

                return userData;
            }

            return false;
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Update user notification configs
     *
     * @param userData
     * @returns {Promise<void>}
     */
    public async updateByUserId(userData: any): Promise<any> {
        try {
            const notificationConfig = {
                notification_configuration: userData.notification_config
            };
            this.userModel.findOneAndUpdate({_id: userData.user_id}, notificationConfig, {upsert: true}, function (err: any, num: any) {
                if (err) {
                    throw err;
                }
            });
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Update user settings
     *
     * @param userId
     * @param userData
     * @returns {Query<any>}
     */
    public updateUserById(userId: any, userData: any) {
        try {
            const conditions: any = {_id: userId};
            const options: any    = {multi: true};
            return this.userModel.update(conditions, userData, options, function (err: any, num: any) {
                if (err) {
                    throw err;
                }
            });
        } catch(err) {
            console.log(err)
        }
    }
}
