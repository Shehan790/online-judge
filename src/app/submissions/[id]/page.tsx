import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      problem: { select: { title: true, slug: true } },
    },
  });

  if (!submission) {
    notFound();
  }

  if (submission.userId !== userId && role !== "ADMIN") {
    notFound(); // Hide existence from non-owners
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submission Details</h1>
        <Link href="/submissions" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to Submissions
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Problem</p>
            <Link href={`/problems/${submission.problem.slug}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {submission.problem.title}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{submission.status.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Language</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{submission.language}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{submission.runtimeMs !== null ? `${submission.runtimeMs} ms` : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Memory</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{submission.memoryKb !== null ? `${submission.memoryKb} KB` : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{new Date(submission.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        {submission.verdictMessage && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">Verdict Message</h3>
            <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
              {submission.verdictMessage}
            </pre>
          </div>
        )}

        <div className="p-0">
          <div className="bg-gray-100 dark:bg-gray-900 px-6 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Submitted Code</h3>
          </div>
          <pre className="p-6 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
            {submission.code}
          </pre>
        </div>
      </div>
    </div>
  );
}
