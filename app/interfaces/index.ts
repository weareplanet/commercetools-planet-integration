// Any object in the request body

export interface AbstractRequest {
  body: Record<string, unknown>;
}

export interface AbstractResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

export interface AbstractRequestHandler {
  (req: AbstractRequest): Promise<AbstractResponse>;
}

export interface AbstractAdapter<EnvironmentReq, EnvironmentRes> {
  cloudRequestToAbstract(cloudRequest: EnvironmentReq): AbstractRequest;
  abstractResponseToCloud(abstractResponse: AbstractResponse): EnvironmentRes;
}

// Specific object in the request body

export interface AbstractRequestWithTypedBody<TRequestBody> {
  body: TRequestBody;
}

export interface AbstractRequestHandlerWithTypedInput<TRequestBody> {
  (req: AbstractRequestWithTypedBody<TRequestBody>): Promise<AbstractResponse>;
}
