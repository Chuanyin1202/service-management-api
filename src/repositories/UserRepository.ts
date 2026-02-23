import { User, UserCreationAttributes } from '../models/User';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  }

  async create(data: UserCreationAttributes): Promise<User> {
    return User.create(data);
  }
}
