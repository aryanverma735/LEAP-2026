import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const newIdea = await request.json()

    const dataPath = path.join(process.cwd(), "public/data/ideas.json")
    const fileContents = await fs.readFile(dataPath, "utf-8")
    const ideas = JSON.parse(fileContents)

    // Add new idea to the array
    ideas.push(newIdea)

    // Write back to file
    await fs.writeFile(dataPath, JSON.stringify(ideas, null, 2))

    return NextResponse.json({ success: true, idea: newIdea }, { status: 201 })
  } catch (error) {
    console.error("Error submitting idea:", error)
    return NextResponse.json({ error: "Failed to submit idea" }, { status: 500 })
  }
}