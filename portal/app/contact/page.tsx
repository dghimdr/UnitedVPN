"use client";

import Link from "next/link";
import type { Language } from "@/lib/i18n";
import { useLanguage } from "../language-provider";

const supportEmail = "support@unitedvpn.uk";

const contactCopy = {
  en: {
    title: "Contact",
    updated: "Last updated: June 18, 2026",
    intro:
      "For questions about your account, VPN access, approval status, or technical issues, contact UNITEDVPN support.",
    emailLabel: "Support email",
    mailButton: "Email support",
    guidanceTitle: "What to include",
    guidance: [
      "Your account email",
      "Device type, such as iPhone, Android, Mac, or Windows",
      "VPN location, such as Singapore or UK",
      "Short description of the issue"
    ],
    note:
      "Do not send passwords, private keys, or sensitive personal information in support messages.",
    back: "Back to home"
  },
  ko: {
    title: "문의하기",
    updated: "마지막 업데이트: 2026년 6월 18일",
    intro:
      "계정, VPN 접속, 승인 상태, 기술적인 문제에 대한 문의는 UNITEDVPN 지원팀으로 연락해 주세요.",
    emailLabel: "지원 이메일",
    mailButton: "지원팀에 이메일 보내기",
    guidanceTitle: "문의 시 포함하면 좋은 정보",
    guidance: [
      "가입 이메일",
      "사용 기기, 예: iPhone, Android, Mac, Windows",
      "VPN 위치, 예: 싱가포르 또는 영국",
      "문제 상황에 대한 간단한 설명"
    ],
    note:
      "지원 메시지에는 비밀번호, 개인 키, 민감한 개인정보를 포함하지 마세요.",
    back: "홈으로 돌아가기"
  }
} satisfies Record<
  Language,
  {
    title: string;
    updated: string;
    intro: string;
    emailLabel: string;
    mailButton: string;
    guidanceTitle: string;
    guidance: string[];
    note: string;
    back: string;
  }
>;

function getSupportMailto(lang: Language) {
  // Function Role: Builds a localized mailto link without adding a non-working contact form.
  const subject =
    lang === "ko"
      ? "UNITEDVPN 지원 문의"
      : "UNITEDVPN support request";
  const body =
    lang === "ko"
      ? [
          "가입 이메일:",
          "사용 기기:",
          "VPN 위치:",
          "문제 설명:"
        ].join("\n")
      : [
          "Account email:",
          "Device type:",
          "VPN location:",
          "Issue description:"
        ].join("\n");

  // Result Return: Encoded mailto URL opens the user's email client with helpful fields prefilled.
  return `mailto:${supportEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export default function ContactPage() {
  // Function Role: Renders the localized contact page with reliable email support instructions.
  const { lang } = useLanguage();
  const copy = contactCopy[lang];

  return (
    <main className="legal-page">
      <section className="legal-header">
        <p className="eyebrow">UnitedVPN</p>
        <h1>{copy.title}</h1>
        <p>{copy.updated}</p>
        <Link className="button secondary legal-back-link" href="/">
          {copy.back}
        </Link>
      </section>
      <section className="legal-content" aria-label={copy.title}>
        <p className="legal-intro">{copy.intro}</p>
        <article className="legal-section contact-card">
          <h2>{copy.emailLabel}</h2>
          <p>
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
          <a className="button" href={getSupportMailto(lang)}>
            {copy.mailButton}
          </a>
        </article>
        <article className="legal-section">
          <h2>{copy.guidanceTitle}</h2>
          <ul className="legal-list">
            {copy.guidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{copy.note}</p>
        </article>
      </section>
    </main>
  );
}
