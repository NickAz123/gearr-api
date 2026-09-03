import { Type } from "class-transformer";
import {
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreateGearDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    purchaseDate?: Date;

    /** Maps to the `usage_km` column. */
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    usage?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
