export interface UserSettingsServicesInterface {
    findBy(userData: any)   : Promise<any>;
    findById(userData: any) : Promise<any>;
}