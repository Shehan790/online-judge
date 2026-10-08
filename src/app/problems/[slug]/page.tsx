import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import EditorLoader from "./EditorLoader";

export default async function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      testCases: {
        where: { isSample: true },
        select: {
          id: true,
          input: true,
          expectedOutput: true,
          isSample: true,
        },
      },
    },
  });

  if (!problem) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
      <div className="lg:w-1/2 overflow-y-auto pr-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{problem.title}</h1>
        
        <div className="flex gap-4 mb-6">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            problem.difficulty === "EASY"
              ? "bg-green-100 text-green-800"
              : problem.difficulty === "MEDIUM"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-sm text-gray-500">Time Limit: {problem.timeLimitMs} ms</span>
          <span className="text-sm text-gray-500">Memory Limit: {problem.memoryLimitMb} MB</span>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Sample Test Cases</h2>
        <div className="space-y-4 mb-8">
          {problem.testCases.map((tc, idx) => (
            <div key={tc.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Example {idx + 1}:</p>
              <div className="mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Input:</span>
                <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{tc.input}</pre>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Output:</span>
                <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{tc.expectedOutput}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:w-1/2 flex flex-col h-full">
        <EditorLoader slug={slug} />
      </div>
    </div>
  );
}
