import { prisma } from "@/config/database";
import { jwtConfig } from "@/config/jwt";
import { logger } from "@/utils/logger";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import type { AuthInput, AuthTokens, User } from "@/models/auth.model";

type LoginResponse = {
  user: User;
  tokens: AuthTokens;
};

type RefreshTokenResponse = {
  accessToken: string;
  newRefreshToken: string;
};

export class AuthService {
  static async register(credentials: AuthInput): Promise<User> {
    try {
      const userExist = await prisma.usuario.findUnique({
        where: { correo: credentials.email },
      });

      if (userExist) {
        throw new Error("El correo ya está registrado");
      }

      const hashedPassword = await hash(credentials.password, 10);
      const user = await prisma.usuario.create({
        data: {
          correo: credentials.email,
          contrasena: hashedPassword,
        },
        select: {
          id: true,
          correo: true,
          creado_en: true,
          actualizado_en: true,
        },
      });

      return {
        id: user.id,
        email: user.correo,
        created_at: user.creado_en,
        updated_at: user.actualizado_en,
      };
    } catch (error) {
      logger.error("Error en registro:", error);
      throw error;
    }
  }

  static async login(credentials: AuthInput): Promise<LoginResponse> {
    try {
      const user = await prisma.usuario.findUnique({
        where: { correo: credentials.email },
        select: {
          id: true,
          correo: true,
          contrasena: true,
          creado_en: true,
          actualizado_en: true,
        },
      });

      if (!user || !(await compare(credentials.password, user.contrasena))) {
        throw new Error("Credenciales inválidas");
      }

      const accessToken = sign(
        { userId: user.id },
        jwtConfig.secret,
        { expiresIn: "2d" },
      );

      const refreshToken = sign(
        { userId: user.id },
        jwtConfig.secret,
        { expiresIn: "7d" },
      );

      await prisma.refresh_tokens.create({
        data: {
          token: refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          usuario_id: user.id,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.correo,
          created_at: user.creado_en,
          updated_at: user.actualizado_en,
        },
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      logger.error("Error en login:", error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const tokenRecord = await prisma.refresh_tokens.findFirst({
        where: {
          token: refreshToken,
          expires_at: { gt: new Date() },
        },
        include: { usuario: true },
      });

      if (!tokenRecord) {
        throw new Error("Refresh token inválido o expirado");
      }

      const newAccessToken = sign(
        { userId: tokenRecord.usuario.id },
        jwtConfig.secret,
        { expiresIn: "2d" },
      );

      await prisma.refresh_tokens.delete({ where: { id: tokenRecord.id } });

      const newRefreshToken = sign(
        { userId: tokenRecord.usuario.id },
        jwtConfig.secret,
        { expiresIn: "7d" },
      );

      await prisma.refresh_tokens.create({
        data: {
          token: newRefreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          usuario_id: tokenRecord.usuario.id,
        },
      });

      return { accessToken: newAccessToken, newRefreshToken };
    } catch (error) {
      logger.error("Error en refresh token:", error);
      throw error;
    }
  }

  static async getCurrentUser(userId: string): Promise<User> {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          correo: true,
          creado_en: true,
          actualizado_en: true,
        },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return {
        id: user.id,
        email: user.correo,
        created_at: user.creado_en,
        updated_at: user.actualizado_en,
      };
    } catch (error) {
      logger.error("Error al obtener usuario:", error);
      throw error;
    }
  }
}