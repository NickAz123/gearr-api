import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

/**
 * Every field is optional; the repository only writes the ones present, matching
 * the old `allowedFields` loop. A body with none of them yields
 * `USER_OBJECT_INVALID`, as before.
 */
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    userName?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;
}
