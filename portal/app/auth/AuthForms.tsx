"use client";

import type React from "react";
import Link from "next/link";
import { signIn, signUp } from "@/lib/actions";
import type { Language } from "@/lib/i18n";
import { useLanguage } from "../language-provider";

type AuthMode = "login" | "signup";
type AuthCopy = {
  title: string;
  intro?: string;
  guidance: string;
  email: string;
  emailPlaceholder: string;
  emailHelp: string;
  emailRequired: string;
  emailInvalid: string;
  password: string;
  passwordPlaceholder: string;
  passwordHelp: string;
  passwordRequired: string;
  passwordInvalid: string;
  submit: string;
  loading: string;
  success: string;
  footer: string;
  link: string;
};

const authCopy = {
  login: {
    en: {
      title: "Log in",
      guidance:
        "Approved members can use VPN profiles after signing in. Choose Singapore or United Kingdom in your dashboard, then connect with WireGuard.",
      email: "Email",
      emailPlaceholder: "you@example.com",
      emailHelp: "Enter the email address approved for UnitedVPN.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      password: "Password",
      passwordPlaceholder: "Your password",
      passwordHelp: "Use the password for your approved member account.",
      passwordRequired: "Please enter your password.",
      passwordInvalid: "Please check your password.",
      submit: "Log in",
      loading: "Logging in",
      success: "Login successful. Redirecting to your dashboard.",
      footer: "Don't have an account?",
      link: "Request access"
    },
    ko: {
      title: "로그인",
      guidance:
        "승인된 멤버만 VPN 프로필을 사용할 수 있습니다. 로그인 후 대시보드에서 Singapore 또는 UK를 선택하고 WireGuard로 연결하세요.",
      email: "이메일",
      emailPlaceholder: "you@example.com",
      emailHelp: "UnitedVPN 승인을 받은 이메일 주소를 입력해 주세요.",
      emailRequired: "이메일 주소를 입력해 주세요.",
      emailInvalid: "올바른 이메일 주소를 입력해 주세요.",
      password: "비밀번호",
      passwordPlaceholder: "비밀번호를 입력해 주세요",
      passwordHelp: "승인된 멤버 계정의 비밀번호를 입력해 주세요.",
      passwordRequired: "비밀번호를 입력해 주세요.",
      passwordInvalid: "비밀번호를 확인해 주세요.",
      submit: "로그인하기",
      loading: "로그인 중입니다",
      success: "로그인했습니다. 대시보드로 이동합니다.",
      footer: "계정이 없으신가요?",
      link: "신청하기"
    }
  },
  signup: {
    en: {
      title: "Request access",
      intro:
        "Request invite-only membership. After approval, your VPN profile can be issued.",
      guidance:
        "UNITEDVPN currently supports Singapore and United Kingdom VPN locations. Each location uses a separate WireGuard profile.",
      email: "Email",
      emailPlaceholder: "you@example.com",
      emailHelp: "Use the email address you want reviewed for membership.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      passwordHelp: "Use at least 8 characters.",
      passwordRequired: "Please enter a password.",
      passwordInvalid: "Please use a password with at least 8 characters.",
      submit: "Submit request",
      loading: "Submitting request",
      success: "Your request has been submitted.",
      footer: "Already approved?",
      link: "Log in"
    },
    ko: {
      title: "초대 멤버십 신청",
      intro:
        "신청 후 승인되면 VPN 프로필을 발급받을 수 있습니다.",
      guidance:
        "UNITEDVPN은 현재 Singapore와 UK VPN 서버를 지원합니다. 각 위치는 별도의 WireGuard 프로필을 사용합니다.",
      email: "이메일",
      emailPlaceholder: "you@example.com",
      emailHelp: "멤버십 검토를 받을 이메일 주소를 입력해 주세요.",
      emailRequired: "이메일 주소를 입력해 주세요.",
      emailInvalid: "올바른 이메일 주소를 입력해 주세요.",
      password: "비밀번호",
      passwordPlaceholder: "8자 이상 입력해 주세요",
      passwordHelp: "비밀번호는 8자 이상이어야 합니다.",
      passwordRequired: "비밀번호를 입력해 주세요.",
      passwordInvalid: "비밀번호를 확인해 주세요.",
      submit: "제출하기",
      loading: "신청을 제출하는 중입니다",
      success: "신청을 제출했습니다.",
      footer: "이미 승인되었나요?",
      link: "로그인"
    }
  }
} satisfies Record<AuthMode, Record<Language, AuthCopy>>;

