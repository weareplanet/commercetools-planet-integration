import { IAbstractHeaders } from './handler-interfaces';

export type IAnyObjectWithStringKeys = Record<string, unknown>;

export const getHttpHeaderValue = (headers: IAbstractHeaders = {}, caseSensitiveHeaderName: string) => {
  return headers[caseSensitiveHeaderName]
    // In Datatrans/CommerceTools documentation header names are Camel-Cased (for example, 'Datatrans-SIgnature').
    // But AWS API Gateway provides them lower-cased.
    || headers[caseSensitiveHeaderName.toLowerCase()]
    || '';
};
