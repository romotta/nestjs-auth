import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthUserResponseDto {
  @ApiProperty({
    type: String,
    example: `rodrigo@gmail.com`,
  })
  @IsEmail()
  email!: string;
}
