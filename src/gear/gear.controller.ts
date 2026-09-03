import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
} from "@nestjs/common";

import {
    appValidationPipe,
    parseIdPipe,
} from "../common/pipes/app-validation.pipe";
import { CreateGearDto } from "./dto/create-gear.dto";
import { CreatedGear, Gear } from "./entities/gear.entity";
import { GearService } from "./gear.service";

/** Port of `routes/gear.js`. Paths, verbs and status codes are unchanged. */
@Controller("gear")
export class GearController {
    constructor(private readonly gearService: GearService) {}

    /** Declared before `:id` so the literal segment always wins the match. */
    @Get("user-gear/:id")
    findByUser(
        @Param("id", parseIdPipe("GEAR_OBJECT_INVALID")) userId: number,
    ): Promise<Gear[]> {
        return this.gearService.findByUserId(userId);
    }

    @Get(":id")
    findOne(
        @Param("id", parseIdPipe("GEAR_NOT_FOUND")) id: number,
    ): Promise<Gear> {
        return this.gearService.findOne(id);
    }

    /** `:id` is the *owning user's* id — preserved from the Express route. */
    @Put(":id")
    @HttpCode(HttpStatus.CREATED)
    create(
        @Param("id", parseIdPipe("GEAR_OBJECT_INVALID")) userId: number,
        @Body(appValidationPipe("GEAR_OBJECT_INVALID")) dto: CreateGearDto,
    ): Promise<CreatedGear> {
        return this.gearService.create(userId, dto);
    }
}
