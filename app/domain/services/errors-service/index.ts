import { InvalidInputError } from '@commercetools/platform-sdk';

import { ICommerceToolsError, ICommerceToolsErrorCode } from '../../../interfaces';

export class ErrorForCommerceTools implements InvalidInputError {
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

export function isErrorForCommerceTools(err: ICommerceToolsError) {
  return err instanceof ErrorForCommerceTools;
}
