"use client";

import { useEffect, useState } from "react";
import { signOut } from "@/lib/actions";
import type { Language } from "@/lib/i18n";
import type { PublicVpnRegion, VpnRegionId } from "@/lib/vpn-regions";
import { useLanguage } from "../language-provider";

type VpnNode = {
  regionId: VpnRegionId;
  status: "available" | "coming-soon";
  wireGuardProfileName: string;
  qrEndpoint: string;
  configDownloadEndpoint: string;
  copy: Record<
    Language,
    {
      displayName: string;
      description: string;
      helper: string;
    }
  >;
};

type DashboardVpnOnboardingProps = {
  userEmail: string;
  canDownloadVpnConfig: boolean;
  regions: PublicVpnRegion[];
};

const dashboardCopy = {
  en: {
    productLabel: "Secure WireGuard VPN",
    approved: "Approved",
    logout: "Logout",
    heroTitle: "Choose your VPN location",
    heroSubtitle:
      "Download the config for the location you want to use. Activate the matching WireGuard profile in the WireGuard app.",
    noticeTitle: "Important",
    notice:
      "Each location uses a separate WireGuard profile. Please activate only one UNITEDVPN profile at a time.",
    available: "Available",
    comingSoon: "Coming soon",
    profileNotReady: "UK VPN profile is not ready yet. Please contact admin.",
    profileLabel: "WireGuard profile",
    showQr: "Show QR Code",
    downloadConfig: "Download Config",
    quickTitle: "Quick setup guide",
    matchTitle: "Which profile should I activate?",
    locationColumn: "VPN location",
    profileColumn: "WireGuard profile",
    warning:
      "Do not activate both profiles at the same time. Choose the one that matches the VPN location you want to use.",
    setupTitle: "Setup method",
    helpTitle: "Need help?",
    supportTitle: "Still having trouble?",
    supportCopy: "Contact UNITEDVPN support.",
    contact: "Contact"
  },
  ko: {
    productLabel: "보안 WireGuard VPN",
    approved: "승인됨",
    logout: "로그아웃",
    heroTitle: "VPN 위치 선택",
    heroSubtitle:
      "사용하려는 위치의 설정 파일을 다운로드해 주세요. WireGuard 앱에서 해당 위치의 프로필을 활성화해 주세요.",
    noticeTitle: "중요",
    notice:
      "각 위치는 별도의 WireGuard 프로필을 사용합니다. UNITEDVPN 프로필은 한 번에 하나만 활성화해 주세요.",
    available: "사용 가능",
    comingSoon: "곧 제공 예정",
    profileNotReady:
      "영국 VPN 프로필이 아직 준비되지 않았습니다. 관리자에게 문의해 주세요.",
    profileLabel: "WireGuard 프로필",
    showQr: "QR 코드 보기",
    downloadConfig: "설정 파일 다운로드",
    quickTitle: "빠른 설정 가이드",
    matchTitle: "어떤 프로필을 활성화해야 하나요?",
    locationColumn: "VPN 위치",
    profileColumn: "WireGuard 프로필",
    warning:
      "두 프로필을 동시에 활성화하지 마세요. 사용하려는 VPN 위치에 맞는 프로필 하나만 선택해 주세요.",
    setupTitle: "설정 방법",
    helpTitle: "도움이 필요하신가요?",
    supportTitle: "아직 문제가 있나요?",
    supportCopy: "UNITEDVPN 지원팀에 문의해 주세요.",
    contact: "문의"
  }
} satisfies Record<Language, Record<string, string>>;

function getDashboardAssetPath({
  regionId,
  asset
}: {
  regionId: VpnRegionId;
  asset: "config" | "qr";
}) {
  return regionId === "sg" ? `/api/vpn/${asset}` : `/api/vpn/${regionId}/${asset}`;
}

function createVpnNodes(regions: PublicVpnRegion[]): VpnNode[] {
  return regions.map((region) => ({
    regionId: region.id,
    status: region.enabled ? "available" : "coming-soon",
    wireGuardProfileName: region.profileName,
    qrEndpoint: getDashboardAssetPath({ regionId: region.id, asset: "qr" }),
    configDownloadEndpoint: getDashboardAssetPath({
      regionId: region.id,
      asset: "config"
    }),
    copy:
      region.id === "sg"
        ? {
            en: {
              displayName: region.displayName,
              description: "Connect through the Singapore VPN server.",
              helper: "Use UNITEDVPN Singapore to connect through Singapore."
            },
            ko: {
              displayName: region.displayNameKo,
              description: "싱가포르 VPN 서버를 통해 연결합니다.",
              helper:
                "싱가포르 VPN을 사용하려면 UNITEDVPN Singapore 프로필을 활성화해 주세요."
            }
          }
        : {
            en: {
              displayName: region.displayName,
              description: "Connect through the United Kingdom VPN server.",
              helper:
                "Use UNITEDVPN UK to connect through the United Kingdom."
            },
            ko: {
              displayName: region.displayNameKo,
              description: "영국 VPN 서버를 통해 연결합니다.",
              helper:
                "영국 VPN을 사용하려면 UNITEDVPN UK 프로필을 활성화해 주세요."
            }
          }
  }));
}

