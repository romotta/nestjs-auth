import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserResponseDto } from './dtos/createUserResponse.dto';
import { CreateUserRequestDto } from './dtos/createUserRequest.dto';
import { User } from '../entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user and return the user response', async () => {
      const mockUser = new User();
      mockUser.id = 1;
      mockUser.email = 'test@example.com';
      mockUser.password = 'password123';
      mockUser.salt = 'somesaltvalue';

      const expectedCreateUserResponse: CreateUserResponseDto = {
        email: 'test@example.com',
        id: 1,
      };
      const requestUserCredentialsDto: CreateUserRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);

      const result = await userController.createUser(requestUserCredentialsDto);

      expect(userService.createUser).toHaveBeenCalledWith(
        requestUserCredentialsDto.email,
        requestUserCredentialsDto.password,
      );
      expect(result).toEqual(expectedCreateUserResponse);
    });
  });
});
