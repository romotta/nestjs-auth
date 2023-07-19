import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../src/entity/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'fooddelivery',
  logging: true,
  migrations: ['dist/migrations/*.js'],
  entities: [User],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
