import { redirect } from "next/navigation";

// Workshops were merged into Services — keep the old URL working.
export default function WorkshopsRedirectPage() {
  redirect("/services");
}
