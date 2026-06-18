"use client";

import Link from "next/link";
import type { Language } from "@/lib/i18n";
import { useLanguage } from "../language-provider";

type TermsSection = {
  title: string;
  body: string[];
};

const lastUpdated = {
  en: "Last updated: June 18, 2026",
  ko: "마지막 업데이트: 2026년 6월 18일"
} satisfies Record<Language, string>;

const termsCopy = {
  en: {
    title: "Terms of Service",
    intro:
      "These MVP Terms explain the basic rules for using UNITEDVPN private VPN access.",
    back: "Back to home",
    sections: [
      {
        title: "Overview",
        body: [
          "UNITEDVPN is a private, invite-only VPN access service for approved members. These terms are intended to be simple and practical, not a final legal document."
        ]
      },
      {
        title: "Invite-only access",
        body: [
          "Access is not open to the public. You may use UNITEDVPN only if you are invited, approved, and allowed to keep access."
        ]
      },
      {
        title: "Account approval",
        body: [
          "Applications may be approved, denied, paused, or revoked. Approval is handled manually and may depend on operational, security, or trust considerations."
        ]
      },
      {
        title: "Acceptable use",
        body: [
          "You may use UNITEDVPN for private, responsible internet access through the available Singapore or United Kingdom VPN profiles."
        ]
      },
      {
        title: "VPN profile use",
        body: [
          "Your VPN profile is issued for your approved account and device. Do not share, resell, publish, or transfer your VPN profile or QR code."
        ]
      },
      {
        title: "Prohibited activity",
        body: [
          "You must not use UNITEDVPN for illegal activity, abuse, attacks, spam, fraud, harassment, copyright infringement, scraping, resale, or attempts to damage systems, networks, or other people."
        ]
      },
      {
        title: "Service availability",
        body: [
          "UNITEDVPN may change, pause, limit, or stop access when needed for maintenance, security, abuse prevention, capacity, or operational reasons."
        ]
      },
      {
        title: "No guarantee of uninterrupted access",
        body: [
          "We do not promise uninterrupted VPN access, perfect security, complete anonymity, or that every website or service will work through the VPN."
        ]
      },
      {
        title: "User responsibility",
        body: [
          "You are responsible for keeping your account and VPN profile secure, using the correct Singapore or UK profile, and following applicable rules and laws."
        ]
      },
      {
        title: "Changes to the service",
        body: [
          "UNITEDVPN may update locations, access rules, setup instructions, or these terms as the service changes."
        ]
      },
      {
        title: "Contact",
        body: [
          "For questions about these terms or your account, contact UNITEDVPN support through the Contact page."
        ]
      }
    ]
  },
  ko: {
    title: "이용약관",
    intro:
      "이 MVP 이용약관은 UNITEDVPN 프라이빗 VPN 접속을 사용할 때의 기본 규칙을 설명합니다.",
    back: "홈으로 돌아가기",
    sections: [
      {
        title: "개요",
        body: [
          "UNITEDVPN은 승인된 멤버를 위한 초대 기반 프라이빗 VPN 접속 서비스입니다. 이 약관은 최종 법률 문서가 아니라, 기본 이용 기준을 쉽고 실용적으로 설명하기 위한 문서입니다."
        ]
      },
      {
        title: "초대 기반 이용",
        body: [
          "UNITEDVPN은 공개 가입 서비스가 아닙니다. 초대받고 승인된 경우에만 사용할 수 있으며, 접근 권한이 유지되는 동안에만 이용할 수 있습니다."
        ]
      },
      {
        title: "계정 승인",
        body: [
          "신청은 승인, 거절, 보류, 회수될 수 있습니다. 승인은 수동으로 처리되며 운영, 보안, 신뢰 기준을 고려할 수 있습니다."
        ]
      },
      {
        title: "허용되는 사용",
        body: [
          "사용자는 제공되는 싱가포르 또는 영국 VPN 프로필을 통해 책임 있는 개인 인터넷 접속 목적으로 UNITEDVPN을 사용할 수 있습니다."
        ]
      },
      {
        title: "VPN 프로필 사용",
        body: [
          "VPN 프로필은 승인된 계정과 기기를 위해 발급됩니다. VPN 프로필이나 QR 코드를 공유, 재판매, 공개, 양도해서는 안 됩니다."
        ]
      },
      {
        title: "금지 행위",
        body: [
          "불법 행위, 악용, 공격, 스팸, 사기, 괴롭힘, 저작권 침해, 무단 수집, 재판매, 시스템이나 네트워크 또는 타인에게 피해를 주려는 시도에 UNITEDVPN을 사용해서는 안 됩니다."
        ]
      },
      {
        title: "서비스 제공 및 변경",
        body: [
          "점검, 보안, 악용 방지, 용량, 운영상 필요에 따라 UNITEDVPN 접속이 변경, 일시 중단, 제한, 종료될 수 있습니다."
        ]
      },
      {
        title: "접속 보장에 대한 안내",
        body: [
          "중단 없는 VPN 접속, 완벽한 보안, 완전한 익명성, 모든 웹사이트나 서비스의 정상 작동을 보장하지 않습니다."
        ]
      },
      {
        title: "사용자 책임",
        body: [
          "사용자는 계정과 VPN 프로필을 안전하게 관리하고, 원하는 싱가포르 또는 영국 프로필을 올바르게 사용하며, 관련 규칙과 법을 지킬 책임이 있습니다."
        ]
      },
      {
        title: "문의",
        body: [
          "약관 또는 계정에 대한 질문은 문의하기 페이지를 통해 UNITEDVPN 지원팀으로 연락해 주세요."
        ]
      }
    ]
  }
} satisfies Record<
  Language,
  { title: string; intro: string; back: string; sections: TermsSection[] }
>;

export default function TermsPage() {
  // Function Role: Renders the localized MVP terms page for private UNITEDVPN access.
  const { lang } = useLanguage();
  const copy = termsCopy[lang];

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
