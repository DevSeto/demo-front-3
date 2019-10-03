export interface FoldersServicesInterface {
    create(folderData: FolderDto)                   : Promise<any>;
    findAll()                                       : Promise<any>;
    findBy(conditional: any)                        : Promise<any>;
    findByUserId(userId: any)                       : Promise<any>;
    shareFolder(folderName: string, userId: string) : Promise<any>;
    getUserFolderCount(conditional: any)            : Promise<any>;
    updateFolderSizeAndCount(folderData: any)       : Promise<any>;
}