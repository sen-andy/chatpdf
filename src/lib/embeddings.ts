import { OpenAIApi, Configuration } from 'openai-edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

export const getEmbeddings = async (text: string) => {
    try {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text.replace(/\n/g, ' ')
        })
        const result = await response.json()
        if (result.error) throw Error(result.error.message);
        return result.data[0].embedding as number[]
    } catch (err) {
        console.log(err)
    }
}