// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

import { gameOut, getAppConfig, getGameList, getGameTypes, getGameUrl } from '@/api/index';
import { gameBet } from '@/api/game';
import { bankAdd, bankList, payOut, rechargeList, withdrawList } from '@/api/bankcard';
import { getUserBillList } from '@/api/wallect';
import { noticeDetail, noticeList, noticeRead, messageList, readMessage } from '@/api/notice';
import { get_article_content, get_article_detail } from '@/api/common';
import { getAgentList, getLevelList, getLevelReward, getTeamList, getTeamStatistics } from '@/api/vip';
import { getUserRank, updatePassword, updatePayPassword, updatePhone, updateUserInfo, resetPassword, getKyc, addKyc, upgradeDeviceAccount, sendPhoneCode } from '@/api/user';
import { getPrizePoolLeaderboard } from '@/api/jackpot';
import { getSacredActivity } from '@/api/sacred';
import { getBalanceTreasureOverview, getBalanceTreasureRecords } from '@/api/balanceTreasure';
import { creatorsSubmit } from '@/api/incentivePlan';
import { fetchChatConversationList } from '@/api/chat';
import { getTurntableWithdrawals } from '@/api/turntable';
import { ConfirmSheet, EmptyState, ListLoadFooter, PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { PasswordField, TextField } from '@/components/form-controls';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';
import { SearchGlyph } from '@/components/source-icon';

const listOf = (result) => {
  const data = result?.data ?? result;
  if (Array.isArray(data)) return data;
  return data?.list || data?.records || data?.items || data?.rows || [];
};

function useLoader(loader) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    loader()
      .then((result) => {
        if (alive) setItems(listOf(result));
      })
      .catch((err) => {
        if (alive) setError(err?.message || 'Request failed');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  return { items, error, loading };
}

const recordFields = (item) => ({
  title: item.game_name || item.name || item.title || item.nickname || item.activityName || item.type_name || item.username || item.order_no || '—',
  amount: item.amount ?? item.betAmount ?? item.balance ?? item.reward ?? '',
  order: item.order_no || item.business_sn || '',
  time: item.created_at || item.create_time || item.bet_time || item.time || '',
  status: item.status_text || (typeof item.status === 'string' ? item.status : '') || item.remark || '',
});

export function ResourceListScreen({ title, loader, onPressItem }) {
  const router = useRouter();
  const { t } = useI18n();
  const { items, error, loading } = useLoader(loader);
  const [vendor, setVendor] = useState('');
  const vendors = [...new Set(items.map((item) => item.provider || item.vendor || item.platform_name).filter(Boolean))];
  const shown = vendor ? items.filter((item) => (item.provider || item.vendor || item.platform_name) === vendor) : items;
  return (
    <Screen>
      <PageHeader title={title} onBack={() => router.back()} />
      {vendors.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorRow} contentContainerStyle={styles.vendorContent}>
          <Pressable style={[styles.vendorChip, !vendor && styles.noticeTabActive]} onPress={() => setVendor('')}>
            <Text style={styles.cardTitle}>{t('wallet.billTypeAll')}</Text>
          </Pressable>
          {vendors.map((name) => (
            <Pressable key={name} style={[styles.vendorChip, vendor === name && styles.noticeTabActive]} onPress={() => setVendor(name)}>
              <Text style={styles.cardTitle}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {loading ? (
        <PageSkeleton rows={6} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(item, index) => String(item.id || item.userJourneyStationId || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label={error || t('common.noData')} />}
          renderItem={({ item }) => {
            const record = recordFields(item);
            return (
              <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => onPressItem?.(item)}>
                <View style={styles.recordTop}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{record.title}</Text>
                  <Text style={styles.recordAmount}>{record.amount === '' ? '' : `₹${record.amount}`}</Text>
                </View>
                {record.order ? <Text style={styles.cardMeta}>{t('wallet.transactionId')} {record.order}</Text> : null}
                <View style={styles.recordTop}>
                  <Text style={styles.cardMeta}>{record.time}</Text>
                  <Text style={styles.recordStatus}>{record.status}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const GAME_PAGE_SIZE = 30;
const GAME_CATEGORY_IDS = ['hot', 'collect', 'record'];

const gameRows = (result) => {
  if (Array.isArray(result?.list)) return result.list;
  if (Array.isArray(result)) return result;
  return [];
};

const gameQuery = (id, keyword, page) => {
  const query = { page, page_size: GAME_PAGE_SIZE, keyword, type_id: '', is_hot: 0, is_collect: 0, is_record: 0 };
  if (id === 'hot') query.is_hot = 1;
  else if (id === 'collect') query.is_collect = 1;
  else if (id === 'record') query.is_record = 1;
  else if (id) query.type_id = id;
  return query;
};

export function GameListScreen() {
  const { keyword: initialKeyword = '' } = useLocalSearchParams();
  const [keyword, setKeyword] = useState(String(initialKeyword || ''));
  const [types, setTypes] = useState([]);
  const [activeId, setActiveId] = useState('hot');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const requestRef = useRef(0);
  const pageRef = useRef(1);
  const finishedRef = useRef(false);
  const loadingRef = useRef(true);
  const queryRef = useRef({ id: 'hot', keyword: String(initialKeyword || '') });
  const keywordTimer = useRef(null);
  const categories = [
    { id: 'hot', name: t('gameType.hot') },
    { id: 'collect', name: t('gameType.collect') },
    { id: 'record', name: t('gameType.recent') },
  ];
  const vendors = types.filter((item) => !GAME_CATEGORY_IDS.includes(String(item.id)));
  queryRef.current = { id: activeId, keyword };

  const applyPage = (result, nextPage, append) => {
    const list = gameRows(result);
    const done = list.length < GAME_PAGE_SIZE;
    setItems((current) => (append ? [...current, ...list] : list));
    finishedRef.current = done;
    setFinished(done);
    pageRef.current = done ? nextPage : nextPage + 1;
  };

  const load = (id = activeId, nextKeyword = keyword) => {
    if ((id === 'collect' || id === 'record') && !isLoggedIn) {
      openLogin();
      return;
    }
    const requestId = ++requestRef.current;
    queryRef.current = { id, keyword: nextKeyword };
    setActiveId(id);
    setLoading(true);
    setLoadingMore(false);
    loadingRef.current = true;
    finishedRef.current = false;
    setFinished(false);
    pageRef.current = 1;
    setItems([]);
    getGameList(gameQuery(id, nextKeyword, 1))
      .then((result) => {
        if (requestId !== requestRef.current) return;
        applyPage(result, 1, false);
      })
      .catch((error) => {
        if (requestId !== requestRef.current) return;
        toast.error(error?.message);
      })
      .finally(() => {
        if (requestId !== requestRef.current) return;
        loadingRef.current = false;
        setLoading(false);
      });
  };

  const loadMore = () => {
    if (loadingRef.current || finishedRef.current || pageRef.current <= 1) return;
    const requestId = requestRef.current;
    const nextPage = pageRef.current;
    const current = queryRef.current;
    loadingRef.current = true;
    setLoadingMore(true);
    getGameList(gameQuery(current.id, current.keyword, nextPage))
      .then((result) => {
        if (requestId !== requestRef.current) return;
        applyPage(result, nextPage, true);
      })
      .catch((error) => {
        if (requestId !== requestRef.current) return;
        toast.error(error?.message);
      })
      .finally(() => {
        if (requestId !== requestRef.current) return;
        loadingRef.current = false;
        setLoadingMore(false);
      });
  };

  const selectType = (id) => {
    if ((id === 'collect' || id === 'record') && !isLoggedIn) {
      openLogin();
      return;
    }
    if (keywordTimer.current) clearTimeout(keywordTimer.current);
    setKeyword('');
    load(id, '');
  };

  const onKeywordChange = (value) => {
    setKeyword(value);
    if (keywordTimer.current) clearTimeout(keywordTimer.current);
    keywordTimer.current = setTimeout(() => load(activeId, value.trim()), 400);
  };

  useEffect(() => {
    const requestId = ++requestRef.current;
    const keywordValue = String(initialKeyword || '');
    Promise.all([
      getGameTypes().catch(() => []),
      getGameList(gameQuery('hot', keywordValue, 1)).catch((error) => {
        toast.error(error?.message);
        return null;
      }),
    ]).then(([typeResult, listResult]) => {
      if (requestId !== requestRef.current) return;
      const remote = Array.isArray(typeResult) ? typeResult : typeResult?.list || [];
      setTypes(remote);
      applyPage(listResult, 1, false);
      loadingRef.current = false;
      setLoading(false);
    });
    return () => {
      requestRef.current += 1;
      if (keywordTimer.current) clearTimeout(keywordTimer.current);
    };
  }, []);

  const renderChip = (item, vendor = false) => {
    const active = activeId === String(item.id);
    return (
      <Pressable key={String(item.id)} style={[styles.chip, vendor && styles.vendorChip, active && styles.chipActive]} onPress={() => selectType(String(item.id))}>
        <Text style={[styles.chipText, vendor && styles.vendorChipText, active && styles.chipTextActive]} numberOfLines={1}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <PageHeader title={t('gameList.title')} onBack={() => router.back()} />
      <View style={styles.searchRow}>
        <TextField
          value={keyword}
          onChangeText={onKeywordChange}
          onSubmitEditing={() => load(activeId, keyword.trim())}
          placeholder={t('gameList.searchPlaceholder')}
          autoCapitalize="none"
          left={<SearchGlyph />}
        />
      </View>
      <View style={styles.filters}>
        <View style={styles.categoryRow}>{categories.map((item) => renderChip(item, false))}</View>
        {vendors.length ? (
          <ScrollView horizontal style={styles.vendorRow} contentContainerStyle={styles.vendorContent} showsHorizontalScrollIndicator={false}>
            {vendors.map((item) => renderChip(item, true))}
          </ScrollView>
        ) : null}
      </View>
      {loading ? (
        <PageSkeleton rows={4} />
      ) : (
      <FlatList
        style={styles.fill}
        data={items}
        numColumns={3}
        keyExtractor={(item, index) => String(item.id || index)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label={t('common.noData')} />}
        ListFooterComponent={<ListLoadFooter loading={loadingMore} finished={finished} hasData={items.length > 0} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <Pressable
            style={styles.game}
            onPress={() => {
              if (!isLoggedIn) {
                openLogin();
                return;
              }
              router.push({ pathname: '/game', params: { id: String(item.id), type: String(item.platform_type || '2'), name: item.name || '' } });
            }}>
            <Image source={{ uri: item.image || item.img }} style={styles.gameImage} />
            <Text style={styles.cardMeta} numberOfLines={1}>{item.name}</Text>
          </Pressable>
        )}
      />
      )}
    </Screen>
  );
}

export function GameScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    const id = String(params.id || '');
    getGameUrl({ id, type: String(params.type || '2') })
      .then((response) => setUrl(response?.play_url || ''))
      .catch((err) => setError(err?.message || t('gameView.loadUrlFailed')));
    return () => {
      if (id) gameOut({ id, type: String(params.type || '2') }).catch(() => {});
    };
  }, [params.id, params.type]);

  return (
    <Screen>
      <PageHeader title={String(params.name || t('gameView.defaultTitle'))} onBack={() => router.back()} />
      {url ? <WebView source={{ uri: url }} style={styles.web} /> : error ? <EmptyState label={error} /> : <PageSkeleton rows={2} />}
    </Screen>
  );
}

const plainText = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function NoticeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { tab: queryTab } = useLocalSearchParams();
  const [tab, setTab] = useState(queryTab === 'message' ? 'message' : 'announcement');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = (nextTab = tab) => {
    setLoading(true);
    const request = nextTab === 'message' ? messageList({ type: 1, page: 1, page_size: 20 }) : noticeList({ type: '', page: 1, page_size: 20 });
    request
      .then((result) => setItems(result?.list || result?.data?.list || []))
      .catch((error) => {
        setItems([]);
        toast.error(error?.message || t(nextTab === 'message' ? 'notice.fetchMessagesFailed' : 'notice.fetchAnnouncementsFailed'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const markAll = async () => {
    try {
      if (tab === 'message') await readMessage({ ids: '' });
      else await noticeRead({ notice_id: '' });
      setItems((current) => current.map((item) => ({ ...item, is_read: 1 })));
      toast.success(t(tab === 'message' ? 'notice.allMessagesMarkedRead' : 'notice.allAnnouncementsMarkedRead'));
    } catch (error) {
      toast.error(error?.message || t('notice.markAllReadFailed'));
    }
  };

  const openItem = async (item) => {
    try {
      if (tab === 'message') await readMessage({ ids: String(item.id) });
      else await noticeRead({ notice_id: item.id });
    } catch {
      // 详情页仍可打开，已读失败不阻断浏览。
    }
    router.push({ pathname: '/notice-detail', params: { id: String(item.id || ''), kind: tab } });
  };

  const unread = items.filter((item) => Number(item.is_read) === 0).length;

  return (
    <Screen>
      <PageHeader title={t('notice.title')} onBack={() => router.back()} />
      <View style={styles.noticeTabs}>
        {['announcement', 'message'].map((key) => (
          <Pressable key={key} style={[styles.noticeTab, tab === key && styles.noticeTabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.chipText, tab === key && styles.chipTextActive]}>{t(`notice.${key}`)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.noticeActions}>
        <Text style={styles.cardMeta}>{t('notice.unreadCount', { count: unread })}</Text>
        <Pressable onPress={markAll}><Text style={styles.recordLink}>{t('notice.markAllRead')}</Text></Pressable>
      </View>
      {loading ? (
        <PageSkeleton rows={5} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label={t('notice.empty')} />}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, Number(item.is_read) !== 0 && styles.readCard]} onPress={() => openItem(item)}>
              <View style={styles.recordTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.recordAmount}>{Number(item.is_read) === 0 ? t('notice.unread') : t('notice.read')}</Text>
              </View>
              <Text style={styles.cardMeta} numberOfLines={2}>{plainText(item.content)}</Text>
              <Text style={styles.cardMeta}>{item.created_at}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

export function BettingScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('pageCopy.betting.history')} loader={() => gameBet({ page: 1, page_size: 20 })} />;
}

export function BillScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('wallet.billRecord')} loader={() => getUserBillList({ page: 1, page_size: 20 })} />;
}

export function RechargeRecordScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('rechargeRecord.title')} loader={() => rechargeList({ page: 1, page_size: 20 })} />;
}

export function WithdrawRecordScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('withdrawRecord.title')} loader={() => withdrawList({ page: 1, page_size: 20 })} />;
}

export function SpinWithdrawScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('spin.spinRecords')} loader={() => getTurntableWithdrawals({ page: 1, page_size: 20 })} />;
}

export function VipScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const [levels, setLevels] = useState([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(Number(user?.level || 0));
  const [claiming, setClaiming] = useState('');

  useEffect(() => {
    getLevelList()
      .then((result) => {
        const list = (Array.isArray(result) ? result : result?.list || []).slice().sort((a, b) => Number(a.number) - Number(b.number));
        setLevels(list);
        setSelected(Number(user?.level || list[0]?.number || 0));
      })
      .catch((error) => toast.error(error?.message || t('errors.requestFailed')))
      .finally(() => setReady(true));
  }, [t, user?.level]);

  const currentLevel = Number(user?.level || 0);
  const config = levels.find((item) => Number(item.number) === selected) || levels[0];
  const next = levels.find((item) => Number(item.number) > currentLevel);
  const rechargeGap = next ? Math.max(0, Number(next.recharge || 0) - Number(user?.total_recharge || 0)) : 0;
  const wagerGap = next ? Math.max(0, Number(next.game_wagers || 0) - Number(user?.total_game_wagers || 0)) : 0;
  const progress = !next
    ? t('vip.maxLevelReached')
    : rechargeGap > 0
      ? `${t('vip.rechargeMore')} ₹ ${rechargeGap.toLocaleString('en-US')} ${t('vip.upgradeTo')} ${next.name || `VIP ${next.number}`}`
      : wagerGap > 0
        ? `${t('vip.betMore')} ₹ ${wagerGap.toLocaleString('en-US')} ${t('vip.upgradeTo')} ${next.name || `VIP ${next.number}`}`
        : t('vip.upgradeReady');

  const claim = async (type) => {
    if (!type || claiming) return;
    setClaiming(type);
    try {
      await getLevelReward({ type, level: selected });
      toast.success(t('vip.claimSuccess'));
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setClaiming('');
    }
  };

  const rewards = config
    ? [
        { id: 'upgrade', title: t('vip.upgradeReward'), desc: t('vip.upgradeDesc', { name: config.name || '' }), amount: config.bonus, type: '' },
        { id: 'week', title: t('vip.weeklyReward'), desc: t('vip.weeklyReset'), amount: config.week_bonus, type: 'week_bonus', can: Number(config.is_week_bonus) === 1 && selected === currentLevel },
        { id: 'month', title: t('vip.monthlyReward'), desc: t('vip.monthlyReset'), amount: config.month_bonus, type: 'month_bonus', can: Number(config.is_month_bonus) === 1 && selected === currentLevel },
      ]
    : [];

  return (
    <Screen>
      <PageHeader title="VIP" onBack={() => router.back()} />
      {!ready ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          <ScrollView horizontal style={styles.vendorRow} contentContainerStyle={styles.vendorContent} showsHorizontalScrollIndicator={false}>
            {levels.map((item) => {
              const id = Number(item.number);
              const active = id === selected;
              return (
                <Pressable key={id} style={[styles.vipTab, active && styles.chipActive]} onPress={() => setSelected(id)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>V{item.number}</Text>
                  {id === currentLevel ? <Text style={styles.vipCurrent}>{t('vip.currentLevel')}</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.section}>{t('vip.memberLevel')}</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{config?.name || `VIP ${currentLevel}`}</Text>
            <Text style={styles.cardMeta}>{progress}</Text>
            <View style={styles.recordTop}>
              <Text style={styles.cardMeta}>{t('vip.totalRecharge')}</Text>
              <Text style={styles.cardTitle}>₹ {Number(user?.total_recharge || 0).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.recordTop}>
              <Text style={styles.cardMeta}>{t('vip.totalBet')}</Text>
              <Text style={styles.cardTitle}>₹ {Number(user?.total_game_wagers || 0).toLocaleString('en-US')}</Text>
            </View>
          </View>
          {rewards.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.recordTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.recordAmount}>₹ {Number(item.amount || 0).toLocaleString('en-US')}</Text>
              </View>
              <Text style={styles.cardMeta}>{item.desc}</Text>
              {item.type ? (
                <PrimaryButton label={item.can ? t('vip.claim') : t('vip.claimed')} disabled={!item.can} loading={claiming === item.type} onPress={() => claim(item.type)} />
              ) : null}
            </View>
          ))}
          <Pressable style={styles.card} onPress={() => router.push('/vip-center/benefits')}>
            <Text style={styles.cardTitle}>{t('vipWelfare.levelGuide')}</Text>
          </Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}

export function TeamScreen() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    getTeamStatistics().then(setStats).catch(() => {});
  }, []);
  return (
    <View style={styles.fill}>
      <Text style={styles.bannerText}>{stats?.team_count || stats?.data?.team_count || ''}</Text>
      <ResourceListScreen title={t('myTeam.title')} loader={() => getTeamList({ page: 1, page_size: 20 })} />
    </View>
  );
}

export function RankScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('rankings.title')} loader={() => getUserRank()} />;
}

export function JackpotScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('jackpotRank.title')} loader={() => getPrizePoolLeaderboard({ page: 1, page_size: 20 })} />;
}

export function SacredScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('sacredJourney.tabJourney')} loader={() => getSacredActivity()} />;
}

export function TreasureScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState('interest');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState(false);
  useEffect(() => {
    getBalanceTreasureOverview()
      .then(setOverview)
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  }, []);
  const data = overview?.data || overview || {};
  const balance = data.balance ?? data.total_balance ?? data.amount ?? 0;
  const income = data.totalIncome ?? data.total_income ?? data.yesterday_income ?? data.income ?? 0;
  const claimable = data.claimableInterest ?? data.claimable_interest ?? data.claimable ?? 0;
  return (
    <Screen>
      <PageHeader title={t('balanceTreasure.title')} onBack={() => router.back()} right={<Pressable onPress={() => setRules(true)}><Text style={styles.recordAmount}>{t('balanceTreasure.rules')}</Text></Pressable>} />
      <View style={styles.noticeTabs}>
        {['interest', 'task'].map((key) => (
          <Pressable key={key} style={[styles.noticeTab, tab === key && styles.noticeTabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{t(`balanceTreasure.tabs.${key}`)}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <PageSkeleton rows={3} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.card}>
            <Text style={styles.cardMeta}>{t('balanceTreasure.balance')}</Text>
            <Text style={styles.balance}>₹{balance}</Text>
            <Text style={styles.cardMeta}>{t('balanceTreasure.totalIncome')} ₹{income}</Text>
            <Text style={styles.recordAmount}>{t('balanceTreasure.claimableInterest')} ₹{claimable}</Text>
          </View>
          {tab === 'task' ? (
            <>
              <Text style={styles.cardTitle}>{t('balanceTreasure.taskTitle')}</Text>
              {(data.plans || data.tasks || []).map((plan, index) => (
                <View key={plan.id || index} style={styles.card}>
                  <Text style={styles.cardTitle}>{plan.name || plan.title || t('balanceTreasure.taskTitle')}</Text>
                  <Text style={styles.cardMeta}>{plan.desc || plan.remark || t('balanceTreasure.insufficient')}</Text>
                </View>
              ))}
            </>
          ) : <Text style={styles.cardMeta}>{t('balanceTreasure.incomeHint')}</Text>}
          <PrimaryButton label={t('recharge.record')} onPress={() => router.push('/balance-treasure/records')} />
        </ScrollView>
      )}
      <ConfirmSheet visible={rules} title={t('balanceTreasure.rules')} message={t('balanceTreasure.rulesSummary')} confirmText={t('common.confirm')} cancelText={t('common.close')} onConfirm={() => setRules(false)} onClose={() => setRules(false)} />
    </Screen>
  );
}

export function TreasureRecordsScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('balanceTreasure.title')} loader={() => getBalanceTreasureRecords({ page: 1, page_size: 20 })} />;
}

export function HelpScreen() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <ResourceListScreen
      title={t('helpCenter.title')}
      loader={() => get_article_content({ type: 2, page: 1, page_size: 20 })}
      onPressItem={(item) => router.push({ pathname: '/help-detail', params: { id: String(item.id || '') } })}
    />
  );
}