function getLocalizedAuthError(
  error: string | undefined,
  lang: Language,
  mode: AuthMode
) {
  // Function Role: Converts common provider errors into user-facing copy for the active language.
  if (!error) {
    // Result Return: No error text is rendered when the route has no error query parameter.
    return undefined;
  }

  const normalizedError = error.toLowerCase();

  // Control Flow & Business Branching: Match common Supabase auth failures without changing authentication behavior.
  if (
    normalizedError.includes("invalid login") ||
    normalizedError.includes("invalid credentials")
  ) {
    return lang === "ko"
      ? "이메일 또는 비밀번호를 확인해 주세요."
      : "Please check your email or password.";
  }

  if (
    normalizedError.includes("already registered") ||
    normalizedError.includes("already exists") ||
    normalizedError.includes("user already")
  ) {
    return lang === "ko"
      ? "이미 신청한 이메일입니다."
      : "This email has already been requested.";
  }

  if (normalizedError.includes("password")) {
    return authCopy[mode][lang].passwordInvalid;
  }

  if (normalizedError.includes("email")) {
    return authCopy[mode][lang].emailInvalid;
  }

  // Result Return: Fall back to a safe generic message so raw provider wording is not shown on Korean pages.
  return lang === "ko"
    ? "요청을 처리하지 못했습니다. 입력한 내용을 확인해 주세요."
    : error;
}

function setInputValidationMessage(
  event: React.FormEvent<HTMLInputElement>,
  requiredMessage: string,
  invalidMessage: string
) {
  // Function Role: Sets localized browser validation text for required and invalid form fields.
  const input = event.currentTarget;

  // Control Flow & Business Branching: Required fields need clearer guidance than generic type validation.
  if (input.validity.valueMissing) {
    input.setCustomValidity(requiredMessage);
    return;
  }

  // Result Return: Non-empty invalid values receive the field-specific validation message.
  input.setCustomValidity(invalidMessage);
}

export function LoginForm({ error }: { error?: string }) {
  // Function Role: Renders the localized login form for approved UnitedVPN members.
  const { lang } = useLanguage();
  const copy = authCopy.login[lang];
  const localizedError = getLocalizedAuthError(error, lang, "login");

  return (
    <section className="panel stack">
      <h1>{copy.title}</h1>
      <p>{copy.guidance}</p>
      {localizedError ? <p className="notice error">{localizedError}</p> : null}
      <form className="stack" action={signIn}>
        <label>
          {copy.email}
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            required
            aria-describedby="login-email-help"
            onInvalid={(event) =>
              setInputValidationMessage(
                event,
                copy.emailRequired,
                copy.emailInvalid
              )
            }
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
          <span id="login-email-help" className="field-help">
            {copy.emailHelp}
          </span>
        </label>
        <label>
          {copy.password}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={copy.passwordPlaceholder}
            required
            aria-describedby="login-password-help"
            onInvalid={(event) =>
              setInputValidationMessage(
                event,
                copy.passwordRequired,
                copy.passwordInvalid
              )
            }
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
          <span id="login-password-help" className="field-help">
            {copy.passwordHelp}
          </span>
        </label>
        <button type="submit">{copy.submit}</button>
      </form>
      <p>
        {copy.footer} <Link href="/signup">{copy.link}</Link>
      </p>
    </section>
  );
}

export function SignupForm({ error }: { error?: string }) {
  // Function Role: Renders the localized invite-only membership application form.
  const { lang } = useLanguage();
  const copy = authCopy.signup[lang];
  const localizedError = getLocalizedAuthError(error, lang, "signup");

  return (
    <section className="panel stack">
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
      <p>{copy.guidance}</p>
      {localizedError ? <p className="notice error">{localizedError}</p> : null}
      <form className="stack" action={signUp}>
        <label>
          {copy.email}
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            required
            aria-describedby="signup-email-help"
            onInvalid={(event) =>
              setInputValidationMessage(
                event,
                copy.emailRequired,
                copy.emailInvalid
              )
            }
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
          <span id="signup-email-help" className="field-help">
            {copy.emailHelp}
          </span>
        </label>
        <label>
          {copy.password}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={copy.passwordPlaceholder}
            minLength={8}
            required
            aria-describedby="signup-password-help"
            onInvalid={(event) =>
              setInputValidationMessage(
                event,
                copy.passwordRequired,
                copy.passwordInvalid
              )
            }
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
          <span id="signup-password-help" className="field-help">
            {copy.passwordHelp}
          </span>
        </label>
        <button type="submit">{copy.submit}</button>
      </form>
      <p>
        {copy.footer} <Link href="/login">{copy.link}</Link>
      </p>
    </section>
  );
}
