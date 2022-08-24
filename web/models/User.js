import { Adapter } from "next-auth/adapters"

// Extend the built-in models using class inheritance
export default class User extends Adapter.Prisma.Models.User.model {
  constructor(name, email, image, emailVerified, role) {
    super(name, email, image, emailVerified)
    if (role) { this.role = role}
  }
}

export const UserSchema = {
  name: "User",
  target: User,
  columns: {
    ...Adapter.Prisma.Models.User.schema.columns,
    role: {
      type: "varchar",
      nullable: true
    },
  },
}