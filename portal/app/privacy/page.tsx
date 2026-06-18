"use client";

import Link from "next/link";
import type { Language } from "@/lib/i18n";
import { useLanguage } from "../language-provider";

type LegalSection = {
  title: string;
  body: string[];
};

const lastUpdated = {
  en: "Last updated: June 18, 2026",
  ko: "마지막 업데이트: 2026년 6월 18일"
} satisfies Record<Language, string>;

const privacyCopy = {
  en: {
    title: "Privacy Policy",
    intro:
      "This MVP Privacy Policy explains how UNITEDVPN handles basic information for private, invite-only VPN access.",
    back: "Back to home",
    sections: [
      {
        title: "Overview",
        body: [
          "UNITEDVPN is a private VPN access portal for approved members. It is not a public VPN service and does not promise complete anonymity."
        ]
      },
      {
        title: "Information we collect",
        body: [
          "We may collect basic account and application information such as name, email address, approval status, account role, and VPN profile access details."
        ]
      },
      {
        title: "How we use information",
        body: [
          "We use this information to review applications, approve accounts, provide VPN access, prevent abuse, troubleshoot issues, and support users."
        ]
      },
      {
        title: "VPN profile and access information",
        body: [
          "UNITEDVPN may store information needed to issue, manage, revoke, or support VPN profiles, including profile names, access status, and device assignment details."
        ]
      },
      {
        title: "Server and connection information",
        body: [
          "Some technical information may be processed to operate, secure, and troubleshoot the service. We do not claim that no technical logs or operational records are ever processed."
        ]
      },
      {
        title: "Cookies and basic analytics",
        body: [
          "The portal may use necessary cookies for authentication and session handling. If basic analytics are added, they should be used only to understand and improve the service."
        ]
      },
      {
        title: "How we protect information",
        body: [
          "Access is limited to approved users and administrators. We aim to keep account and VPN access information protected using the security controls available in the portal and hosting environment."
        ]
      },
      {
        title: "When we share information",
        body: [
          "We do not sell personal information. We may share information only when needed to operate the service, comply with legal requirements, prevent abuse, or protect the service and its users."
        ]
      },
      {
        title: "Data retention",
        body: [
          "We keep information for as long as needed to manage accounts, operate VPN access, resolve support issues, prevent abuse, or meet operational requirements."
        ]
      },
      {
        title: "User requests",
        body: [
          "You may contact UNITEDVPN support to ask about your account information, access status, or removal of access where appropriate."
        ]
      },
      {
        title: "Contact",
        body: [
          "For privacy questions, contact UNITEDVPN support through the Contact page."
        ]
      }
    ]
  },
  ko: {
    title: "개인정보처리방침",
    intro:
      "이 MVP 개인정보처리방침은 초대 기반 프라이빗 VPN 접속을 위해 UNITEDVPN이 기본 정보를 어떻게 다루는지 설명합니다.",
    back: "홈으로 돌아가기",
    sections: [
      {
        title: "개요",
        body: [
          "UNITEDVPN은 승인된 멤버를 위한 프라이빗 VPN 접속 포털입니다. 공개 VPN 서비스가 아니며, 완전한 익명성을 보장한다고 말하지 않습니다."
        ]
      },
      {
        title: "수집하는 정보",
        body: [
          "이름, 이메일 주소, 승인 상태, 계정 권한, VPN 프로필 접근 정보와 같은 기본 계정 및 신청 정보를 수집할 수 있습니다."
        ]
      },
      {
        title: "정보 이용 목적",
        body: [
          "신청 검토, 계정 승인, VPN 접속 제공, 악용 방지, 문제 해결, 사용자 지원을 위해 정보를 사용합니다."
        ]
      },
      {
        title: "VPN 프로필 및 접근 정보",
        body: [
          "VPN 프로필 발급, 관리, 회수, 지원에 필요한 정보를 저장할 수 있습니다. 여기에는 프로필 이름, 접근 상태, 기기 배정 정보가 포함될 수 있습니다."
        ]
      },
      {
        title: "서버 및 접속 관련 정보",
        body: [
          "서비스 운영, 보안 유지, 문제 해결을 위해 일부 기술 정보가 처리될 수 있습니다. 기술 로그나 운영 기록이 전혀 처리되지 않는다고 주장하지 않습니다."
        ]
      },
      {
        title: "쿠키 및 기본 분석 도구",
        body: [
          "포털은 로그인과 세션 처리를 위해 필요한 쿠키를 사용할 수 있습니다. 기본 분석 도구가 추가되는 경우, 서비스 이해와 개선을 위한 목적으로만 사용해야 합니다."
        ]
      },
      {
        title: "정보 보호",
        body: [
          "접근은 승인된 사용자와 관리자에게 제한됩니다. 포털과 호스팅 환경에서 제공하는 보안 수단을 사용해 계정 및 VPN 접근 정보를 보호하기 위해 노력합니다."
        ]
      },
      {
        title: "정보 공유",
        body: [
          "개인정보를 판매하지 않습니다. 서비스 운영, 법적 요구 대응, 악용 방지, 서비스와 사용자 보호에 필요한 경우에만 정보를 공유할 수 있습니다."
        ]
      },
      {
        title: "보관 기간",
        body: [
          "계정 관리, VPN 접속 운영, 지원 요청 처리, 악용 방지, 운영상 필요한 기간 동안 정보를 보관합니다."
        ]
      },
      {
        title: "사용자 요청",
        body: [
          "계정 정보, 접근 상태, 필요한 경우 접근 권한 삭제에 대해 UNITEDVPN 지원팀에 문의할 수 있습니다."
        ]
      },
      {
        title: "문의",
        body: ["개인정보 관련 문의는 문의하기 페이지를 통해 UNITEDVPN 지원팀으로 연락해 주세요."]
      }
    ]
  }
} satisfies Record<
  Language,
  { title: string; intro: string; back: string; sections: LegalSection[] }
>;

export default function PrivacyPage() {
  // Function Role: Renders the localized MVP privacy policy page for the selected site language.
  const { lang } = useLanguage();
  const copy = privacyCopy[lang];

  return (
    <main className="legal-page">
      <section className="legal-header">
        <p className="eyebrow">UnitedVPN</p>
        <h1>{copy.title}</h1>
        <p>{lastUpdated[lang]}</p>
        <Link className="button secondary legal-back-link" href="/">
          {copy.back}
        </Link>
      </section>
      <section className="legal-content" aria-label={copy.title}>
        <p className="legal-intro">{copy.intro}</p>
        {copy.sections.map((section) => (
          <article className="legal-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}
