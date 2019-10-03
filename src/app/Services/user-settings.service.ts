import { Component, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserSettingsInterface } from '../Interfaces/Dto/user-settings.interface';
import { UserSettingsServicesInterface } from '../Interfaces/Services/user-settings-services.interface';

@Component()
export class UserSettingsService implements UserSettingsServicesInterface {

    constructor(
        @Inject('UserSettingsModelToken') private userSettingsModel: Model<UserSettingsInterface>
    ) {}

    /**
     * Find user settings by conditional
     * @param userData
     * @returns {Promise<null|UserSettingsInterface>}
     */
    public async findBy(userData: any): Promise<any> {
        try {
            return await this.userSettingsModel.findOne(userData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Get user settings by user id
     *
     * @param userId
     * @returns {Promise<null|UserSettingsInterface>}
     */
    public async findById(userId: any): Promise<any> {
        try {
            return await this.userSettingsModel.findById(userId);
        } catch(err) {
            console.log(err)
        }
    }
}