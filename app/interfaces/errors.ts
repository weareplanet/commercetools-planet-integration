
/**
 Represents an error decorator with log message
 */
export class NestedError {
  /**
   * Initializes an NestedError
   * @param error  - error body
   * @param message - message that need to be logged
   */
  constructor(
    public readonly error: Record<string, unknown>,
    public readonly message: string
  ) { }
}
