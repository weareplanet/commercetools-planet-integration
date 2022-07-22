export enum ICommerceToolsErrorCode {
  InvalidInput = 'InvalidInput'
}


export interface ICommerceToolsError {
  code: ICommerceToolsErrorCode;
  message: string;
  localizedMessage?: string;
  extensionExtraInfo?: Record<string, unknown>;
}
