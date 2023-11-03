import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { db } from '@/lib/db'
import { chats, messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getContext } from '@/lib/context'

export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export const POST = async (req: Request) => {
    try {
        const { messages: _messages, chatId } = await req.json()
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId))
        // console.log(_messages)
        if (_chats.length != 1) {
            return NextResponse.json({'error': 'chat not found'}, {status: 404})
        }
        
        const lastMessage = _messages[_messages.length - 1]
        const context = await getContext(lastMessage.content)

        const prompt = {
            role: 'system',
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfullness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is a always friendly, kind, and inspiring, and he is eagar to provide vivid and thoughtful response to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `
        }

        const res = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                prompt,
                ..._messages.filter((message: Message) => message.role === 'user'),
            ],
            stream: true
        })

        const stream = OpenAIStream(res, {
            onStart: async () => {
                await db.insert(messages).values({
                    chatId,
                    content: lastMessage.content,
                    role: 'user'
                })
            },
            onCompletion: async (completion) => {
                await db.insert(messages).values({
                    chatId,
                    content: completion,
                    role: "system"
                })
            }
        })
        return new StreamingTextResponse(stream)
    } catch (err) {
        console.log("api/chat", err)
        throw err
    }
}