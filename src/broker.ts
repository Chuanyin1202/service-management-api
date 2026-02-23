import { ServiceBroker } from 'moleculer';
import { appConfig } from './config/app';

const broker = new ServiceBroker({
  nodeID: 'service-management-node',
  logger: {
    type: 'Pino',
    options: {
      level: appConfig.nodeEnv === 'test' ? 'error' : 'info',
    },
  },
  transporter: null,
});

export default broker;
