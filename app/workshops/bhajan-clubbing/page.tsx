import { redirect } from "next/navigation";

// Workshops were merged into Services — keep old links working.
export default function BhajanClubbingRedirectPage() {
  redirect("/services/bhajan-clubbing");
}
