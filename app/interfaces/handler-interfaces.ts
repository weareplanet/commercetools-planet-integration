import { APIGatewayProxyResult } from 'aws-lambda';

// Any object in the request body
export interface IAbstractRequest {
  body: Record<string, unknown>;
}

export interface IAbstractResponse {
  statusCode: number;
  body?: Record<string, unknown>;
}

export interface IAbstractRequestHandler {
  (req: IAbstractRequest): Promise<IAbstractResponse>;
}

export interface IAbstractToEnvHandlerAdapter<IEnvironmentReq, IEnvironmentRes> {
  createEnvSpecificHandler(handler: IAbstractRequestHandler): (req: IEnvironmentReq) => Promise<IEnvironmentRes>
}

// Specific object in the request body

export interface IAbstractRequestWithTypedBody<TRequestBody> {
  body: TRequestBody;
}

export interface IAbstractRequestHandlerWithTypedInput<TRequestBody> {
  (req: IAbstractRequestWithTypedBody<TRequestBody>): Promise<IAbstractResponse>;
}

export interface IAWSAPIGatewayProxyResult extends Pick<APIGatewayProxyResult, 'statusCode' | 'headers' | 'multiValueHeaders' | 'isBase64Encoded'> {
  body?: string;
}
