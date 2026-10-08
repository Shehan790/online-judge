import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const submissionSchema = z.object({
  slug: z.string().min(1, "Problem slug is required"),
  language: z.enum(["python", "javascript", "java", "cpp"]),
  code: z.string().min(1, "Code is required").max(50000, "Code exceeds 50 KB limit"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Rate limiting: 1 submission per 5 seconds
    const recentSubmission = await prisma.submission.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 5000),
        },
      },
    });

    if (recentSubmission) {
      return NextResponse.json({ error: "Please wait 5 seconds between submissions." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const { slug, language, code } = parsed.data;

    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        language,
        code,
        status: "PENDING",
      },
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
