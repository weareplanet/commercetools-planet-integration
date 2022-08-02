import {
  IAnyObjectWithStringKeys,
  IAbstractRequest,
  IAbstractHeaders
} from '../../../app/interfaces';

export const abstractRequestFactory = (body: IAnyObjectWithStringKeys, headers: IAbstractHeaders = {}): IAbstractRequest => {
  return {
    headers,
    body,
    rawBody: JSON.stringify(body)
  };
};
