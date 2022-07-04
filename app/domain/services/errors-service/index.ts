import { InvalidInputError } from '@commercetools/platform-sdk';

import { ICommerceToolsError, ICommerceToolsErrorCode } from '@app/interfaces';

export class FailedValidationError implements InvalidInputError {
  readonly code = ICommerceToolsErrorCode.InvalidInput;
  message: string;
  extensionExtraInfo?: Record<string, unknown>;

  constructor(message: string, extensionExtraInfo?: Record<string, unknown>) {
    this.message = message;

    if (extensionExtraInfo) {
      delete extensionExtraInfo?.config;
      delete extensionExtraInfo?.stack;

      this.extensionExtraInfo = extensionExtraInfo;
    }
  }
}

export function isDataTransError(err: ICommerceToolsError) {
  return err instanceof FailedValidationError;
}
