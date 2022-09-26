import _merge from 'lodash.merge';

import { RecursivePartial } from '..';
import {
  IAnyObjectWithStringKeys,
  IAbstractRequest,
  IAbstractHeaders
} from '../../../app/interfaces';

export const abstractRequestFactory = (explicitRequest: RecursivePartial<IAbstractRequest> | IAnyObjectWithStringKeys = {}): IAbstractRequest => {
  const defaultBody = {};
  const defaultRequest = {
    headers: {} as IAbstractHeaders,
    body: defaultBody,
    rawBody: JSON.stringify(defaultBody),
    traceContext: {
      correlationId: 'test correlationId'
    }
  };

  if (explicitRequest.body) {
    explicitRequest.rawBody = JSON.stringify(explicitRequest.body);
  }

  return _merge(
    defaultRequest,
    explicitRequest
  );
};
