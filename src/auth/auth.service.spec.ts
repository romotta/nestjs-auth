import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dtos/loginResponse.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>('UserRepository');
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signIn', () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password',
      salt: 'salt',
    };

    it('should return a login response with access token if credentials are valid', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(mockUser);
      authService.validatePassword = jest.fn().mockResolvedValue(true);

      const result: LoginResponseDto = await authService.signIn(
        mockUser.email,
        mockUser.password,
      );

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(authService.validatePassword).toHaveBeenCalledWith(
        mockUser.password,
        mockUser.password,
        mockUser.salt,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email });
      expect(result.accessToken).toBe('fakeAccessToken');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(undefined);

      await expect(
        authService.signIn(mockUser.email, mockUser.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(mockUser);
      authService.validatePassword = jest.fn().mockResolvedValue(false);

      await expect(
        authService.signIn(mockUser.email, mockUser.password),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validatePassword', () => {
    const password = 'password';
    const hashedPassword = 'hashedPassword';
    const salt = 'salt';

    it('should return true if password is valid', async () => {
      const bcryptMock = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(hashedPassword);

      const result = await authService.validatePassword(
        password,
        hashedPassword,
        salt,
      );

      expect(bcryptMock).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(true);
    });

    it('should return false if password is invalid', async () => {
      const bcryptMock = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('wrongHash');

      const result = await authService.validatePassword(
        password,
        hashedPassword,
        salt,
      );

      expect(bcryptMock).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(false);
    });
  });
});
