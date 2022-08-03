import _merge from 'lodash.merge';

import { RecursivePartial } from '..';
import {
  IAnyObjectWithStringKeys,
  IAbstractRequest,
  IAbstractHeaders
} from '../../../app/interfaces';

// TODO: I had to add `| IAnyObjectWithStringKeys` to the signature, but that's not so good. Investigate and improve.
export const abstractRequestFactory = (requestExplicitStuff: RecursivePartial<IAbstractRequest> | IAnyObjectWithStringKeys = {}): IAbstractRequest => {
  const defaultBody = {};
  const defaultStuff = {
    headers: {} as IAbstractHeaders,
    body: defaultBody,
    rawBody: JSON.stringify(defaultBody),
    traceContext: {
      correlationId: 'test correlationId'
    }
  };

  if (requestExplicitStuff.body) {
    requestExplicitStuff.rawBody = JSON.stringify(requestExplicitStuff.body);
  }

  return _merge(
    defaultStuff,
    requestExplicitStuff
  );
};
