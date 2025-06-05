import {
  email,
  maxLength,
  minLength,
  object,
  pipe,
  string,
  type InferInput,
} from "valibot";

export const emailSchema = pipe(
  string(),
  email(),
  maxLength(255, "El correo no debe exceder 255 caracteres")
);

export const passwordSchema = pipe(
  string(),
  minLength(6, "La contraseña debe tener al menos 6 caracteres"),
  maxLength(50, "La contraseña no debe exceder 50 caracteres")
);

export const authSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export type AuthInput = InferInput<typeof authSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}
