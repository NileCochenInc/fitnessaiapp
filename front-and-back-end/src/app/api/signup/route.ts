import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, email, password, goal } = await req.json();

    if (!username || !email || !password || !goal) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (username, email, goal, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [username, email, goal, hash]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
