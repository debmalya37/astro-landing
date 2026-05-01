import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path") || "";
  const isLoginPage = pathname.includes("/admin/login");

  return (
    <AdminLayoutClient isLoginPage={isLoginPage}>
      {children}
    </AdminLayoutClient>
  );
}