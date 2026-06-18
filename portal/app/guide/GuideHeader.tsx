"use client";

import Link from "next/link";
import { useLanguage } from "../language-provider";

const copy = {
  en: {
    title: "UNITEDVPN setup guide",
    action: "Open Dashboard"
  },
  ko: {
    title: "UNITEDVPN 설정 안내",
    action: "대시보드 열기"
  }
};

export function GuideHeader() {
  const { lang } = useLanguage();

  return (
    <div className="row">
      <h1>{copy[lang].title}</h1>
      <Link className="button" href="/dashboard">
        {copy[lang].action}
      </Link>
    </div>
  );
}
