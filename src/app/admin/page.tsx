import "server-only";
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/chat-logs");
}
