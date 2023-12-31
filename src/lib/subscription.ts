import { auth } from "@clerk/nextjs"
import { db } from "./db"
import { userSubscriptions } from "./db/schema"
import { eq } from "drizzle-orm"

const DAY_MS = 1000 * 60 * 60 * 24
export const checkSubscription = async () => {
    const { userId } = auth()
    if (!userId) return false

    const _userSubscriptions = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
    
    const userSubscription = _userSubscriptions[0]

    if (!userSubscription) return false

    const isValid =
        userSubscription.stripePriceId
        && userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_MS > Date.now()

    return !!isValid
}