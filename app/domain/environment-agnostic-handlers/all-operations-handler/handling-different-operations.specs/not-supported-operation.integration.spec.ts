import { HttpStatusCode } from 'http-status-code-const-enum';

import { abstractRequestFactory } from '../../../../../test/test-utils';

import handler from '..';

describe('All-operations handler', () => {

  describe('When CommerceTools sends a request with body which doesn\'t match any operation criteria', () => {
    it('should return 200 response with an empty list of actions', async () => {
      const notSupportedOperationRequest = {
        body: {
          resource: {
            obj: {}
          }
        }
      };

      const req = abstractRequestFactory(notSupportedOperationRequest);
      const result = await handler(req);

      expect(result).toEqual(
        {
          statusCode: HttpStatusCode.OK,
          body: { 'actions': [] }
        }
      );
    });
  });

});
