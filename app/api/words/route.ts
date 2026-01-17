import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 获取所有单词（支持搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wordType = searchParams.get("wordType");
    const subType = searchParams.get("subType");
    const search = searchParams.get("search");

    const where: any = {};
    if (wordType) {
      where.wordType = wordType;
    }
    if (subType) {
      where.subType = subType;
    }
    if (search) {
      // PostgreSQL 搜索（大小写不敏感）
      where.OR = [
        { word: { contains: search, mode: "insensitive" } },
        { reading: { contains: search, mode: "insensitive" } },
        { meaning: { contains: search, mode: "insensitive" } },
      ];
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(words, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

// POST - 创建新单词
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, reading, meaning, wordType, subType } = body;

    if (!word || !reading || !meaning || !wordType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 验证词性（不支持名词）
    const validWordTypes = ["adjective", "verb"];
    if (!validWordTypes.includes(wordType)) {
      return NextResponse.json(
        { error: "Invalid wordType. Only adjective and verb are supported." },
        { status: 400 }
      );
    }

    // 如果是形容词或动词，必须提供 subType
    if ((wordType === "adjective" || wordType === "verb") && !subType) {
      return NextResponse.json(
        { error: "subType is required for adjectives and verbs" },
        { status: 400 }
      );
    }

    const newWord = await prisma.word.create({
      data: {
        word,
        reading,
        meaning,
        wordType,
        subType: subType || null,
      },
    });

    return NextResponse.json(newWord, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error creating word:", error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}
