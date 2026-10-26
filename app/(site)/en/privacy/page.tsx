import type { Metadata } from "next";
import { EnglishLegal } from "@/components/EnglishLegal";

export const metadata: Metadata = { title: "Privacy Policy | Obaydah Hijazi", alternates: { canonical: "/en/privacy", languages: { ar: "/privacy", en: "/en/privacy" } } };
export default function Page() { return <EnglishLegal kind="privacy" />; }
