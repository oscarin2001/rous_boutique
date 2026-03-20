export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthUser {
  authId: number;
  employeeId: number;
  username: string;
  roleCode: string;
  firstName: string;
  lastName: string;
}
