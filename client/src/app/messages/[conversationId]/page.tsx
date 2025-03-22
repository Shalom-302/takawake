'use client';

import { useParams } from 'next/navigation';
import ConversationView from '@/components/messaging/conversation-view';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  
  return (
    <ConversationView conversationId={conversationId} />
  );
}