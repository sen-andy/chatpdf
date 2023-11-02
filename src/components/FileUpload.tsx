'use client'
import { uploadToS3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import { Inbox, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const FileUpload = () => {
    const router = useRouter()
    const [ uploading, setUploading ] = useState(false)
    const { mutate, isPending } = useMutation({
        mutationFn: async ({
            file_key,
            file_name
        }: {
            file_key: string,
            file_name: string
        }) => {
            const res = await axios.post('/api/create-chat', { file_key, file_name })
            return res.data;
        }
    })

    const { getRootProps, getInputProps } = useDropzone({
        accept: {'application/pdf': ['pdf']},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0]
            if (file.size > 10 * 1024 * 1024) {
                toast.error("file limit exceeded")
                return
            }

            try {
                setUploading(true)
                const data = await uploadToS3(file)
                if (!data?.file_key || !data.file_name) {
                    toast.error("something went wrong");
                    return;
                }
                mutate(data, {
                    onSuccess: ({ chat_id }) => {
                        toast.success("chat created")
                        router.push(`/chat/${chat_id}`)
                    },
                    onError: err => {
                        toast.error("error creating chat")
                    }
                })
            } catch (err) {
                //TODO add toast
                console.log(err)
            } finally {
                setUploading(false)
            }
        }
    })
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
            })}>
                <input {...getInputProps()} />
                { uploading || isPending ? (
                <>
                    <Loader2 className='h-10 w-10 text-blue-500 animate-spin' />
                    <p className='mt-2 text-sm text-slate-400'>Spilling Tea to GPT...</p>
                </>
                ): (
                <>
                    <Inbox className='w-10 h-10 text-blue-500' />
                    <p className='mt-2 text-sm text-slate-400'>Drop PDF Here</p>
                </> 
                )}
            </div>
        </div>
    )
}

export default FileUpload