const quickSteps = {
  en: [
    ["APP", "Install WireGuard", "Download the WireGuard app on your phone or computer."],
    ["PIN", "Choose a location", "Choose Singapore or United Kingdom in your UNITEDVPN dashboard."],
    ["ADD", "Add your profile", "Scan the QR code or download the config file, then add it to WireGuard."],
    ["ON", "Activate the profile", "Open WireGuard and turn on the matching UNITEDVPN profile."]
  ],
  ko: [
    ["APP", "WireGuard 설치", "휴대폰 또는 컴퓨터에 WireGuard 앱을 설치해 주세요."],
    ["PIN", "VPN 위치 선택", "UNITEDVPN 대시보드에서 싱가포르 또는 영국을 선택해 주세요."],
    ["ADD", "프로필 추가", "QR 코드를 스캔하거나 설정 파일을 다운로드한 뒤 WireGuard에 추가해 주세요."],
    ["ON", "프로필 활성화", "WireGuard 앱에서 해당 UNITEDVPN 프로필을 활성화해 주세요."]
  ]
} satisfies Record<Language, string[][]>;

const setupMethods = {
  en: [
    {
      title: "Set up with QR Code",
      steps: [
        "Click Show QR Code",
        "Open WireGuard",
        "Tap Add Tunnel",
        "Scan the QR code",
        "Save and activate the profile"
      ]
    },
    {
      title: "Set up with Config File",
      steps: [
        "Click Download Config",
        "Open the downloaded file",
        "Import it into WireGuard",
        "Save and activate the profile"
      ]
    }
  ],
  ko: [
    {
      title: "QR 코드로 설정하기",
      steps: [
        "QR 코드 보기를 클릭하세요",
        "WireGuard 앱을 여세요",
        "Add Tunnel 또는 + 버튼을 누르세요",
        "QR 코드를 스캔하세요",
        "프로필을 저장하고 활성화하세요"
      ]
    },
    {
      title: "설정 파일로 설정하기",
      steps: [
        "설정 파일 다운로드를 클릭하세요",
        "다운로드한 파일을 여세요",
        "WireGuard에 가져오세요",
        "프로필을 저장하고 활성화하세요"
      ]
    }
  ]
} satisfies Record<Language, { title: string; steps: string[] }[]>;

const faqs = {
  en: [
    [
      "My internet stops working after turning on the VPN",
      "Turn the profile off, wait a few seconds, then turn it on again. Also check that you activated the correct UNITEDVPN profile."
    ],
    [
      "I selected the wrong location",
      "Turn off the current profile, then activate the correct profile for Singapore or UK."
    ],
    [
      "QR code is not scanning",
      "Increase screen brightness or use the Download Config option instead."
    ],
    [
      "I was approved but cannot see my config",
      "Refresh the dashboard or log in again. If it still does not appear, contact UNITEDVPN support."
    ]
  ],
  ko: [
    [
      "VPN을 켰는데 인터넷이 작동하지 않아요",
      "프로필을 껐다가 몇 초 후 다시 켜보세요. 올바른 UNITEDVPN 프로필을 활성화했는지도 확인해 주세요."
    ],
    [
      "잘못된 위치를 선택했어요",
      "현재 프로필을 끄고 싱가포르 또는 영국에 맞는 올바른 프로필을 활성화해 주세요."
    ],
    [
      "QR 코드가 스캔되지 않아요",
      "화면 밝기를 높이거나 설정 파일 다운로드 방식을 사용해 주세요."
    ],
    [
      "승인됐는데 설정 파일이 보이지 않아요",
      "대시보드를 새로고침하거나 다시 로그인해 주세요. 그래도 보이지 않으면 UNITEDVPN 지원팀에 문의해 주세요."
    ]
  ]
} satisfies Record<Language, string[][]>;

