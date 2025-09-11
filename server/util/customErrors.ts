export class UserNotFoundError extends Error {
  public readonly code = "USER_NOT_FOUND";
  constructor(userId: string) {
    super(`User with id '${userId}' not found.`);
    this.name = "UserNotFoundError";
  }
}
