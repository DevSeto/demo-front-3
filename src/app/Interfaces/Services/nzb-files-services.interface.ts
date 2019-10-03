export interface NzbFilesServicesInterface {
    delete(id: string)                                : Promise<any>;
    deleteBy(condition: any)                          : Promise<any>;
    create(fileData: FileDto)                         : Promise<any>;
    findBy(fileData: any)                             : Promise<any>;
    updateNzbCloud(fileId: string, cloud: string)     : Promise<any>;
    getUserNzbFilesByUserId(userId: any, fields: any) : Promise<any>;
}