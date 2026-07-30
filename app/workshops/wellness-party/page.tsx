import { redirect } from "next/navigation";

// Workshops were merged into Services — keep old links working.
export default function WellnessPartyRedirectPage() {
  redirect("/services/wellness-party");
}
