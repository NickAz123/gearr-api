import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class FindUserQueryDto {
    /** `?settings=true` joins `users_settings` into the response. */
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    settings?: boolean;
}
