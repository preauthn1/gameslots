// @ts-nocheck
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { createChatConversationGroup, fetchChatConversationList, fetchChatMessages } from '@/api/chat';
import { PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { TextField } from '@/components/form-controls';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useChatroomStore } from '@/stores/chatroom-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import tokenManager from '@/utils/token-manager';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const listOf = (result) => result?.data?.list || result?.data?.records || result?.list || result?.records || (Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : []);

function useConversation(kind) {
  const user = useUserStore((state) => state.userInfo);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const userId = user?.id || user?.user_id;
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchChatConversationList({ pageNum: 1, pageSize: 20, visitorUserId: String(userId) })
      .then(async (result) => {
        let conversations = listOf(result);
        if (!conversations.length) {
          await createChatConversationGroup({
            visitorUserId: String(userId),
            visitorName: user?.nickname || '',
            visitorAvatar: user?.avatar || '',
            visitorVipLevel: String(user?.level || ''),
            ownerUserId: String(userId),
            conversationName: kind,
            memberUserIds: [String(userId)],
          }).catch(() => {});
          const again = await fetchChatConversationList({ pageNum: 1, pageSize: 20, visitorUserId: String(userId) });
          conversations = listOf(again);
        }
        const current = conversations[0];
        setConversation(current);
        if (!current) return [];
        const history = await fetchChatMessages({ conversationId: current.id || current.conversationId, pageNum: 1, pageSize: 50 });
        return listOf(history);
      })
      .then((rows) => setMessages(rows || []))
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  }, [kind, user?.avatar, user?.id, user?.level, user?.nickname, user?.user_id]);
  return { user, messages, setMessages, conversation, loading };
}

function sendOverSocket(content, conversation, user) {
  const token = tokenManager.getToken();
  const base = useSystemStore.getState().appConfig?.message_ws;
  if (!token || !base || typeof WebSocket === 'undefined') return false;
  const socket = new WebSocket(`${base}?token=${encodeURIComponent(token)}`);
  const payload = {
    from: String(user?.id || user?.user_id || ''),
    to: '',
    cmd: 11,
    createTime: Date.now(),
    msgType: 0,
    chatType: 1,
    groupId: conversation?.groupId || conversation?.group_id || '',
    content,
    extras: { eventType: 'CHAT', source: 'contact-page' },
  };
  socket.onopen = () => {
    socket.send(JSON.stringify(payload));
    socket.close();
  };
  return true;
}

function ChatPane({ title, kind, extra }) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, messages, setMessages, conversation, loading } = useConversation(kind);
  const [text, setText] = useState('');
  const send = () => {
    const content = text.trim();
    if (!content) return;
    const sent = sendOverSocket(content, conversation, user);
    if (!sent) toast.error(t('errors.requestFailed'));
    setMessages((items) => [...items, { id: `local-${Date.now()}`, content, mine: true }]);
    setText('');
  };
  return (
    <Screen>
      <PageHeader title={title} onBack={() => router.back()} right={extra} />
      {loading ? <PageSkeleton rows={5} /> : (
        <FlatList
          style={styles.fill}
          data={messages}
          keyExtractor={(item, index) => String(item.id || item.messageId || index)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mine = item.mine || String(item.fromUserId || item.from || '') === String(user?.id || user?.user_id || '');
            return (
              <View style={[styles.bubble, mine && styles.mine]}>
                <Text style={styles.text}>{item.content || item.message || item.text || ''}</Text>
              </View>
            );
          }}
        />
      )}
      <View style={styles.composer}>
        <TextField fill compact backgroundColor={colors.bg} value={text} onChangeText={setText} placeholder={t('contact.enterPlaceholder')} />
        <PrimaryButton compact label={t('common.submit')} onPress={send} />
      </View>
    </Screen>
  );
}

export function ContactScreen() {
  const { t } = useI18n();
  return <ChatPane title={t('contact.title')} kind="customer-service" />;
}

export function ChatRoomScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const settings = useChatroomStore((state) => state.settings);
  return (
    <ChatPane
      title={t('chat.title')}
      kind="chatroom"
      extra={<Pressable onPress={() => router.push('/chatroom/settings')}><Text style={styles.link}>{settings.showVip ? 'VIP' : t('pageCopy.chatSettings.title')}</Text></Pressable>}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: s(12), gap: s(8) },
  bubble: { alignSelf: 'flex-start', maxWidth: '80%', padding: s(10), borderRadius: s(8), backgroundColor: colors.surface },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.accent },
  text: { color: colors.text },
  composer: { flexDirection: 'row', gap: s(8), padding: s(12), borderTopWidth: 1, borderTopColor: colors.line },
  link: { color: colors.accent, fontWeight: '700' },
});
