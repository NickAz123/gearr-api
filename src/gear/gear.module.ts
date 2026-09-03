import { Module } from "@nestjs/common";

import { GearController } from "./gear.controller";
import { GearRepository } from "./gear.repository";
import { GearService } from "./gear.service";

@Module({
    controllers: [GearController],
    providers: [GearService, GearRepository],
    exports: [GearService],
})
export class GearModule {}
