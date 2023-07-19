import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from '../config/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env` || '.development.env',
    }),
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
