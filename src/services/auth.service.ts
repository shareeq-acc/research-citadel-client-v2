/**
 * Authentication service — wraps every /auth endpoint.
 *
 * The backend sets the JWT inside an HTTP-only cookie, so we never
 * manually store or forward a token. `withCredentials: true` on the
 * axios instance handles that transparently.
 */

import { get, post, put } from "@/lib/http-client";
import type { User } from "@/types";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SendOtpPayload {
  email: string;
  type: OtpType;
  otpChannel: OtpChannel;
}

export interface VerifyOtpPayload extends SendOtpPayload {
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  resetToken: string;
}

// ── Enums (mirror the Prisma / backend enums) ─────────────────────────────────

export type OtpType =
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "PHONE_VERIFICATION"
  | "LOGIN_VERIFICATION"
  | "TWO_FACTOR_AUTH";

export type OtpChannel = "EMAIL" | "SMS";

// ── Response shapes ───────────────────────────────────────────────────────────

export interface AuthUser extends User {}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface OtpResult {
  token?: string; // present only for PASSWORD_RESET
}

// ── Service methods ───────────────────────────────────────────────────────────

const authService = {
  /**
   * Register a new account.
   * On success the server also sets an HTTP-only JWT cookie.
   */
  register(payload: RegisterPayload) {
    return post<AuthResult>("/auth/register", payload);
  },

  /**
   * Sign in with email + password.
   * On success the server sets an HTTP-only JWT cookie.
   */
  login(payload: LoginPayload) {
    return post<AuthResult>("/auth/login", payload);
  },

  /**
   * Invalidate the session and clear the JWT cookie server-side.
   */
  logout() {
    return post<void>("/auth/logout");
  },

  /**
   * Send a one-time password to the given email/channel.
   */
  sendOtp(payload: SendOtpPayload) {
    return post<string>("/auth/send-otp", payload);
  },

  /**
   * Re-send the last OTP (respects the server-side resend interval).
   */
  resendOtp(payload: SendOtpPayload) {
    return post<void>("/auth/resend-otp", payload);
  },

  /**
   * Verify a one-time password.
   * Returns a reset token when `type === "PASSWORD_RESET"`.
   */
  verifyOtp(payload: VerifyOtpPayload) {
    return post<OtpResult>("/auth/verify-otp", payload);
  },

  /**
   * Trigger an email-verification OTP for the currently logged-in user.
   * Requires a valid session cookie.
   */
  requestEmailVerification() {
    return put<void>("/auth/verify-email");
  },

  /**
   * Begin the forgot-password flow (sends OTP to the supplied email).
   */
  forgotPassword(payload: ForgotPasswordPayload) {
    return post<void>("/auth/forgot-password", payload);
  },

  /**
   * Complete a password reset using the token obtained from OTP verification.
   */
  resetPassword(payload: ResetPasswordPayload) {
    return post<void>("/auth/reset-password", payload);
  },
} as const;

export default authService;
