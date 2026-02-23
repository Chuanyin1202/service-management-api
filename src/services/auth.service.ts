import { ServiceSchema, Context } from 'moleculer';
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
        const error = new Error('Email already registered') as Error & { code: number };
        error.code = 409;
        throw error;
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
        const error = new Error('Invalid email or password') as Error & { code: number };
        error.code = 401;
        throw error;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        const error = new Error('Invalid email or password') as Error & { code: number };
        error.code = 401;
        throw error;
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
