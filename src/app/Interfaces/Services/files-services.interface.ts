export interface FilesServicesInterface {
    create(fileData: FileDto)                        : Promise<any>;
    findBy(fileData: any)                            : Promise<any>;
    getUserFilesByUserId(userId: any, limit: number) : Promise<any>;
    updateFileStatus(userId: any, status: any)       : Promise<any>;
}
