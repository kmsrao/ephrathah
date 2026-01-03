import { IsString, IsNotEmpty, MinLength, IsIn, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateUserDto {
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

  @IsString()
  @IsOptional()
  @IsIn(['ADMIN', 'INCHARGE', 'MEMBER'])
  role?: string;

  @IsBoolean()
  @IsOptional()
  watchLiveEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  submitFeedbackEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  submitAccountabilityEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  inchargeId?: number;
}
