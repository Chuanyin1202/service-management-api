import { ServiceSchema, Context, Errors } from 'moleculer';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

const userRepository = new UserRepository();

const AuthService: ServiceSchema = {
  name: 'auth',

  actions: {
    async register(ctx: Context<{ email: string; password: string; name: string }>) {
      const { email, password, name } = ctx.params;

      const existing = await userRepository.findByEmail(email);
      if (existing) {
        throw new Errors.MoleculerClientError('Email already registered', 409, 'CONFLICT');
      }

      const hashedPassword = await hashPassword(password);
      const user = await userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    },

    async login(ctx: Context<{ email: string; password: string }>) {
      const { email, password } = ctx.params;

      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Errors.MoleculerClientError('Invalid email or password', 401, 'UNAUTHORIZED');
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new Errors.MoleculerClientError('Invalid email or password', 401, 'UNAUTHORIZED');
      }

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    },
  },
};

export default AuthService;
