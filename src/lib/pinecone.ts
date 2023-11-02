import { Pinecone, PineconeRecord, RecordId, RecordValues } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings'
import md5 from 'md5'
import { metadata } from '@/app/layout'
import { convertToAscii } from './utils'

let pinecone: Pinecone | null = null

export const getPineconeClient = async () => {
    if(!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!
        })
    }
    return pinecone
}

type PDFPage = {
    pageContent: string
    metadata: {
        loc: { pageNumber: number }
    }
}

export const loadS3IntoPinecone = async (fileKey: string) => {
    console.log('downloading s3 into file system')
    const file_name = await downloadFromS3(fileKey)
    if (!file_name) {
        throw new Error("could not download from s3")
    }
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[];

    const documents = await Promise.all(pages.map(prepareDocument))

    const records = await Promise.all(documents.flat().map(embedDocument))
    // console.log('records', records);

    const client = await getPineconeClient()
    const pineconeIndex = await client.Index('chatpdf')
    // const namespace = pineconeIndex.namespace(convertToAscii(fileKey))

    console.log('inserting records into pinecone')

    await pineconeIndex.upsert(records)
}

const embedDocument = async (doc: Document) => {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)

        return {
            id: hash,
            values: embeddings,
            metadata:  {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (err) {
        console.log('error embedding document', err)
        throw err
    }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

const prepareDocument = async (page: PDFPage) => {
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, '')
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ])
    return docs
}