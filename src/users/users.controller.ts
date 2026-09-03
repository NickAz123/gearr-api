import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Put,
    Query,
} from "@nestjs/common";

import {
    appValidationPipe,
    parseIdPipe,
} from "../common/pipes/app-validation.pipe";
import { CreateUserDto } from "./dto/create-user.dto";
import { FindUserQueryDto } from "./dto/find-user-query.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PublicUser, User, UserWithSettings } from "./entities/user.entity";
import { UsersService } from "./users.service";

/** Port of `routes/users.js`. Paths, verbs and status codes are unchanged. */
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(":id")
    findOne(
        @Param("id", parseIdPipe("USER_NOT_FOUND")) id: number,
        @Query(appValidationPipe("USER_OBJECT_INVALID"))
        query: FindUserQueryDto,
    ): Promise<User | UserWithSettings> {
        return this.usersService.findOne(id, query.settings === true);
    }

    /** Kept as PUT to preserve the existing contract, though it creates. */
    @Put()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body(appValidationPipe("USER_OBJECT_INVALID")) dto: CreateUserDto,
    ): Promise<PublicUser> {
        return this.usersService.create(dto);
    }

    @Patch(":id")
    update(
        @Param("id", parseIdPipe("USER_OBJECT_INVALID")) id: number,
        @Body(appValidationPipe("USER_OBJECT_INVALID")) dto: UpdateUserDto,
    ): Promise<PublicUser> {
        return this.usersService.update(id, dto);
    }

    @Patch(":id/update-password")
    @HttpCode(HttpStatus.NO_CONTENT)
    updatePassword(
        @Param("id", parseIdPipe("USER_NOT_FOUND")) id: number,
        @Body(appValidationPipe("USER_FIELD_EMPTY")) dto: UpdatePasswordDto,
    ): Promise<void> {
        return this.usersService.updatePassword(id, dto);
    }

    @Delete(":id/delete")
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param("id", parseIdPipe("USER_NOT_FOUND")) id: number,
    ): Promise<void> {
        return this.usersService.softDelete(id);
    }
}
