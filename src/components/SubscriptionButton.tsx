'use client'

import { useState } from "react"
import { Button } from "./ui/button"
import axios from "axios"

type Props = { isPro: boolean }

const SubscriptionButton = ({ isPro }: Props) => {
    const [loading, setLoading] = useState(false)

    const handleSubscription = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/atripe')
            window.location.href = res.data.url
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button disabled={loading} onClick={handleSubscription}>
            { isPro ? "Manage Subscription" : "Upgrade to Pro" }
        </Button>
    )
}

export default SubscriptionButton