// Any object in the request body

export type IAbstractHeaders = Record<string, string>;
export type IAbstractBody = string | Record<string, unknown>;

export interface IAbstractRequest {
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

// Specific object in the request body

export interface IAbstractRequestWithTypedBody<TRequestBody> {
  headers?: IAbstractHeaders;
  body: TRequestBody;
}

export interface IAbstractRequestHandlerWithTypedInput<TRequestBody> {
  (req: IAbstractRequestWithTypedBody<TRequestBody>): Promise<IAbstractResponse>;
}
