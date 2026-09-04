import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    IsDate,
    IsNumber,
} from "class-validator";
import { Type } from 'class-transformer';

export class UpdateGearDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    brand?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    model?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    purchaseDate?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    usage?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

}