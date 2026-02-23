import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database';
import { User } from './User';
import { AppointmentService } from './AppointmentService';

const env = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';
const config = databaseConfig[env];

const sequelize = new Sequelize({
  ...config,
  define: {
    timestamps: true,
  },
});

User.initModel(sequelize);
AppointmentService.initModel(sequelize);

export { sequelize, User, AppointmentService };
