import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!
    }
})

export const uploadToS3 = async (file: File) => {
    const file_key = 'uploads/' + Date.now().toString() + '-' + file.name.replace(/ /g, '_')

    const putCommand = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
        Body: file
    })
    
    try {
        const res = await s3Client.send(putCommand)

        return Promise.resolve({
            status: res.$metadata.httpStatusCode,
            file_key,
            file_name: file.name
        })
    } catch (err) {
        console.error(err)
    }
}

export const getS3Url = (file_key: string) => {
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`
    return url
}