import { Model, DataTypes, Sequelize } from 'sequelize';

export interface AppointmentServiceAttributes {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  showTime?: number | null;
  order?: number;
  isRemove?: boolean;
  isPublic?: boolean;
  ShopId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentServiceCreationAttributes
  extends Omit<AppointmentServiceAttributes, 'id' | 'order' | 'isRemove' | 'isPublic' | 'createdAt' | 'updatedAt'> {}

export class AppointmentService
  extends Model<AppointmentServiceAttributes, AppointmentServiceCreationAttributes>
  implements AppointmentServiceAttributes
{
  public id!: string;
  public name!: string;
  public description!: string | null;
  public price!: number;
  public showTime!: number | null;
  public order!: number;
  public isRemove!: boolean;
  public isPublic!: boolean;
  public ShopId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof AppointmentService {
    AppointmentService.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        price: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        showTime: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isRemove: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        ShopId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'AppointmentServices',
        timestamps: true,
      },
    );
    return AppointmentService;
  }
}
