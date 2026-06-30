import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import databaseConfig from './config/db.config';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database config is undefined');
        }
        return {
          ...dbConfig,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    DepartmentModule,
    PositionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
