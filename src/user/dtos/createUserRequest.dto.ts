import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRequestDto {
  @ApiProperty({
    type: String,
    example: `rodrigo@gmail.com`,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    type: String,
    example: 'Password1!',
    required: true,
  })
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    {
      message: `password is not strong enough. Must contain: 8 characters, 1 number, 1 uppercase letter, 1 symbol`,
    },
  )
  password!: string;
}
