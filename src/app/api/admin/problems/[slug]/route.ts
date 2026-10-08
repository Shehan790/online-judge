import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").refine(val => val !== "new", { message: "Slug cannot be 'new'" }),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()),
  timeLimitMs: z.number().min(100),
  memoryLimitMb: z.number().min(16),
  testCases: z.array(
    z.object({
      id: z.string().optional(),
      input: z.string(),
      expectedOutput: z.string(),
      isSample: z.boolean(),
      isHidden: z.boolean(),
    })
  ).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = problemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const existingProblem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const { testCases, ...problemData } = parsed.data;

    const updatedProblem = await prisma.$transaction(async (tx) => {
      // Delete existing test cases
      await tx.testCase.deleteMany({
        where: { problemId: existingProblem.id },
      });

      // Update problem and recreate test cases
      return tx.problem.update({
        where: { id: existingProblem.id },
        data: {
          ...problemData,
          testCases: {
            create: testCases?.map((tc) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: tc.isSample,
              isHidden: tc.isHidden,
            })) || [],
          },
        },
        include: { testCases: true },
      });
    });

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    await prisma.problem.delete({
      where: { id: problem.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json({ error: "Failed to delete problem" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: { testCases: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}
