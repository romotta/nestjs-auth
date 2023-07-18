import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserResponseDto } from './dtos/createUserResponse.dto';
import { CreateUserRequestDto } from './dtos/createUserRequest.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiCreatedResponse({
    type: CreateUserResponseDto,
    description: 'The user has been successfully created.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, The response body may contain clues as to what went wrong',
  })
  @ApiConflictResponse({
    description: 'Conflict, Email already exists',
  })
  async createUser(
    @Body() userCredentialsDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const createdUser = await this.userService.createUser(
      userCredentialsDto.email,
      userCredentialsDto.password,
    );
    const response: CreateUserResponseDto = {
      email: createdUser.email,
      id: createdUser.id,
    };
    return response;
  }
}
