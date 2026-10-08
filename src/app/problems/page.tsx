import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; difficulty?: string; tag?: string; page?: string }>;
}) {
  const { search: rawSearch, difficulty: rawDifficulty, tag: rawTag, page: rawPage } = await searchParams;
  const search = rawSearch || "";
  const difficulty = rawDifficulty || "";
  const tag = rawTag || "";
  const page = parseInt(rawPage || "1", 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (difficulty) {
    whereClause.difficulty = difficulty;
  }
  if (tag) {
    whereClause.tags = { has: tag };
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.problem.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Problems</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/problems/${problem.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    {problem.title}
                  </Link>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1 flex-wrap">
                    {problem.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/problems/${problem.slug}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900">
                    Solve
                  </Link>
                </td>
              </tr>
            ))}
            {problems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No problems found.
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
              href={`/problems?page=${i + 1}${search ? `&search=${search}` : ""}${difficulty ? `&difficulty=${difficulty}` : ""}${tag ? `&tag=${tag}` : ""}`}
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
