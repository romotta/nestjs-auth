import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserRequestDto } from '../user/dtos/createUserRequest.dto';
import { User } from '../entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fakeAccessToken'),
          },
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call authService.signIn and return a LoginResponseDTO', async () => {
      const signInMock = jest.spyOn(authService, 'signIn').mockResolvedValue({
        accessToken: 'mocked-token',
      });

      const credentialsDto: CreateUserRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authController.login(credentialsDto);

      expect(signInMock).toHaveBeenCalledWith(
        credentialsDto.email,
        credentialsDto.password,
      );
      expect(result).toEqual({
        accessToken: 'mocked-token',
      });
    });
  });

  describe('retrieveCurrentUser', () => {
    it('should return the current authenticated user', () => {
      const mockUser = new User();
      mockUser.email = 'test@example.com';
      mockUser.password = 'password123';
      mockUser.salt = 'somesaltvalue';

      const result = authController.retrieveCurrentUser(mockUser);

      expect(result).toEqual({ email: 'test@example.com' });
    });
  });
});
