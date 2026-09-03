import { Test } from "@nestjs/testing";

import { PasswordService } from "../auth/password.service";
import { AppException } from "../common/errors/app.exception";
import { PG_UNIQUE_VIOLATION } from "../common/errors/postgres-error-codes";
import { User } from "./entities/user.entity";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
    let service: UsersService;
    let repository: jest.Mocked<UsersRepository>;
    let passwords: jest.Mocked<PasswordService>;

    const user = {
        id: 1,
        first_name: "Jane",
        last_name: "Foster",
        username: "jdfoster",
        password: "stored-hash",
        email: "jane.foster@example.com",
    } as User;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UsersRepository,
                    useValue: {
                        findById: jest.fn(),
                        findByIdWithSettings: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        updatePassword: jest.fn(),
                        softDelete: jest.fn(),
                    },
                },
                {
                    provide: PasswordService,
                    useValue: { hash: jest.fn(), compare: jest.fn() },
                },
            ],
        }).compile();

        service = moduleRef.get(UsersService);
        repository = moduleRef.get(UsersRepository);
        passwords = moduleRef.get(PasswordService);
    });

    it("raises USER_NOT_FOUND for a missing user", async () => {
        repository.findById.mockResolvedValue(undefined);

        await expect(service.findOne(1, false)).rejects.toMatchObject({
            code: "USER_NOT_FOUND",
        });
    });

    it("maps a unique violation to USER_ALREADY_EXISTS", async () => {
        passwords.hash.mockResolvedValue("hash");
        repository.create.mockRejectedValue({ code: PG_UNIQUE_VIOLATION });

        await expect(
            service.create({
                firstName: "Jane",
                lastName: "Foster",
                userName: "jdfoster",
                password: "pw",
                email: "jane.foster@example.com",
            }),
        ).rejects.toBeInstanceOf(AppException);
    });

    it("compares the plain-text password against the stored hash", async () => {
        repository.findById.mockResolvedValue(user);
        passwords.compare.mockResolvedValue(true);
        passwords.hash.mockResolvedValue("new-hash");
        repository.updatePassword.mockResolvedValue({ id: 1 });

        await service.updatePassword(1, {
            currentPassword: "plain",
            newPassword: "next",
        });

        expect(passwords.compare).toHaveBeenCalledWith("plain", "stored-hash");
        expect(repository.updatePassword).toHaveBeenCalledWith(1, "new-hash");
    });

    it("rejects a password change for an unknown user without throwing", async () => {
        repository.findById.mockResolvedValue(undefined);

        await expect(
            service.updatePassword(99, {
                currentPassword: "plain",
                newPassword: "next",
            }),
        ).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
    });
});
