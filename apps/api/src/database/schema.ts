export interface DB {
  users: UsersTable;
}

interface UsersTable {
  id: string;
  email: string;
  hashed_password: string;
  name: string;
  created_at: Date;
}
