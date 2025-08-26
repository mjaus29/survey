import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const verifyUser = (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;
  if (!token || !process.env.SECRET_KEY) return null;

  try {
    return (jwt.verify(token, process.env.SECRET_KEY) as { userId: number })
      .userId;
  } catch {
    return null;
  }
};

export async function POST(req: NextRequest) {
  const userId = verifyUser(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = await req.json();

  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await Promise.all(
      answers.map((ans) =>
        prisma.answer.upsert({
          where: { userId_questionId: { userId, questionId: ans.questionId } },

          update: { response: ans.response },
          create: {
            userId,
            questionId: ans.questionId,
            response: ans.response,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save answers" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const userId = verifyUser(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const questions = await prisma.question.findMany({
      where: { surveyId: 1 },
    });

    const answers = await prisma.answer.findMany({
      where: { userId },
      include: { question: true },
    });

    return NextResponse.json({ questions, answers });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve data" },
      { status: 500 }
    );
  }
}
