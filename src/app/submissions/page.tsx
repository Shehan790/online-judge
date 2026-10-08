import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    ACCEPTED: "bg-green-100 text-green-800",
    WRONG_ANSWER: "bg-red-100 text-red-800",
    TIME_LIMIT_EXCEEDED: "bg-yellow-100 text-yellow-800",
    RUNTIME_ERROR: "bg-red-100 text-red-800",
    COMPILATION_ERROR: "bg-orange-100 text-orange-800",
  };
  const color = colorMap[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const { page: rawPage } = await searchParams;
  const page = parseInt(rawPage || "1", 10);
  const limit = 15;
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: (session.user as any).id },
      include: {
        problem: { select: { title: true, slug: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count({
      where: { userId: (session.user as any).id },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Submissions</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Language
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <Link href={`/submissions/${sub.id}`} className="hover:underline">
                    {new Date(sub.createdAt).toLocaleString()}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/problems/${sub.problem.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm">
                    {sub.problem.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {sub.language}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={sub.status} />
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/submissions?page=${i + 1}`}
              className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300'}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
