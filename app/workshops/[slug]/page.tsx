import { redirect } from "next/navigation";

// Workshops were merged into Services — keep old links working.
export default function WorkshopDetailRedirectPage({ params }: { params: { slug: string } }) {
  redirect(`/services/${params.slug}`);
}
