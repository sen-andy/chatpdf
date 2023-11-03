import { String } from 'aws-sdk/clients/acm'
import React from 'react'

type Props = {
    pdf_url: String
}

const PDFViewer = ({ pdf_url }: Props) => {
    return (
        <iframe
            src={`http://docs.google.com/gview?url=${pdf_url}&embedded=true&format=pdf`}
            className='w-full h-full'>
        </iframe>
    )
}

export default PDFViewer