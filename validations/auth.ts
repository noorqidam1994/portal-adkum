import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(
    v.string("Email is required"),
    v.minLength(1, "Email is required"),
    v.email("Please enter a valid email address")
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.minLength(1, "Password is required")
  ),
});

export type LoginInput = v.InferOutput<typeof LoginSchema>;

export const CreateUserSchema = v.object({
  name: v.pipe(
    v.string("Name is required"),
    v.minLength(2, "Name must be at least 2 characters")
  ),
  email: v.pipe(
    v.string("Email is required"),
    v.email("Please enter a valid email address")
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.minLength(8, "Password must be at least 8 characters")
  ),
  role: v.picklist(["superadmin", "admin"], "Invalid role"),
});

export type CreateUserInput = v.InferOutput<typeof CreateUserSchema>;

export const UpdateUserSchema = v.object({
  name: v.optional(
    v.pipe(v.string(), v.minLength(2, "Name must be at least 2 characters"))
  ),
  password: v.optional(
    v.pipe(
      v.string(),
      v.minLength(8, "Password must be at least 8 characters")
    )
  ),
  role: v.optional(v.picklist(["superadmin", "admin"], "Invalid role")),
  isActive: v.optional(v.boolean()),
});

export type UpdateUserInput = v.InferOutput<typeof UpdateUserSchema>;

export const ChangePasswordSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(
      v.string("Current password is required"),
      v.minLength(1, "Current password is required")
    ),
    newPassword: v.pipe(
      v.string("New password is required"),
      v.minLength(8, "Password must be at least 8 characters"),
      v.regex(/[a-z]/, "Password must contain a lowercase letter"),
      v.regex(/[A-Z]/, "Password must contain an uppercase letter"),
      v.regex(/[0-9]/, "Password must contain a number"),
      v.regex(/[^a-zA-Z0-9]/, "Password must contain a symbol")
    ),
    confirmPassword: v.pipe(
      v.string("Please confirm your new password"),
      v.minLength(1, "Please confirm your new password")
    ),
  }),
  v.check(
    (val) => val.newPassword === val.confirmPassword,
    "Passwords do not match"
  )
);

export type ChangePasswordInput = v.InferOutput<typeof ChangePasswordSchema>;
