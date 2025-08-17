"use client";
import MobileScheduleFooter from "./MobileScheduleFooter";
import { useIsMobile } from "../lib/useIsMobile";

export default function ClientMobileFooter() {
  const isMobile = useIsMobile(768);
  if (!isMobile) return null;
  return <MobileScheduleFooter />;
}
