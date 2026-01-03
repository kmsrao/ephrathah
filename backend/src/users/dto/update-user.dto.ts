import { IsString, IsOptional, MinLength, IsIn, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsString()
  @IsOptional()
  @IsIn(['audio', 'video'])
  liveMode?: string;

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
