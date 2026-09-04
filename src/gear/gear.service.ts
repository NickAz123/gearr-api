import { Injectable } from "@nestjs/common";

import { AppException } from "../common/errors/app.exception";
import {
    PG_NOT_NULL_VIOLATION,
    PG_UNIQUE_VIOLATION,
    pgErrorCode,
} from "../common/errors/postgres-error-codes";
import { CreateGearDto } from "./dto/create-gear.dto";
import { UpdateGearDto } from "./dto/update-gear.dto";
import { CreatedGear, Gear } from "./entities/gear.entity";
import { GearRepository } from "./gear.repository";

@Injectable()
export class GearService {
    constructor(private readonly gear: GearRepository) {}

    async findOne(id: number): Promise<Gear> {
        const gear = await this.gear.findById(id);

        if (!gear) {
            throw new AppException("GEAR_NOT_FOUND");
        }

        return gear;
    }

    findByUserId(userId: number): Promise<Gear[]> {
        return this.gear.findByUserId(userId);
    }

    async create(userId: number, dto: CreateGearDto): Promise<CreatedGear> {
        try {
            return await this.gear.create(userId, dto);
        } catch (err) {
            switch (pgErrorCode(err)) {
                case PG_UNIQUE_VIOLATION:
                    throw new AppException("GEAR_ALREADY_EXISTS");
                case PG_NOT_NULL_VIOLATION:
                    throw new AppException("GEAR_FIELD_EMPTY");
                default:
                    throw err;
            }
        }
    }

    async update(id: number, dto: UpdateGearDto): Promise<UpdateGearDto>{
        let updated: UpdateGearDto | null;

        try{
            updated = await this.gear.update(id, dto)
        } catch (err) {
            if (pgErrorCode(err) === PG_UNIQUE_VIOLATION) {
                throw new AppException("GEAR_ALREADY_EXISTS");
            }
            throw new AppException("GEAR_UPDATE_FAIL");
        }

        if (!updated) {
            throw new AppException("GEAR_OBJECT_INVALID");
        }

        return updated;
    }
}