const articleHtml = (title, content) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  body { margin: 0; background: ${colors.bg}; color: ${colors.text}; font-family: sans-serif; }
  .card { margin: ${s(12)}px ${s(16)}px; padding: ${s(14)}px ${s(12)}px; border: 1px solid ${colors.line}; border-radius: ${s(12)}px; background: ${colors.surface}; }
  h1 { margin: 0; color: ${colors.text}; font-size: ${s(15)}px; font-weight: 600; line-height: ${s(22)}px; text-align: center; word-break: break-word; }
  .divider { height: 1px; margin: ${s(12)}px 0; background: ${colors.line}; }
  .content { color: ${colors.muted}; font-size: ${s(12)}px; font-weight: 400; line-height: 1.6; word-break: break-word; }
  .content p { margin: 0 0 10px; }
  .content p:last-child { margin-bottom: 0; }
  .content img { display: block; max-width: 100%; height: auto; margin: 8px 0; border-radius: ${s(8)}px; }
  .content a { color: #4bd7f8; }
  .content ul, .content ol { margin: 0 0 10px; padding-left: 18px; }
  .content li { margin-bottom: 4px; }
  .content h1, .content h2, .content h3, .content h4 { margin: 0 0 8px; color: ${colors.text}; font-weight: 600; }
  .content table { width: 100%; margin: 8px 0; border-collapse: collapse; }
  .content td, .content th { padding: 6px; border: 1px solid ${colors.line}; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <div class="divider"></div>
    <div class="content">${content}</div>
  </div>
</body>
</html>`;

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function HelpDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const articleId = Array.isArray(id) ? id[0] : id;
  const articleType = Array.isArray(type) ? type[0] : type;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId && !articleType) {
      toast.warning(t('helpCenter.noArticle'));
      router.back();
      return undefined;
    }
    const request = articleId
      ? get_article_detail({ id: articleId })
      : get_article_content({ type: articleType }).then((result) => {
          if (result?.title || result?.content) return result;
          const list = Array.isArray(result) ? result : result?.list || result?.data || [];
          return list[0] || null;
        });
    let alive = true;
    request
      .then((result) => {
        if (alive) setArticle(result);
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [articleId, articleType, router, t]);

  const title = article?.title || '';
  const content = article?.content || '';

  return (
    <Screen>
      <PageHeader title={t('helpCenter.details')} onBack={() => router.back()} />
      {loading ? <PageSkeleton rows={4} /> : (
        <WebView
          originWhitelist={['*']}
          source={{ html: articleHtml(escapeHtml(title), content) }}
          style={styles.web}
          setSupportMultipleWindows={false}
        />
      )}
    </Screen>
  );
}

export function CustomerServiceScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const [faqs, setFaqs] = useState([]);
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get_article_content({ page: 1, page_size: 10, type: 9 }).catch(() => []),
      getAppConfig().catch(() => null),
    ]).then(([articles, config]) => {
      setFaqs(Array.isArray(articles) ? articles : articles?.list || []);
      const menu = config?.index_menu?.index_float_menu?.[0]?.list || [];
      setSocials([...menu].sort((a, b) => Number(b?.sort || 0) - Number(a?.sort || 0)));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <PageHeader title={t('customerServiceCenter.title')} onBack={() => router.back()} />
      {loading ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('customerServiceCenter.supportTitle')}</Text>
            <Text style={styles.cardMeta}>{t('customerServiceCenter.supportDesc')}</Text>
          </View>
          <Text style={styles.section}>{t('customerServiceCenter.onlineServiceTitle')}</Text>
          <Pressable style={styles.card} onPress={() => (isLoggedIn ? router.push('/contact') : openLogin())}>
            <Text style={styles.cardTitle}>{t('customerServiceCenter.platformServiceName')} · {t('customerServiceCenter.recommend')}</Text>
            <Text style={styles.cardMeta}>{t('customerServiceCenter.platformServiceDesc')}</Text>
          </Pressable>
          {socials.length ? <Text style={styles.section}>{t('customerServiceCenter.socialServiceTitle')}</Text> : null}
          {socials.map((item) => (
            <Pressable key={item.name} style={styles.card} onPress={() => item.url && Linking.openURL(item.url || item.link)}>
              <Text style={styles.cardTitle}>{t('customerServiceCenter.socialRow', { name: item.name })}</Text>
            </Pressable>
          ))}
          {faqs.length ? <Text style={styles.section}>{t('customerServiceCenter.faqTitle')}</Text> : null}
          {faqs.map((item) => (
            <Pressable key={item.id} style={styles.card} onPress={() => router.push({ pathname: '/help-detail', params: { id: String(item.id) } })}>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

export function ChatListScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('contact.title')} loader={() => fetchChatConversationList()} />;
}

export function AgentScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('common.service')} loader={() => getAgentList()} />;
}

function FieldForm({ title, fields, onSubmit }) {
  const router = useRouter();
  const { t } = useI18n();
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      toast.success(t('common.confirm'));
      router.back();
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.list}>
        {fields.map((field) => {
          const name = typeof field === 'string' ? field : field.name;
          const label = typeof field === 'string' ? field : field.label;
          const secure = typeof field === 'string' ? field.toLowerCase().includes('password') : field.secure;
          return (
            secure ? (
              <PasswordField
                key={name}
                label={label}
                value={values[name] || ''}
                placeholder={label}
                onChangeText={(text) => setValues((current) => ({ ...current, [name]: text }))}
              />
            ) : (
              <TextField
                key={name}
                label={label}
                value={values[name] || ''}
                placeholder={label}
                onChangeText={(text) => setValues((current) => ({ ...current, [name]: text }))}
              />
            )
          );
        })}
        <PrimaryButton label={t('common.submit')} onPress={submit} loading={submitting} />
      </ScrollView>
    </Screen>
  );
}

export function EditNicknameScreen() {
  const { t } = useI18n();
  const setUserInfo = useUserStore((state) => state.fetchUserInfo);
  return <FieldForm title={t('userInfo.nickname')} fields={[{ name: 'nickname', label: t('userInfo.nickname') }]} onSubmit={async (values) => { await updateUserInfo(values); await setUserInfo(); }} />;
}

export function ChangeLoginPasswordScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('changePassword.changeLoginPassword')}
      fields={[
        { name: 'old_password', label: t('changePassword.currentLoginPassword'), secure: true },
        { name: 'password', label: t('changePassword.newLoginPassword'), secure: true },
        { name: 'password_confirm', label: t('changePassword.confirmNewLoginPassword'), secure: true },
      ]}
      onSubmit={(values) => updatePassword(values)}
    />
  );
}

export function ChangePayPasswordScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('changePassword.changeTransactionPassword')}
      fields={[
        { name: 'old_password', label: t('changePassword.transactionPassword'), secure: true },
        { name: 'password', label: t('changePassword.transactionPassword'), secure: true },
        { name: 'password_confirm', label: t('changePassword.transactionPassword'), secure: true },
      ]}
      onSubmit={(values) => updatePayPassword(values)}
    />
  );
}

export function BindPhoneScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('bindPhone.title')}
      fields={[
        { name: 'phone', label: t('bindPhone.newPhone') },
        { name: 'verify_code', label: t('bindPhone.smsCodePlaceholder') },
      ]}
      onSubmit={async (values) => {
        await sendPhoneCode({ phone: values.phone, qh: '+91' }).catch(() => {});
        await updatePhone({ ...values, qh: '+91' });
      }}
    />
  );
}

export function ForgotPasswordScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('forgotPassword.title')}
      fields={[
        { name: 'phone', label: t('forgotPassword.phonePlaceholder') },
        { name: 'verify_code', label: t('bindPhone.smsCodePlaceholder') },
        { name: 'password', label: t('changePassword.newLoginPassword'), secure: true },
      ]}
      onSubmit={(values) => resetPassword({ ...values, qh: '+91' })}
    />
  );
}

export function KycScreen() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getKyc().catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <Screen>
        <PageSkeleton rows={3} />
      </Screen>
    );
  }
  return <FieldForm title={t('kyc.title')} fields={[{ name: 'realname', label: t('kyc.realName') }, { name: 'id_card', label: t('kyc.idNumber') }]} onSubmit={(values) => addKyc(values)} />;
}

export function GuestUpgradeScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('guestUpgrade.title')}
      fields={[
        { name: 'phone', label: t('guestUpgrade.phoneLabel') },
        { name: 'password', label: t('changePassword.newLoginPassword'), secure: true },
        { name: 'verify_code', label: t('guestUpgrade.smsCodeLabel') },
      ]}
      onSubmit={(values) => upgradeDeviceAccount({ ...values, qh: '+91' })}
    />
  );
}

export function WithdrawMethodScreen() {
  const { t } = useI18n();
  const user = useUserStore((state) => state.userInfo);
  const router = useRouter();
  useEffect(() => {
    if (Number(user?.user_type) === 1) {
      router.replace('/guest-account-upgrade');
    }
  }, [router, user?.user_type]);
  return <ResourceListScreen title={t('withdrawMethod.title')} loader={() => bankList()} />;
}

export function AddWithdrawMethodScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('addWithdrawMethod.title')}
      fields={[
        { name: 'bank_name', label: t('addWithdrawMethod.title') },
        { name: 'card_no', label: t('userInfo.withdrawMethod') },
        { name: 'realname', label: t('kyc.realName') },
      ]}
      onSubmit={(values) => bankAdd(values)}
    />
  );
}

const walletBg = require('../../assets/brand/wallet/wallet.webp');
const couponIcon = require('../../assets/brand/wallet/coupon.webp');

export function WalletScreen() {
  const { t } = useI18n();
  const user = useUserStore((state) => state.userInfo);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const router = useRouter();
  const [change, setChange] = useState(1);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo().catch(() => {});
  }, [fetchUserInfo]);

  useEffect(() => {
    setLoading(true);
    getUserBillList({ page: 1, page_size: 10, change })
      .then((result) => setBills(result?.list || result?.data?.list || []))
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, [change]);

  return (
    <Screen>
      <PageHeader title={t('profile.wallet')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.walletHero}>
          <Image source={walletBg} style={styles.walletHeroImage} contentFit="fill" />
          <Text style={styles.walletLabel}>{t('profile.myWallet')}</Text>
          <Text style={styles.walletBalance}>₹ {user?.balance ?? 0}</Text>
          <View style={styles.walletActions}>
            <Pressable style={styles.walletPrimary} onPress={() => router.push('/recharge')}>
              <Text style={styles.walletPrimaryText}>{t('profile.deposit')}</Text>
            </Pressable>
            <Pressable style={styles.walletOutline} onPress={() => router.push('/withdraw-method')}>
              <Text style={styles.walletOutlineText}>{t('profile.withdraw')}</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.couponRow} onPress={() => router.push('/coupon')}>
          <Image source={couponIcon} style={styles.couponIcon} contentFit="contain" />
          <View style={styles.taskText}>
            <Text style={styles.cardTitle}>{t('wallet.coupon')}</Text>
            <Text style={styles.cardMeta}>{t('wallet.couponAvailable')}</Text>
          </View>
        </Pressable>
        <Text style={styles.section}>{t('wallet.billRecord')}</Text>
        <View style={styles.billTabs}>
          {[1, 2].map((value) => (
            <Pressable key={value} style={[styles.billTab, change === value && styles.billTabActive]} onPress={() => setChange(value)}>
              <Text style={[styles.chipText, change === value && styles.chipTextActive]}>{t(value === 1 ? 'wallet.accountIncrease' : 'wallet.accountDecrease')}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <PageSkeleton rows={3} /> : null}
        {!loading && !bills.length ? <EmptyState label={t('common.noData')} /> : null}
        {bills.map((item, index) => (
          <View key={item.id || item.business_sn || index} style={styles.card}>
            <View style={styles.recordTop}>
              <Text style={styles.cardTitle}>{item.title || item.detail_type_name || item.remark || item.business_sn}</Text>
              <Text style={[styles.recordAmount, Number(item.change) === 2 && styles.amountDown]}>
                {Number(item.change) === 2 ? '-' : '+'} {item.balance}
              </Text>
            </View>
            <Text style={styles.cardMeta}>{item.created_at}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function WithdrawApplyScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('withdraw.title')}
      fields={[
        { name: 'amount', label: t('recharge.detailAmount') },
        { name: 'bank_id', label: t('withdrawMethod.title') },
        { name: 'pay_password', label: t('changePassword.transactionPassword'), secure: true },
      ]}
      onSubmit={(values) => payOut(values)}
    />
  );
}

export function NoticeDetailScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    noticeDetail({ id })
      .then((result) => setText(result?.content || result?.title || ''))
      .catch((error) => setText(error?.message))
      .finally(() => setLoading(false));
  }, [id]);
  const router = useRouter();
  return (
    <Screen>
      <PageHeader title={t('notice.title')} onBack={() => router.back()} />
      {loading ? <PageSkeleton rows={3} /> : <ScrollView contentContainerStyle={styles.list}><Text style={styles.cardMeta}>{text}</Text></ScrollView>}
    </Screen>
  );
}

export function IncentiveScreen() {
  const { t } = useI18n();
  return (
    <FieldForm
      title={t('incentivePlan.heading')}
      fields={[
        { name: 'link', label: t('incentivePlan.heading') },
        { name: 'remark', label: t('incentivePlan.subtitle') },
      ]}
      onSubmit={(values) => creatorsSubmit(values)}
    />
  );
}

export function SimplePage({ title, body }) {
  const router = useRouter();
  return (
    <Screen>
      <PageHeader title={title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.list}><Text style={styles.cardMeta}>{body}</Text></ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  list: { padding: s(12), gap: s(10) },
  card: { padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(4) },
  pressed: { opacity: 0.72 },
  cardTitle: { color: colors.text, fontWeight: '700', flex: 1 },
  recordTop: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  recordAmount: { color: colors.accent, fontWeight: '800' },
  recordStatus: { color: '#f3c45f', fontSize: s(12), fontWeight: '700' },
  tabText: { color: colors.text, fontWeight: '700', fontSize: s(13) },
  tabTextActive: { color: colors.accentInk },
  cardMeta: { color: colors.muted, fontSize: s(12) },
  searchRow: { paddingHorizontal: s(12), paddingTop: s(8), paddingBottom: s(12) },
  searchInput: { height: s(44), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: s(12) },
  categoryRow: { height: s(44), maxHeight: s(44), flexGrow: 0, flexDirection: 'row', gap: s(8), paddingHorizontal: s(12), marginBottom: s(12) },
  vendorRow: { height: s(36), maxHeight: s(36), flexGrow: 0, marginBottom: s(12) },
  vendorContent: { height: s(36), gap: s(6), paddingHorizontal: s(12), alignItems: 'center' },
  filters: { flexGrow: 0 },
  chip: { flex: 1, height: s(44), paddingHorizontal: s(8), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  vendorChip: { flex: 0, minWidth: s(60), height: s(36), paddingHorizontal: s(12) },
  vipTab: { minWidth: s(64), height: s(44), paddingHorizontal: s(10), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  vipCurrent: { color: '#f3c45f', fontSize: s(9) },
  noticeTabs: { flexDirection: 'row', gap: s(8), paddingHorizontal: s(12) },
  noticeTab: { flex: 1, height: s(36), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  noticeTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  noticeActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(12), paddingVertical: s(8) },
  recordLink: { color: colors.accent, fontWeight: '700' },
  readCard: { opacity: 0.62 },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  vendorChipText: { fontSize: s(13) },
  chipTextActive: { color: colors.accentInk },
  game: { width: '31%', margin: '1%', gap: s(4) },
  gameImage: { width: '100%', aspectRatio: 0.75, borderRadius: s(8), backgroundColor: colors.surface },
  web: { flex: 1, backgroundColor: colors.bg },
  bannerText: { color: colors.accent, paddingHorizontal: s(12), paddingTop: s(8) },
  balance: { color: colors.accent, fontSize: s(28), fontWeight: '800' },
  walletHero: { minHeight: s(142), borderRadius: s(12), overflow: 'hidden', paddingHorizontal: s(22), paddingTop: s(18), paddingBottom: s(12), justifyContent: 'space-between' },
  walletHeroImage: { ...StyleSheet.absoluteFillObject },
  walletLabel: { color: '#fff', fontSize: s(14), fontWeight: '500' },
  walletBalance: { color: '#fdd750', fontSize: s(20), fontWeight: '900' },
  walletActions: { flexDirection: 'row', gap: s(8) },
  walletPrimary: { width: s(70), height: s(28), borderRadius: s(6), backgroundColor: '#ec9f1a', alignItems: 'center', justifyContent: 'center' },
  walletPrimaryText: { color: '#5b2b00', fontSize: s(12), fontWeight: '600' },
  walletOutline: { width: s(70), height: s(28), borderRadius: s(6), borderWidth: 1, borderColor: '#fcd959', alignItems: 'center', justifyContent: 'center' },
  walletOutlineText: { color: '#fcd959', fontSize: s(12), fontWeight: '600' },
  couponRow: { minHeight: s(64), borderRadius: s(8), backgroundColor: colors.surface, padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) },
  couponIcon: { width: s(36), height: s(36) },
  billTabs: { flexDirection: 'row', gap: s(8) },
  billTab: { flex: 1, height: s(36), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  billTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  amountDown: { color: '#ff493d' },
  section: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  taskText: { flex: 1, gap: s(2) },
});
