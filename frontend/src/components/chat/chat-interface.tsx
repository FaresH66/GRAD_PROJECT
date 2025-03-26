import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MonitorSmartphone,
  Zap,
  Clock,
  Paperclip,
  Mic,
  Send,
  History,
  Library,
  Trash2,
  Settings,
  Share2,
  Square,
  Download,
  Folder,
} from "lucide-react"

export default function ChatInterface() {
  return (
    <div className="relative min-h-screen bg-gradient-dark overflow-hidden">
      {/* Top Navigation */}
      <div className="fixed top-0 left-64 right-0 h-14 bg-chatgpt-dark-nav backdrop-blur-xl border-b border-white/[0.1] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-200 font-medium">New Chat</span>
          <span className="text-xs text-gray-400">23 June 2023</span>
        </div>
        <div className="flex items-center gap-2">
          {[Share2, Square, Download, Folder].map((Icon, i) => (
            <Button
              key={i}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/[0.1] rounded-lg"
            >
              <Icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-chatgpt-secondary backdrop-blur-xl z-20">
        <div className="p-2">
          <Button className="w-full bg-chatgpt-primary hover:bg-chatgpt-primary/90 text-white rounded-lg py-3 mb-2 transition-colors">
            + New Chat
          </Button>
          <nav className="space-y-1 mt-4">
            {[
              { icon: History, label: "History" },
              { icon: Library, label: "Collection" },
              { icon: Trash2, label: "Bin" },
              { icon: Settings, label: "Settings" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-white/[0.1] rounded-lg transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-24 px-4 relative z-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <h1 className="text-center text-4xl font-semibold text-white mb-8">ChatGPT</h1>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Examples",
                icon: MonitorSmartphone,
                items: [
                  '"Explain quantum computing in simple terms" →',
                  '"Got any creative ideas for a 10 year old\'s birthday?" →',
                  '"How do I make an HTTP request in JavaScript?" →',
                ],
              },
              {
                title: "Capabilities",
                icon: Zap,
                items: [
                  "Remembers what user said earlier in the conversation",
                  "Allows user to provide follow-up corrections",
                  "Trained to decline inappropriate requests",
                ],
              },
              {
                title: "Limitations",
                icon: Clock,
                items: [
                  "May occasionally generate incorrect information",
                  "May occasionally produce harmful instructions or biased content",
                  "Limited knowledge of world and events after 2021",
                ],
              },
            ].map((section) => (
              <Card key={section.title} className="bg-chatgpt-dark-card backdrop-blur-md border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-white mb-4">
                    <section.icon className="h-5 w-5" />
                    <h2 className="font-medium">{section.title}</h2>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((text, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-white/[0.05] p-3 text-sm text-gray-200 hover:bg-white/[0.1] transition-colors cursor-pointer"
                      >
                        {text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Message Input */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-gradient-to-t from-chatgpt-dark-start to-transparent z-20">
        <div className="mx-auto max-w-3xl">
          <div className="relative flex items-center rounded-xl bg-chatgpt-dark-card backdrop-blur-xl border border-white/[0.1] shadow-xl">
            <Button variant="ghost" className="p-3 text-gray-400 hover:text-white">
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              type="text"
              placeholder="Send a message"
              className="flex-1 bg-transparent px-3 py-3.5 text-white placeholder-gray-400 focus:outline-none"
            />
            <div className="flex items-center gap-2 px-3">
              <Button variant="ghost" className="p-2 text-gray-400 hover:text-white">
                <Mic className="h-5 w-5" />
              </Button>
              <Button className="bg-chatgpt-primary hover:bg-chatgpt-primary/90 p-2 rounded-lg transition-colors">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

