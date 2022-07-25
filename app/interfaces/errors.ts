
/**
 Represents an error decorator with log message
 */
export class StructuredError {
  /**
   * Initializes an StructuredError
   * @param error  - error body
   * @param message - message that need to be logged
   */
  constructor(
    public readonly error: Record<string, unknown>,
    public readonly message: string
  ) { }
}
