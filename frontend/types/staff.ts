export interface StaffUser {
  id: string;
  username: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
