// Any object in the request body

export type IAbstarctHeaders = Record<string, string>;

export interface IAbstractRequest {
  headers?: IAbstarctHeaders;
  body: string | Record<string, unknown>;
}

export interface IAbstractResponse {
  statusCode: number;
  body: string | Record<string, unknown>;
}

export interface IAbstractRequestHandler {
  (req: IAbstractRequest): Promise<IAbstractResponse>;
}

export interface IAbstractToEnvHandlerAdapter<IEnvironmentReq, IEnvironmentRes> {
  createEnvSpecificHandler(handler: IAbstractRequestHandler): (req: IEnvironmentReq) => Promise<IEnvironmentRes>
}

// Specific object in the request body

export interface IAbstractRequestWithTypedBody<TRequestBody> {
  headers?: IAbstarctHeaders;
  body: TRequestBody;
}

export interface IAbstractRequestHandlerWithTypedInput<TRequestBody> {
  (req: IAbstractRequestWithTypedBody<TRequestBody>): Promise<IAbstractResponse>;
}
