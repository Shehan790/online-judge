import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen p-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="p-6 border rounded shadow-sm bg-red-50 text-red-900 border-red-200">
          <h2 className="text-xl font-semibold mb-2">Restricted Area</h2>
          <p>This area is only visible to users with the ADMIN role.</p>
        </div>
      </div>
    </div>
  );
}
