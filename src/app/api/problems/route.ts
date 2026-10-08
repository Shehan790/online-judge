import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
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

    return NextResponse.json({
      problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
