import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// * /api/create-chat
export const POST = async (req: Request, res: Response) => {
    const { userId } =  await auth()
    if (!userId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    try {
        const body = await req.json()
        const { file_key, file_name } = body
        await loadS3IntoPinecone(file_key)
        const chat_id = await db
        .insert(chats)
        .values({
            userId,
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: getS3Url(file_key)
        })
        .returning({
            insertedId: chats.id
        })

        return NextResponse.json(
            { chat_id: chat_id[0].insertedId },
            { status: 200 }
        )
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}