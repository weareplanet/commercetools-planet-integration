import { HttpStatusCode } from 'http-status-code-const-enum';
import handler from './handler';

describe('Main handler', () => {
  it('should go throw default flow', async () => {
    const req = {
      body: {
        resource: {
          obj: {}
        }
      }
    };

    const result = await handler(req);

    expect(result).toEqual(
      {
        statusCode: HttpStatusCode.OK,
        body: {
          actions: []
        }
      }
    );
  });
});
