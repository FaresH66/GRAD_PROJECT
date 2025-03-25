import { Card, CardContent } from "@/components/ui/card"
import { MonitorSmartphone, Zap, Clock } from "lucide-react"

export default function ChatInfo() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-center text-3xl font-semibold text-white">ChatGPT</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Examples Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <MonitorSmartphone className="h-5 w-5" />
                <h2 className="font-medium">Examples</h2>
              </div>
              <div className="space-y-3">
                {[
                  '"Explain quantum computing in simple terms" →',
                  '"Got any creative ideas for a 10 year old\'s birthday?" →',
                  '"How do I make an HTTP request in JavaScript?" →',
                ].map((text, i) => (
                  <div key={i} className="rounded-lg bg-slate-700/50 p-3 text-sm text-slate-200">
                    {text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Capabilities Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5" />
                <h2 className="font-medium">Capabilities</h2>
              </div>
              <div className="space-y-3">
                {[
                  "Remembers what user said earlier in the conversation",
                  "Allows user to provide follow-up corrections",
                  "Trained to decline inappropriate requests",
                ].map((text, i) => (
                  <div key={i} className="rounded-lg bg-slate-700/50 p-3 text-sm text-slate-200">
                    {text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Limitations Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5" />
                <h2 className="font-medium">Limitations</h2>
              </div>
              <div className="space-y-3">
                {[
                  "May occasionally generate incorrect information",
                  "May occasionally produce harmful instructions or biased content",
                  "Limited knowledge of world and events after 2021",
                ].map((text, i) => (
                  <div key={i} className="rounded-lg bg-slate-700/50 p-3 text-sm text-slate-200">
                    {text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

