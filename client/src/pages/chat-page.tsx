import { SecureChat } from "@/components/secure-chat";
import { useUserContext } from "@/hooks/use-user-context";

export default function ChatPage() {
  const { user } = useUserContext();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="ss-overline mb-2">Support</div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Secure Chat
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Message your credit repair team securely. All messages are encrypted.
          </p>
        </div>
        <div className="ss-chat-wrap">
          <SecureChat userId={user?.id ?? 0} userType="client" />
        </div>
      </div>
    </div>
  );
}
