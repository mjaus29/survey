import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SECRET_KEY;

function createAuthResponse(userId: number, status: number) {
  if (!SECRET_KEY) throw new Error("Missing secret key");

  const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "1d" });

  const response = NextResponse.json({ success: true }, { status });
  response.cookies.set("token", token, { path: "/", httpOnly: true });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { action, email, password } = await req.json();

    if (action === "sign-out") {
      const response = NextResponse.json({ success: true });
      response.cookies.set("token", "", { path: "/", maxAge: 0 });
      return response;
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (action === "sign-up") {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return NextResponse.json(
          {
            error: "Email already used",
          },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });

      return createAuthResponse(user.id, 201);
    }

    if (action === "sign-in") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          {
            error: "User not found",
          },
          { status: 401 }
        );
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json(
          {
            error: "Invalid credentials",
          },
          { status: 401 }
        );
      }

      return createAuthResponse(user.id, 200);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !SECRET_KEY) return NextResponse.json({ authenticated: false });

  try {
    const { userId } = jwt.verify(token, SECRET_KEY) as { userId: number };

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return NextResponse.json({ authenticated: !!user });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
