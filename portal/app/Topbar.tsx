"use client";

import Link from "next/link";
import { signOut } from "@/lib/actions";
import { t } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

export function Topbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <header className="topbar">
      <Link className="brand" href={isAuthenticated ? "/dashboard" : "/"}>
        {t("portal_brand", lang)}
      </Link>
      <div className="topbar-actions">
        <nav className="row">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">{t("nav_dashboard", lang)}</Link>
              <Link href="/admin">{t("nav_admin", lang)}</Link>
              <form action={signOut}>
                <button className="secondary" type="submit">
                  {t("nav_sign_out", lang)}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">{t("nav_login", lang)}</Link>
              <Link className="button" href="/signup">
                {t("nav_signup", lang)}
              </Link>
            </>
          )}
        </nav>
        <div
          aria-label={t("language_toggle_label", lang)}
          className="language-toggle"
        >
          <button
            aria-pressed={lang === "en"}
            className={lang === "en" ? "active" : undefined}
            onClick={() => setLang("en")}
            type="button"
          >
            {t("language_en", lang)}
          </button>
          <span aria-hidden="true">|</span>
          <button
            aria-pressed={lang === "ko"}
            className={lang === "ko" ? "active" : undefined}
            onClick={() => setLang("ko")}
            type="button"
          >
            {t("language_kr", lang)}
          </button>
        </div>
      </div>
    </header>
  );
}
