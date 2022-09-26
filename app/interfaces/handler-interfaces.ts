////////////////// RAW Request
// note that headers and body are not parsed
interface IRawRequest {
  rawBody: string; // sometimes the string which was originally in the HTTP request body is needed for some lower-level modules
}

///////////////// Trace context

export type ITraceContext = {
  correlationId: string;
  paymentKey?: string; // optional, because in a common case it's impossible to extract the value
}

type IRequestWithTraceContext = {
  traceContext?: ITraceContext // see: https://planet.atlassian.net/browse/INC-156
}

///////////////// Abstract Request/Response
// with PARSED headers and body (UNKNOWN STRUCTURED)

export type IAbstractHeaders = Record<string, string>;
export type IAbstractBody = string | Record<string, unknown>;

export type IAbstractRequest = IRawRequest
  & IRequestWithTraceContext
  & {
    headers?: IAbstractHeaders;
    body: IAbstractBody;
  }

export interface IAbstractResponse {
  statusCode: number;
  body: IAbstractBody;
}

export interface IAbstractRequestHandler {
  (req: IAbstractRequest): Promise<IAbstractResponse>;
}

export interface IAbstractToEnvHandlerAdapter<IEnvironmentReq, IEnvironmentRes> {
  createEnvSpecificHandler(handler: IAbstractRequestHandler): (req: IEnvironmentReq) => Promise<IEnvironmentRes>
}

///////////////// TYPED Request/Response
// (with PARSED headers and body (of type TRequestBody)

export type IAbstractRequestWithTypedBody<TRequestBody> = IRawRequest
  & IRequestWithTraceContext
  & {
    headers?: IAbstractHeaders;
    body: TRequestBody;
  }

export interface IAbstractRequestHandlerWithTypedInput<TRequestBody> {
  (req: IAbstractRequestWithTypedBody<TRequestBody>): Promise<IAbstractResponse>;
}
