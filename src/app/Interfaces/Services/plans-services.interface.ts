export interface PlansServicesInterface {
    findBy(planData: any) : Promise<any>;
    findById(planId: any) : Promise<any>;
}