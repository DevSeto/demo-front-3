import { Model } from 'mongoose';
import { Component, Inject } from '@nestjs/common';
import { LanguagesInterface } from '../Interfaces/Dto/languages.interface';
import { LanguagesServicesInterface } from '../Interfaces/Services/languages-services.interface';

@Component()
export class LanguagesService implements LanguagesServicesInterface {

    constructor(
        @Inject('LanguageModelToken') private languagesModel: Model<LanguagesInterface>
    ) {}

    /**
     * Get language by conditional
     *
     * @param languageData
     * @returns {Promise<null|LanguagesInterface>}
     */
    public async findBy(languageData: any): Promise<any> {
        try {
            return await this.languagesModel.findOne(languageData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find by language id
     *
     * @param languageId
     * @returns {Promise<null|LanguagesInterface>}
     */
    public async findById(languageId: any): Promise<any> {
        try {
            return await this.languagesModel.findById(languageId);
        } catch(err) {
            console.log(err)
        }
    }
}