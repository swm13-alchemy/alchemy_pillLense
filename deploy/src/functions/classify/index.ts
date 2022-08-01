import { handlerPath } from '@libs/handlerResolver';
import { AWSFunction } from '@libs/lambda';
import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'classify',
        request: {
          schemas: {
            'application/json': schema
          }
        }
      }
    }
  ]
} as AWSFunction;
