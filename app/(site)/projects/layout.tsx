import type { ReactNode } from "react";
import { InteriorShell } from "@/components/InteriorShell";
export default function Layout({ children }: { children: ReactNode }) { return <InteriorShell>{children}</InteriorShell>; }
