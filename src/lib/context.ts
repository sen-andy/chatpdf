import { Pinecone } from "@pinecone-database/pinecone"
import { getEmbeddings } from "./embeddings"

export const getMatchesFromEmbeddings = async (embeddings: number[]) => {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!
    })
    const index = pinecone.Index('chatpdf')

    try {
        const queryResults = await index.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true
        })
        return  queryResults.matches || []
    } catch (err) {
        console.log(`error query embeddings`, err)
        throw err
    }
}
export const getContext = async (query: string) => {
    const queryEmbeddings = await getEmbeddings(query)
    const matches = await getMatchesFromEmbeddings(queryEmbeddings!)

    const qualifyingDocs = matches.filter(
        (match) => match.score && match.score > 0.7
    )

    type Metadata = {
        text: string,
        pageNumber: number
    }

    let docs = qualifyingDocs.map(match => (match.metadata as Metadata).text)
    return docs.join('\n').substring(0, 3000)
}