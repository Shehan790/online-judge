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
      input: z.string(),
      expectedOutput: z.string(),
      isSample: z.boolean(),
      isHidden: z.boolean(),
    })
  ).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = problemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const { testCases, ...problemData } = parsed.data;

    const newProblem = await prisma.problem.create({
      data: {
        ...problemData,
        testCases: {
          create: testCases || [],
        },
      },
      include: { testCases: true },
    });

    return NextResponse.json(newProblem, { status: 201 });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const problems = await prisma.problem.findMany({
      include: {
        testCases: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
