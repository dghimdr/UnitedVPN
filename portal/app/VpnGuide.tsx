"use client";

import type { Language } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

type LocationCard = {
  title: string;
  status: string;
  description: string;
  profile: string;
};

type DownloadGuide = {
  platform: string;
  instruction: string;
  href: string;
  linkLabel: string;
};

type GuideCopy = {
  quickStart: string;
  title: string;
  intro: string;
  locationTitle: string;
  locationCopy: string;
  profileLabel: string;
  wireGuardTitle: string;
  wireGuardBody: string[];
  downloadTitle: string;
  downloadCopy: string;
  downloadNote: string;
  setupTitle: string;
  qrTitle: string;
  qrBody: string[];
  troubleTitle: string;
  troubleIntro: string;
};

const officialWireGuardInstallUrl = "https://www.wireguard.com/install/";
const officialIosAppStoreUrl =
  "https://apps.apple.com/us/app/wireguard/id1441195209";
const officialGooglePlayUrl =
  "https://play.google.com/store/apps/details?id=com.wireguard.android";

const guideCopy = {
  en: {
    quickStart: "Guidebook",
    title: "UNITEDVPN manual",
    intro:
      "UNITEDVPN currently supports Singapore and United Kingdom VPN profiles. This guide explains how WireGuard works with your UNITEDVPN profile.",
    locationTitle: "Choose your VPN location",
    locationCopy:
      "Choose the VPN location you want to connect through. Each location has its own WireGuard profile.",
    profileLabel: "WireGuard profile",
    wireGuardTitle: "What is WireGuard?",
    wireGuardBody: [
      "WireGuard is the VPN app that runs your UNITEDVPN profile on your phone, tablet, or computer.",
      "UNITEDVPN gives you a private VPN profile. WireGuard is the app you use to activate that profile and connect to the VPN.",
      "Once your account is approved, you can download your UNITEDVPN profile or scan the QR code from your dashboard, then open it inside WireGuard."
    ],
    downloadTitle: "How to download WireGuard",
    downloadCopy:
      "Before using UNITEDVPN, install the official WireGuard app on your device.",
    downloadNote:
      "Only download WireGuard from official app stores or the official WireGuard website.",
    setupTitle: "Simple setup flow",
    qrTitle: "QR code or config file?",
    qrBody: [
      "On mobile, scanning the QR code is usually the easiest option.",
      "On desktop, downloading the config file may be easier.",
      "Both methods create the same UNITEDVPN profile inside WireGuard."
    ],
    troubleTitle: "If the VPN does not work",
    troubleIntro:
      "If the internet stops working after turning on WireGuard, try these steps:"
  },
  ko: {
    quickStart: "사용 안내",
    title: "UNITEDVPN 매뉴얼",
    intro:
      "UNITEDVPN은 현재 싱가포르와 영국 VPN 프로필을 지원합니다. 이 안내서는 WireGuard와 UNITEDVPN 프로필을 어떻게 사용하는지 쉽게 설명합니다.",
    locationTitle: "VPN 위치 선택",
    locationCopy:
      "접속하려는 VPN 위치를 선택해 주세요. 각 위치는 별도의 WireGuard 프로필을 사용합니다.",
    profileLabel: "WireGuard 프로필",
    wireGuardTitle: "WireGuard가 무엇인가요?",
    wireGuardBody: [
      "WireGuard는 휴대폰, 태블릿, 컴퓨터에서 UNITEDVPN 프로필을 실행하는 VPN 앱입니다.",
      "UNITEDVPN은 승인된 사용자에게 개인 VPN 프로필을 발급합니다. WireGuard는 그 프로필을 불러와 VPN에 연결할 때 사용하는 앱입니다.",
      "계정이 승인되면 대시보드에서 UNITEDVPN 프로필을 다운로드하거나 QR 코드를 스캔한 뒤, WireGuard 앱에서 활성화할 수 있습니다."
    ],
    downloadTitle: "WireGuard 다운로드 방법",
    downloadCopy:
      "UNITEDVPN을 사용하기 전에 사용 중인 기기에 공식 WireGuard 앱을 설치해 주세요.",
    downloadNote:
      "WireGuard는 반드시 공식 앱스토어 또는 공식 WireGuard 웹사이트에서만 다운로드해 주세요.",
    setupTitle: "간단한 설정 순서",
    qrTitle: "QR 코드와 설정 파일의 차이",
    qrBody: [
      "모바일에서는 QR 코드를 스캔하는 방식이 가장 간단합니다.",
      "컴퓨터에서는 설정 파일을 다운로드하는 방식이 더 편할 수 있습니다.",
      "두 방법 모두 WireGuard 안에 동일한 UNITEDVPN 프로필을 추가하는 방식입니다."
    ],
    troubleTitle: "VPN이 작동하지 않을 때",
    troubleIntro:
      "WireGuard를 켠 뒤 인터넷이 작동하지 않는다면 아래 내용을 확인해 주세요."
  }
} satisfies Record<Language, GuideCopy>;

