import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-2">Welcome back, {session.user?.name || "User"}!</p>
        <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-widest">
          Role: {session.user?.role}
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
