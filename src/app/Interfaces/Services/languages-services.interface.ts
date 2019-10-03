export interface LanguagesServicesInterface {
    findBy(languageData: any) : Promise<any>;
    findById(languageId: any) : Promise<any>;
}