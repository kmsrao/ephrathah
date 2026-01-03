import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAccountabilityDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
