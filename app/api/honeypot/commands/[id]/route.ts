import { type NextRequest, NextResponse } from "next/server"
import { updateHoneypotCommand, deleteHoneypotCommand } from "../../../../../lib/database"

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params   // ✅ must await
    const commandId = Number.parseInt(id)

    const { sec_label, cat_label, Requirereview } = await request.json()

    const success = await updateHoneypotCommand(commandId, sec_label, cat_label, Requirereview)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Update honeypot command error:", error)
    return NextResponse.json({ error: "Failed to update command" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commandId = Number.parseInt(params.id)
    const success = await deleteHoneypotCommand(commandId)

    if (success) {
      return NextResponse.json({ message: "Command deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete command" }, { status: 404 })
    }
  } catch (error) {
    console.error("Delete command error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
