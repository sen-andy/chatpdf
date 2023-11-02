import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";

export default async () => {
  const { userId } = await auth()
  const isAuth = !!userId

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-neutral-500 via-transparent to-teal-300">
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        <div className="flex flex-col item-center text-center">
          <div className="flex justify-center items-center">
            <h1 className="text-5xl font-semibold">Chat with any PDF</h1>
            { isAuth && <div className="ml-3"><UserButton afterSignOutUrl="/" /></div> }
          </div>
          <div className="flex justify-center mt-2">
            { isAuth && <Button>Go to Chats</Button> }
          </div>
          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Join millions of students, researchers and professionals to instantly answer questions and research with AI
          </p>

          <div className="w-full mt-4">
            { isAuth ? (
              <FileUpload />
            ):(
              <Link href="/sign-in">
              <Button>Login to get Started!<LogIn className="w-4 h-4 ml-2" /></Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}