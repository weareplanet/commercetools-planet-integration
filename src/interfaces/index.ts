export interface EnvironmentAgnosticRequest {
  body: string;
}

export interface EnvironmentAgnosticResponse {
  statusCode: number;
  body: string;
}

export interface EnvironmentAgnosticHandler {
  (req: EnvironmentAgnosticRequest): Promise<EnvironmentAgnosticResponse>;
}
