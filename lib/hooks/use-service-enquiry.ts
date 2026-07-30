"use client";

import { useEffect, useState } from "react";
import { getServiceBySlug } from "@/lib/db/services";

const DEFAULT_WHATSAPP_LINK = "https://wa.me/916363606088";

/**
 * Fetches the service doc by slug and exposes the admin-controlled enquiry
 * mode. When `enquiryMode` is true, public pages should show a WhatsApp
 * enquiry CTA instead of price/payment CTAs.
 */
export function useServiceEnquiry(slug: string): {
  enquiryMode: boolean;
  whatsappLink: string;
} {
  const [enquiryMode, setEnquiryMode] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_WHATSAPP_LINK);

  useEffect(() => {
    let cancelled = false;
    getServiceBySlug(slug)
      .then((svc) => {
        if (cancelled || !svc) return;
        setEnquiryMode(svc.enquiryMode === true);
        if (svc.whatsappLink) setWhatsappLink(svc.whatsappLink);
      })
      .catch((e) => console.error(`Failed to load service "${slug}":`, e));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { enquiryMode, whatsappLink };
}
