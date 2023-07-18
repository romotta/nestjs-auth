import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthUserResponseDto } from './dtos/authUserResponse.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../entity/user.entity';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginResponseDto } from './dtos/loginResponse.dto';
import { LoginRequestDto } from './dtos/loginRequest.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'The user has been successfully logged in.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized, Invalid credentials',
  })
  login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginRequestDto;
    return this.authService.signIn(email, password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOkResponse({
    type: AuthUserResponseDto,
    description: 'Current logged user email',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  retrieveCurrentUser(@GetUser() user: User): AuthUserResponseDto {
    const response: AuthUserResponseDto = {
      email: user.email,
    };
    return response;
  }
}
