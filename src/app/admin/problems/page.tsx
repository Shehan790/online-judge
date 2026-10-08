import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      _count: {
        select: { testCases: true },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin - Manage Problems</h1>
        <Link href="/admin/problems/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
          Create Problem
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Test Cases
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {problem.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {problem.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      problem.difficulty === "EASY"
                        ? "bg-green-100 text-green-800"
                        : problem.difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {problem._count.testCases}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/problems/${problem.slug}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 mr-4">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {problems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
