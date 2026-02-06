import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "public/data/ideas.json")
    const fileContents = await fs.readFile(dataPath, "utf-8")
    const ideas = JSON.parse(fileContents)

    return NextResponse.json(ideas)
  } catch (error) {
    console.error("Error reading ideas:", error)
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 })
  }
}