const locationCards = {
  en: [
    {
      title: "Singapore",
      status: "Available",
      description: "Use UNITEDVPN Singapore to connect through Singapore.",
      profile: "UNITEDVPN Singapore"
    },
    {
      title: "United Kingdom",
      status: "Available",
      description: "Use UNITEDVPN UK to connect through the United Kingdom.",
      profile: "UNITEDVPN UK"
    }
  ],
  ko: [
    {
      title: "싱가포르",
      status: "사용 가능",
      description:
        "싱가포르 VPN을 사용하려면 UNITEDVPN Singapore 프로필을 활성화해 주세요.",
      profile: "UNITEDVPN Singapore"
    },
    {
      title: "영국",
      status: "사용 가능",
      description:
        "영국 VPN을 사용하려면 UNITEDVPN UK 프로필을 활성화해 주세요.",
      profile: "UNITEDVPN UK"
    }
  ]
} satisfies Record<Language, LocationCard[]>;

const downloadGuides = {
  en: [
    {
      platform: "iPhone / iPad",
      instruction: "Download WireGuard from the App Store",
      href: officialIosAppStoreUrl,
      linkLabel: "App Store"
    },
    {
      platform: "Android",
      instruction: "Download WireGuard from Google Play",
      href: officialGooglePlayUrl,
      linkLabel: "Google Play"
    },
    {
      platform: "Mac",
      instruction:
        "Download WireGuard from the Mac App Store or official WireGuard website",
      href: officialWireGuardInstallUrl,
      linkLabel: "WireGuard downloads"
    },
    {
      platform: "Windows",
      instruction: "Download WireGuard from the official WireGuard website",
      href: officialWireGuardInstallUrl,
      linkLabel: "WireGuard downloads"
    }
  ],
  ko: [
    {
      platform: "iPhone / iPad",
      instruction: "App Store에서 WireGuard를 다운로드하세요",
      href: officialIosAppStoreUrl,
      linkLabel: "App Store"
    },
    {
      platform: "Android",
      instruction: "Google Play에서 WireGuard를 다운로드하세요",
      href: officialGooglePlayUrl,
      linkLabel: "Google Play"
    },
    {
      platform: "Mac",
      instruction:
        "Mac App Store 또는 공식 WireGuard 웹사이트에서 다운로드하세요",
      href: officialWireGuardInstallUrl,
      linkLabel: "WireGuard 다운로드"
    },
    {
      platform: "Windows",
      instruction: "공식 WireGuard 웹사이트에서 다운로드하세요",
      href: officialWireGuardInstallUrl,
      linkLabel: "WireGuard 다운로드"
    }
  ]
} satisfies Record<Language, DownloadGuide[]>;

const setupSteps = {
  en: [
    "Apply for UNITEDVPN access",
    "Wait for account approval",
    "Install WireGuard on your device",
    "Open your UNITEDVPN dashboard",
    "Choose Singapore or United Kingdom",
    "Scan the QR code or download the profile",
    "Open the profile in WireGuard",
    "Turn the VPN on"
  ],
  ko: [
    "UNITEDVPN 이용 신청",
    "계정 승인 대기",
    "기기에 WireGuard 설치",
    "UNITEDVPN 대시보드 접속",
    "싱가포르 또는 영국 선택",
    "QR 코드 스캔 또는 프로필 다운로드",
    "WireGuard 앱에서 프로필 열기",
    "VPN 활성화"
  ]
} satisfies Record<Language, string[]>;

