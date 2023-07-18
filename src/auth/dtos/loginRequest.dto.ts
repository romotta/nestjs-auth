import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    type: String,
    example: `rodrigo@gmail.com`,
    required: true,
  })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    type: String,
    example: 'Password1!',
    required: true,
  })
  @IsNotEmpty()
  password!: string;
}
