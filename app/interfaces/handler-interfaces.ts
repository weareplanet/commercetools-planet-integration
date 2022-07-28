///////////////// RAW Request
// with NOT PARSED (string) headers/body
interface IRawRequest {
  // rawHeaders?: // so far we assume this is not needed
  rawBody: string; // sometimes the string which was originally in the HTTP request body is needed for some lower-level modules
}

///////////////// Tracing context

export interface ITracingRequestContext {
  correlationId: string;
  paymentKey?: number; // optional - just because it's not convenient to extract the value at the top level (in a business-logic unaware adapter)
}

export interface IRequestWithTracingContext {
  tracingContext?: ITracingRequestContext // TODO: make it not optional when all the functionality is working (this requires many corrections in tests)
}

///////////////// Abstract Request/Response
// with PARSED headers and body (UNKNOWN STRUCTURED)

export type IAbstractHeaders = Record<string, string>;
export type IAbstractBody = string | Record<string, unknown>;

export type IAbstractRequest = IRawRequest
  & IRequestWithTracingContext
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
  & IRequestWithTracingContext
  & {
    headers?: IAbstractHeaders;
    body: TRequestBody;
  }

export interface IAbstractRequestHandlerWithTypedInput<TRequestBody> {
  (req: IAbstractRequestWithTypedBody<TRequestBody>): Promise<IAbstractResponse>;
}
