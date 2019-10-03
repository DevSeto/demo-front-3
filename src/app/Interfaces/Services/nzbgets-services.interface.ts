export interface NzbGetsServicesInterface {
    deleteUsenetServersById(nzbGetData: any)           : Promise<any>;
    update(usenetServerId: any, usenetServerData: any) : Promise<any>;
    findBy(nzbGetData: any)                            : Promise<any>;
    findById(nzbGetData: any)                          : Promise<any>;
}