import { InvalidInputError } from '@commercetools/platform-sdk';

export class FailedValidationError implements InvalidInputError {
  readonly code = 'InvalidInput';
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
