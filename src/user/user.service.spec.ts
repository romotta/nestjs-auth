import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let userService: UserService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // You can mock the Repository class or use a mock library like TypeORM Mocks.
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    const email = 'test@example.com';
    const password = 'password';
    const salt = 'salt';
    const hashedPassword = 'hashedPassword';

    beforeEach(() => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(salt);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
    });

    it('should create a new user', async () => {
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.salt = salt;

      jest.spyOn(usersRepository, 'save').mockResolvedValue(user);

      const createdUser = await userService.createUser(email, password);

      expect(createdUser).toEqual(user);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
    });

    it('should find user by email', async () => {
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.salt = salt;

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);

      const foundUser = await userService.getUserByEmail(user.email);

      expect(foundUser).toEqual(user);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const error = {
        code: '23505',
      };

      jest.spyOn(usersRepository, 'save').mockRejectedValue(error);

      await expect(userService.createUser(email, password)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      const error = new Error('Some error');

      jest.spyOn(usersRepository, 'save').mockRejectedValue(error);

      await expect(userService.createUser(email, password)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
