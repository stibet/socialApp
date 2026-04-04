import { UsersService } from './users.service';
declare class UpdateProfileDto {
    name?: string;
    bio?: string;
    avatar?: string;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<import("./user.entity").User>;
    updateMe(req: any, dto: UpdateProfileDto): Promise<import("./user.entity").User>;
    getUser(id: string): Promise<import("./user.entity").User>;
}
export {};
