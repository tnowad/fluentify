export interface DB {
  users: UsersTable;
}

interface UsersTable {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
}
