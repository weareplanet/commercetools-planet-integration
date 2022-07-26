
/**
 Represents an error decorator with log message
 */
export class NestedError {
  /**
   * Initializes an NestedError
   * @param innerError - error object
   * @param message - message that need to be logged
   */
  constructor(
    public readonly innerError: Error,
    public readonly message: string
  ) { }
}
