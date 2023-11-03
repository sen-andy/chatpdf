import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from './s3'
import { writeFileSync } from 'fs'

export const downloadFromS3 = async (file_key: string) => {
    try {
        const getObject = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            Key: file_key
        })

        const res = await s3Client.send(getObject)
        const file_name = `/tmp/pdf-${Date.now()}.pdf`
        writeFileSync(file_name, await res.Body?.transformToByteArray()!)

        return file_name
    } catch (err) {
        console.error(err)
        return null
    }
}