export function DashboardVpnOnboarding({
  userEmail,
  canDownloadVpnConfig,
  regions
}: DashboardVpnOnboardingProps) {
  const { lang } = useLanguage();
  const copy = dashboardCopy[lang];
  const vpnNodes = createVpnNodes(regions);

  return (
    <section className="dashboard-vpn" aria-labelledby="dashboard-vpn-title">
      <header className="dashboard-header-card">
        <div>
          <strong className="dashboard-logo">UNITEDVPN</strong>
          <p>{copy.productLabel}</p>
        </div>
        <div className="dashboard-account">
          <span>{userEmail}</span>
          <span className="status approved">{copy.approved}</span>
          <form action={signOut}>
            <button className="secondary" type="submit">
              {copy.logout}
            </button>
          </form>
        </div>
      </header>

      <section className="dashboard-hero-card">
        <div>
          <h1 id="dashboard-vpn-title">{copy.heroTitle}</h1>
          <p>{copy.heroSubtitle}</p>
        </div>
        <div className="mini-notice">
          <strong>{copy.noticeTitle}</strong>
          <p>{copy.notice}</p>
        </div>
      </section>

      <div className="vpn-location-grid">
        {vpnNodes.map((node) => (
          <LocationCard
            key={node.regionId}
            canUseActions={canDownloadVpnConfig}
            copy={copy}
            lang={lang}
            node={node}
          />
        ))}
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>{copy.quickTitle}</h2>
        </div>
        <div className="quick-step-grid">
          {quickSteps[lang].map(([icon, title, text], index) => (
            <article className="quick-step-card" key={title}>
              <span className="guide-icon">{icon}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>{copy.matchTitle}</h2>
        </div>
        <div className="profile-match-card">
          <table>
            <thead>
              <tr>
                <th>{copy.locationColumn}</th>
                <th>{copy.profileColumn}</th>
              </tr>
            </thead>
            <tbody>
              {vpnNodes.map((node) => (
                <tr key={node.regionId}>
                  <td>{node.copy[lang].displayName}</td>
                  <td>{node.wireGuardProfileName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="warning-copy">{copy.warning}</p>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>{copy.setupTitle}</h2>
        </div>
        <div className="setup-method-grid">
          {setupMethods[lang].map((method) => (
            <article className="setup-method-card" key={method.title}>
              <h3>{method.title}</h3>
              <ol>
                {method.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>{copy.helpTitle}</h2>
        </div>
        <div className="faq-accordion">
          {faqs[lang].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="support-card">
        <div>
          <strong>{copy.supportTitle}</strong>
          <p>{copy.supportCopy}</p>
        </div>
        <a className="button secondary" href="/contact">
          {copy.contact}
        </a>
      </footer>
    </section>
  );
}

function LocationCard({
  node,
  canUseActions,
  lang,
  copy
}: {
  node: VpnNode;
  canUseActions: boolean;
  lang: Language;
  copy: (typeof dashboardCopy)[Language];
}) {
  const [error, setError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const isAvailable = node.status === "available";
  const actionsEnabled =
    isAvailable &&
    canUseActions &&
    Boolean(node.qrEndpoint) &&
    Boolean(node.configDownloadEndpoint);
  const nodeCopy = node.copy[lang];

  useEffect(() => {
    return () => {
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
    };
  }, [qrUrl]);

  async function readError(response: Response) {
    try {
      const payload = (await response.json()) as { error?: string };
      return payload.error || copy.profileNotReady;
    } catch {
      return copy.profileNotReady;
    }
  }

  async function showQrCode() {
    if (!actionsEnabled) {
      return;
    }

    setError(null);

    const response = await fetch(node.qrEndpoint, { cache: "no-store" });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    const blob = await response.blob();
    const nextQrUrl = URL.createObjectURL(blob);
    setQrUrl((currentQrUrl) => {
      if (currentQrUrl) {
        URL.revokeObjectURL(currentQrUrl);
      }

      return nextQrUrl;
    });
  }

  async function downloadConfig() {
    if (!actionsEnabled) {
      return;
    }

    setError(null);

    const response = await fetch(node.configDownloadEndpoint, {
      cache: "no-store"
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const disposition = response.headers.get("content-disposition") ?? "";
    const filenameMatch = disposition.match(/filename="([^"]+)"/);

    link.href = downloadUrl;
    link.download =
      filenameMatch?.[1] ?? `${node.wireGuardProfileName.replace(/\s+/g, "-")}.conf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <article className={`vpn-location-card ${isAvailable ? "" : "disabled"}`}>
      <div className="location-card-header">
        <span className="location-icon" aria-hidden="true">
          PIN
        </span>
        <div>
          <h2>{nodeCopy.displayName}</h2>
        </div>
        <span className={`status ${isAvailable ? "approved" : ""}`}>
          {isAvailable ? copy.available : copy.comingSoon}
        </span>
      </div>

      <p>{nodeCopy.description}</p>

      <div className="profile-name-box">
        <span>{copy.profileLabel}</span>
        <strong>{node.wireGuardProfileName}</strong>
      </div>

      <div className="row action-row">
        {actionsEnabled ? (
          <button className="button" onClick={showQrCode} type="button">
            {copy.showQr}
          </button>
        ) : (
          <button type="button" disabled>
            {copy.showQr}
          </button>
        )}
        {actionsEnabled ? (
          <button
            className="secondary"
            onClick={downloadConfig}
            type="button"
          >
            {copy.downloadConfig}
          </button>
        ) : (
          <button className="secondary" type="button" disabled>
            {copy.downloadConfig}
          </button>
        )}
      </div>

      {error ? <p className="notice error">{error}</p> : null}
      {qrUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${node.wireGuardProfileName} QR code`}
          className="qr"
          src={qrUrl}
        />
      ) : null}

      <p className="helper-copy">{nodeCopy.helper}</p>
    </article>
  );
}
