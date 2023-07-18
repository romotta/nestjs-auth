import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserResponseDto {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: `rodrigo@gmail.com`,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
