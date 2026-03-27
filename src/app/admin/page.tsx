import "server-only";
import { notFound, redirect } from "next/navigation";

export default function AdminIndexPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  redirect("/admin/dashboard");
}
