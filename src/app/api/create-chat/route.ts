import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";

// * /api/create-chat
export const POST = async (req: Request, res: Response) => {
    try {
        const body = await req.json()
        const { file_key, file_name } = body
        await loadS3IntoPinecone(file_key)
        return NextResponse.json({message: 'success'})
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}