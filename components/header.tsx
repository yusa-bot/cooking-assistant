import { ChefHat } from "lucide-react"

export default function Header() {
  return (
    <header className="w-full max-w-md mx-auto py-6 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <ChefHat className="h-8 w-8 text-green-600" />
        <h1 className="text-2xl font-bold">AI Recipe Assistant</h1>
      </div>
    </header>
  )
}
