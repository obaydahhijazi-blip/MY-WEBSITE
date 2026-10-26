import type { Metadata } from "next";
import { EnglishLegal } from "@/components/EnglishLegal";

export const metadata: Metadata = { title: "Working Terms & Collaboration Policy | Obaydah Hijazi", alternates: { canonical: "/en/terms", languages: { ar: "/terms", en: "/en/terms" } } };
export default function Page() { return <EnglishLegal kind="terms" />; }
