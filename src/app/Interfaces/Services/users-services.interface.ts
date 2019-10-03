import {UsersInterface} from '../Dto/users.interface';

export interface IJwtOptions {
    algorithm : string;
    expiresIn : number | string;
    jwtid     : string;
}

export interface UsersServicesInterface {
    options                              : IJwtOptions;
    create(createUserDto: CreateUserDto) : Promise<any>;
    login(loginUserDto: LoginUserDto)    : Promise<any>;
    findAll()                            : Promise<UsersInterface[]>;
    findBy(data: any)                    : Promise<any>;
    findByEmail(userData: any)           : Promise<any>;
    findById(userId: any)                : Promise<any>;
}