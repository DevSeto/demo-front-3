import { Component, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PlansInterface } from '../Interfaces/Dto/plans.interface';
import { PlansServicesInterface } from '../Interfaces/Services/plans-services.interface';

@Component()
export class PlansService implements PlansServicesInterface {

    constructor(
        @Inject('PlanModelToken') private plansModel: Model<PlansInterface>
    ) {}

    /**
     * Add user plan
     *
     * @param data
     * @returns {Promise<any>}
     */
    public async create(data: any): Promise<any> {
        try {
            const plan: any = new this.plansModel(data).save();
            return await plan;
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find by conditional
     *
     * @param planData
     * @returns {Promise<null|PlansInterface>}
     */
    public async findBy(planData: any): Promise<any> {
        try {
            return await this.plansModel.findOne(planData);
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * Find by plan id
     *
     * @param planId
     * @returns {Promise<null|PlansInterface>}
     */
    public async findById(planId: any): Promise<any> {
        try {
            return await this.plansModel.findById(planId);
        } catch(err) {
            console.log(err)
        }
    }
}