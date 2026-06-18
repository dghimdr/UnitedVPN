"use client";

import Link from "next/link";
import { t, type TranslationKey } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

const trustIndicators: TranslationKey[] = [
  "trust_invite_only",
  "trust_admin_approved",
  "trust_one_device",
  "trust_singapore_network"
];

const principles: { title: TranslationKey; text: TranslationKey }[] = [
  {
    title: "principle_belonging_title",
    text: "principle_belonging_text"
  },
  {
    title: "principle_approval_title",
    text: "principle_approval_text"
  },
  {
    title: "principle_loyalty_title",
    text: "principle_loyalty_text"
  }
];

const accessSteps: { title: TranslationKey; text: TranslationKey }[] = [
  {
    title: "step_request_title",
    text: "step_request_text"
  },
  {
    title: "step_review_title",
    text: "step_review_text"
  },
  {
    title: "step_connect_title",
    text: "step_connect_text"
  }
];

const benefits: { title: TranslationKey; text: TranslationKey }[] = [
  {
    title: "benefit_private_access_title",
    text: "benefit_private_access_text"
  },
  {
    title: "benefit_trusted_devices_title",
    text: "benefit_trusted_devices_text"
  },
  {
    title: "benefit_secure_onboarding_title",
    text: "benefit_secure_onboarding_text"
  },
  {
    title: "benefit_admin_controlled_title",
    text: "benefit_admin_controlled_text"
  },
  {
    title: "benefit_no_public_access_title",
    text: "benefit_no_public_access_text"
  },
  {
    title: "benefit_minimal_title",
    text: "benefit_minimal_text"
  }
];

export function LandingPageClient() {
  const { lang } = useLanguage();

  return (
    <main className="landing">
      <div className="ambient ambient-hero" aria-hidden="true" />
      <div className="ambient ambient-diagonal" aria-hidden="true" />

      <section className="club-hero">
        <div className="motion-line" aria-hidden="true" />
        <p className="hero-index" aria-hidden="true">
          {t("hero_index", lang)}
        </p>
        <div className="brand-mark" aria-label={t("brand_name", lang)}>
          <span>{t("brand_mark_letter", lang)}</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">{t("hero_eyebrow", lang)}</p>
          <h1>{t("hero_title", lang)}</h1>
          <p className="hero-kicker">{t("hero_kicker", lang)}</p>
          <p className="hero-subtitle">{t("hero_subtitle", lang)}</p>
          <div
            className="hero-actions"
            aria-label={t("hero_actions_label", lang)}
          >
            <Link className="button landing-primary" href="/signup">
              {t("cta_request_access", lang)}
            </Link>
            <Link className="button landing-secondary" href="/login">
              {t("cta_member_sign_in", lang)}
            </Link>
          </div>
          <div
            className="trust-strip"
            aria-label={t("trust_indicators_label", lang)}
          >
            {trustIndicators.map((indicator) => (
              <span key={indicator}>{t(indicator, lang)}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section editorial-section">
        <div className="section-heading">
          <p className="eyebrow">{t("why_eyebrow", lang)}</p>
          <h2>{t("why_title", lang)}</h2>
          <p>{t("why_text", lang)}</p>
        </div>
        <div className="pillar-list">
          {principles.map((principle) => (
            <article className="pillar-item" key={principle.title}>
              <h3>{t(principle.title, lang)}</h3>
              <p>{t(principle.text, lang)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section access-section">
        <div className="section-heading">
          <p className="eyebrow">{t("how_eyebrow", lang)}</p>
          <h2>{t("how_title", lang)}</h2>
        </div>
        <ol className="access-track">
          {accessSteps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{t(step.title, lang)}</strong>
              <p>{t(step.text, lang)}</p>
            </li>
          ))}
        </ol>
        <Link className="button landing-primary section-cta" href="/signup">
          {t("cta_request_access", lang)}
        </Link>
      </section>

      <section className="landing-section benefits-section">
        <div className="section-heading">
          <p className="eyebrow">{t("benefits_eyebrow", lang)}</p>
          <h2>{t("benefits_title", lang)}</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.title}>
              <h3>{t(benefit.title, lang)}</h3>
              <p>{t(benefit.text, lang)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section status-section">
        <div className="section-heading">
          <p className="eyebrow">{t("status_eyebrow", lang)}</p>
          <h2>{t("status_title", lang)}</h2>
        </div>
        <div className="status-board" aria-label={t("status_board_label", lang)}>
          <div className="status-board-header">
            <span>{t("status_node", lang)}</span>
            <strong>{t("status_online", lang)}</strong>
          </div>
          <dl className="status-metrics">
            <div>
              <dt>{t("status_label", lang)}</dt>
              <dd>{t("status_online", lang)}</dd>
            </div>
            <div>
              <dt>{t("status_capacity_label", lang)}</dt>
              <dd>{t("status_capacity_value", lang)}</dd>
            </div>
            <div>
              <dt>{t("status_uptime_label", lang)}</dt>
              <dd>{t("status_uptime_value", lang)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-copy">
          <strong>{t("brand_name", lang)}</strong>
          <span>{t("footer_invites", lang)}</span>
          <span>{t("footer_built_by", lang)}</span>
          <span>{t("footer_designed_by", lang)}</span>
        </div>
        <nav className="footer-links" aria-label={t("footer_label", lang)}>
          <Link href="/privacy">{t("footer_privacy", lang)}</Link>
          <Link href="/terms">{t("footer_terms", lang)}</Link>
          <Link href="/contact">{t("footer_contact", lang)}</Link>
        </nav>
      </footer>
    </main>
  );
}