const troubleshootingSteps = {
  en: [
    "Make sure you selected an active UNITEDVPN profile",
    "Check that your account has been approved",
    "Try switching WireGuard off and on again",
    "Check whether you are using the Singapore or UK profile you intended to use",
    "Contact support if the issue continues"
  ],
  ko: [
    "사용 가능한 UNITEDVPN 프로필을 선택했는지 확인",
    "계정이 승인되었는지 확인",
    "WireGuard를 껐다가 다시 켜보기",
    "싱가포르 또는 영국 중 원하는 프로필을 사용 중인지 확인",
    "문제가 계속되면 지원팀에 문의"
  ]
} satisfies Record<Language, string[]>;

export function VpnGuide() {
  // Function Role: Renders the localized UNITEDVPN guidebook without changing VPN runtime behavior.
  const { lang } = useLanguage();
  const copy = guideCopy[lang];

  return (
    <section className="guide stack" aria-labelledby="vpn-guide-title">
      <div className="guide-hero">
        <div className="guide-hero-copy">
          <p className="guide-kicker">{copy.quickStart}</p>
          <h2 id="vpn-guide-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className="guide-hero-card" aria-label={copy.locationTitle}>
          {locationCards[lang].map((location) => (
            <div key={location.profile}>
              <span className="guide-chip">{location.title}</span>
              <strong>{location.profile}</strong>
            </div>
          ))}
        </div>
      </div>

      <section className="guide-panel" aria-labelledby="location-guide-title">
        <div className="guide-section-heading">
          <h3 id="location-guide-title">{copy.locationTitle}</h3>
          <p>{copy.locationCopy}</p>
        </div>
        <div className="vpn-location-grid">
          {locationCards[lang].map((location) => (
            <article className="vpn-location-card" key={location.profile}>
              <div className="row">
                <div>
                  <h4>{location.title}</h4>
                  <p>{location.description}</p>
                </div>
                <span className="status approved">{location.status}</span>
              </div>
              <div className="profile-pill">
                {copy.profileLabel}: {location.profile}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-panel" aria-labelledby="wireguard-title">
        <div className="guide-section-heading">
          <h3 id="wireguard-title">{copy.wireGuardTitle}</h3>
        </div>
        <div className="guide-copy-card">
          {copy.wireGuardBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="guide-panel" aria-labelledby="download-title">
        <div className="guide-section-heading">
          <h3 id="download-title">{copy.downloadTitle}</h3>
          <p>{copy.downloadCopy}</p>
        </div>
        <div className="download-guide-grid">
          {downloadGuides[lang].map((guide) => (
            <article className="download-guide-card" key={guide.platform}>
              <span className="guide-chip">{guide.platform}</span>
              <strong>{guide.instruction}</strong>
              <a href={guide.href} rel="noreferrer" target="_blank">
                {guide.linkLabel}
              </a>
            </article>
          ))}
        </div>
        <p className="guide-note">{copy.downloadNote}</p>
      </section>

      <section className="guide-panel" aria-labelledby="setup-flow-title">
        <div className="guide-section-heading">
          <h3 id="setup-flow-title">{copy.setupTitle}</h3>
        </div>
        <ol className="guide-step-list eight">
          {setupSteps[lang].map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="guide-panel" aria-labelledby="qr-config-title">
        <div className="guide-section-heading">
          <h3 id="qr-config-title">{copy.qrTitle}</h3>
        </div>
        <div className="guide-copy-card">
          {copy.qrBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="guide-panel" aria-labelledby="troubleshooting-title">
        <div className="guide-section-heading">
          <h3 id="troubleshooting-title">{copy.troubleTitle}</h3>
          <p>{copy.troubleIntro}</p>
        </div>
        <ul className="guide-list">
          {troubleshootingSteps[lang].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
