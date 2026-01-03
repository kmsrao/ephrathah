import { IsString, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsString()
  @IsIn(['audio', 'video'])
  liveMode: string;
}
