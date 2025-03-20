'use client';

import { useParams } from 'next/navigation';
import ConversationView from '@/components/messaging/conversation-view';

export default function ConversationPage() {
  const params = useParams();
  console.log("heheheh", params)
  const conversationId = params.conversationId as string;
  
  return (
    <ConversationView conversationId={conversationId} />
  );
}