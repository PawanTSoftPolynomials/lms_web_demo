import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/shadcn/avatar";
import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { ConversationPreview } from "@/types/instructor-dashboard";

interface MessagesWidgetProps {
  conversations?: ConversationPreview[];
  isLoading?: boolean;
}

export function MessagesWidget({ conversations, isLoading }: MessagesWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardAction>
          <Link href="/instructor/messages" className="text-[11px] font-bold text-primary hover:underline">
            Open Inbox
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-14 rounded-xl" />)
        ) : !conversations || conversations.length === 0 ? (
          <EmptyWidgetState icon={MessageSquare} message="No conversations yet." />
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              href="/instructor/messages"
              className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-muted transition"
            >
              <Avatar>
                <AvatarImage src={c.avatarUrl ?? undefined} alt={c.name} />
                <AvatarFallback>{c.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-foreground truncate">{c.name}</p>
                  <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{c.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && <Badge className="shrink-0">{c.unread}</Badge>}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
