import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    userName!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsEmail()
    @MaxLength(255)
    email!: string;
}
