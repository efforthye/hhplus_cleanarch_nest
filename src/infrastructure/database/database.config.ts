import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'lecture',
  entities: [path.join(__dirname, '../../domain/entities/*.entity{.ts,.js}')],
  synchronize: true,  // 개발환경에서만 true
  logging: true,
  autoLoadEntities: true,
  charset: 'utf8mb4'
};