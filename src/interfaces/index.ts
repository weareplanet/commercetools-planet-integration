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
