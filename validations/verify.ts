import * as v from "valibot";

export const VerifyPasswordSchema = v.object({
  password: v.pipe(
    v.string("Password is required"),
    v.minLength(1, "Password is required")
  ),
});

export type VerifyPasswordInput = v.InferOutput<typeof VerifyPasswordSchema>;
