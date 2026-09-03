import { Injectable } from "@nestjs/common";

import { PasswordService } from "../auth/password.service";
import { AppException } from "../common/errors/app.exception";
import {
    PG_NOT_NULL_VIOLATION,
    PG_UNIQUE_VIOLATION,
    pgErrorCode,
} from "../common/errors/postgres-error-codes";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PublicUser, User, UserWithSettings } from "./entities/user.entity";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
    constructor(
        private readonly users: UsersRepository,
        private readonly passwords: PasswordService,
    ) {}

    findAll(): Promise<User[]> {
        return this.users.findAll();
    }

    async findOne(
        id: number,
        withSettings: boolean,
    ): Promise<User | UserWithSettings> {
        const user = withSettings
            ? await this.users.findByIdWithSettings(id)
            : await this.users.findById(id);

        if (!user) {
            throw new AppException("USER_NOT_FOUND");
        }

        return user;
    }

    async create(dto: CreateUserDto): Promise<PublicUser> {
        const passwordHash = await this.passwords.hash(dto.password);

        try {
            return await this.users.create(
                dto.firstName,
                dto.lastName,
                dto.userName,
                passwordHash,
                dto.email,
            );
        } catch (err) {
            switch (pgErrorCode(err)) {
                case PG_UNIQUE_VIOLATION:
                    throw new AppException("USER_ALREADY_EXISTS");
                case PG_NOT_NULL_VIOLATION:
                    throw new AppException("USER_FIELD_EMPTY");
                default:
                    throw err;
            }
        }
    }

    async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
        let updated: PublicUser | null;

        try {
            updated = await this.users.update(id, dto);
        } catch (err) {
            if (pgErrorCode(err) === PG_UNIQUE_VIOLATION) {
                throw new AppException("USER_ALREADY_EXISTS");
            }
            throw new AppException("USER_UPDATE_FAIL");
        }

        if (!updated) {
            throw new AppException("USER_OBJECT_INVALID");
        }

        return updated;
    }

    async updatePassword(id: number, dto: UpdatePasswordDto): Promise<void> {
        const user = await this.users.findById(id);

        // The Express version read `user.password` before checking for null,
        // which threw an unhandled rejection and left the request hanging.
        if (!user) {
            throw new AppException("USER_NOT_FOUND");
        }

        const matches = await this.passwords.compare(
            dto.currentPassword,
            user.password,
        );

        if (!matches) {
            throw new AppException("USER_PASSWORD_MISMATCH");
        }

        const newPasswordHash = await this.passwords.hash(dto.newPassword);

        try {
            await this.users.updatePassword(id, newPasswordHash);
        } catch {
            throw new AppException("USER_UPDATE_FAIL");
        }
    }

    async softDelete(id: number): Promise<void> {
        const user = await this.users.findById(id);

        if (!user) {
            throw new AppException("USER_NOT_FOUND");
        }

        await this.users.softDelete(id);
    }
}
