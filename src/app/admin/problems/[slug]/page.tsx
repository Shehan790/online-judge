import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProblemForm from "../ProblemForm";

export default async function EditProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "new") {
    // Should be handled by the static route, but just in case
    redirect("/admin/problems");
  }

  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: { testCases: true },
  });

  if (!problem) {
    notFound();
  }

  return <ProblemForm initialData={problem} isNew={false} />;
}
