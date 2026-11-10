// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { get_content_list } from '@/api/common';
import {
  claimRedeem,
  claimStageSignDailyReward,
  claimStageSignMilestoneReward,
  claimTask,
  getActivityList,
  getStageSignInfo,
  getTaskList,
} from '@/api/vip';
import { BottomSheet, PageSkeleton, Screen } from '@/components/chrome';
import { rememberActivity } from '@/features/activity-cache';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const gift = require('../../assets/brand/welfare/rewards-masthead-gift.png');
const calendar = require('../../assets/brand/welfare/daily-check-in-calendar.png');
const coin = require('../../assets/brand/welfare/week_coin_icon.png');
const signInfo = require('../../assets/brand/welfare/sign-rule-info.png');
const redeemBanner = require('../../assets/brand/welfare/redeem_banner.webp');
const redeemGiftIcon = require('../../assets/brand/welfare/redeem_input_icon.webp');

const unwrap = (result) => result?.data ?? result ?? null;

const TABS = [
  ['welfare', 'welfareCenter.tabWelfare'],
  ['activity', 'welfareCenter.tabActivity'],
  ['vip', 'VIP'],
  ['redeem', 'welfareCenter.tabRedeem'],
];

const SIGN_STATUS = {
  CLAIMABLE: 'current',
  SIGNED: 'signed',
  MISSED: 'missed',
  EXPIRED: 'missed',
  LOCKED: 'upcoming',
  UNAVAILABLE: 'upcoming',
};

const formatSignDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '--' : `${date.getMonth() + 1}.${date.getDate()}`;
};

const formatReward = (value) => {
  const amount = Number(value || 0);
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
};

const LIMITED_ACTIVITY_TYPES = ['FIRST_RECHARGE', 'DAY_FIRST_RECHARGE', 'RESCUE_FUND'];

const parseJson = (value, fallback) => {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeActivity = (item = {}) => {
  const bannerList = parseJson(item.bannerUrls, []);
  const extJson = parseJson(item.extJson, {});
  const banners = Array.isArray(bannerList) ? bannerList : [];
  const target = String(item.userTarget || extJson.userTarget || '').trim().toLowerCase();
  return {
    ...item,
    id: item.id,
    code: item.activityCode || item.type || '',
    activityName: item.activityName || item.title || '',
    image: banners[0] || '',
    type: item.type || '',
    userTarget: ['all', 'new', 'vip'].includes(target) ? target : 'all',
    bonusRatio: Number(item.bonusRatio || extJson.bonusRatio || 0),
    maxBonus: Number(item.maxBonus || extJson.maxBonus || 0),
    skipUrl: item.skipUrl || item.skip_url || extJson.skipUrl || '',
    hasPending: Boolean(item.hasPending),
    canClaimReward: Boolean(item.canClaimReward),
  };
};

const activitySubtitle = (activity, fallback) => {
  if (activity.bonusRatio > 0) return `Bonus Up To ${activity.bonusRatio}%`;
  if (activity.maxBonus > 0) return `Bonus Up To ₹${activity.maxBonus}`;
  return fallback;
};

const ruleHtml = (html) => `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>body{margin:0;padding:8px 4px 16px;background:#1b2027;color:#a8adbd;font-family:sans-serif;font-size:14px;line-height:1.6}a{color:#b7ee52}img{max-width:100%}</style>
</head><body>${html || ''}</body></html>`;

export function WelfareScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const refreshPending = useUserStore((state) => state.fetchWelfarePendingStatus);
  const appConfig = useSystemStore((state) => state.appConfig);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const [tab, setTab] = useState('welfare');
  const [ready, setReady] = useState(false);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sign, setSign] = useState(null);
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [claimingId, setClaimingId] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [signRule, setSignRule] = useState('');
  const [congrats, setCongrats] = useState(null);
  const seenLogin = useRef(isLoggedIn);
  const bodyRef = useRef(null);
  const selectTab = (next) => {
    setTab(next);
    bodyRef.current?.scrollTo({ y: 0, animated: false });
  };

  const load = useCallback(() => {
    Promise.all([
      getActivityList({ page: 1, pageSize: 10 }).catch(() => []),
      getTaskList({}, { showLoading: false }).catch(() => []),
      getStageSignInfo({}, { showLoading: false }).catch(() => null),
    ]).then(([activityResult, taskResult, signResult]) => {
      const activityBody = unwrap(activityResult);
      const records = Array.isArray(activityBody?.records) ? activityBody.records : Array.isArray(activityBody) ? activityBody : [];
      setActivities(records.map(normalizeActivity));
      const taskBody = unwrap(taskResult);
      const rawTasks = Array.isArray(taskBody) ? taskBody : [];
      setTasks(rawTasks.map((task) => ({ ...task, completeStatus: Number(task.completeStatus ?? 0) })));
      setSign(unwrap(signResult));
      setReady(true);
    });
    refreshPending({ force: true }).catch(() => {});
  }, [refreshPending]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  useEffect(() => {
    if (!appConfig) loadAppConfig().catch(() => {});
  }, [appConfig, loadAppConfig]);

  useEffect(() => {
    if (seenLogin.current === isLoggedIn) return;
    seenLogin.current = isLoggedIn;
    load();
  }, [isLoggedIn, load]);

  useEffect(() => {
    const next = String(search.tab || '');
    if (next === 'activity' || next === 'redeem' || next === 'welfare') selectTab(next);
  }, [search.tab]);

  const requireLogin = () => {
    if (isLoggedIn) return true;
    openLogin();
    return false;
  };

  const redeem = async () => {
    if (!code.trim() || redeeming) return;
    if (!requireLogin()) return;
    setRedeeming(true);
    try {
      await claimRedeem({ redeemCode: code.trim() }, { showLoading: false });
      toast.success(t('welfareCenter.redeemSuccess'));
      setCode('');
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setRedeeming(false);
    }
  };

  const claim = async (id, request, success = t('welfareActivityDetail.claimSuccess')) => {
    if (!requireLogin()) return;
    setClaimingId(id);
    try {
      await request();
      if (success) toast.success(success);
      load();
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setClaimingId('');
    }
  };

  const openRules = () => {
    setRulesOpen(true);
    if (signRule) return;
    get_content_list({ type: '1' })
      .then((response) => {
        const list = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : response?.list || [];
        setSignRule(list[0]?.content || '');
      })
      .catch(() => setSignRule(''));
  };

  const openActivity = (item) => {
    if (!item?.id) return;
    if (!requireLogin()) return;
    const skipUrl = String(item.skipUrl || '').trim();
    if (skipUrl) {
      openPath(skipUrl);
      return;
    }
    rememberActivity(item);
    const type = encodeURIComponent(item.type || '');
    router.push(type ? `/welfare-center/activity/${item.id}?type=${type}` : `/welfare-center/activity/${item.id}`);
  };

  const openPath = (url) => {
    const target = String(url || '').trim();
    if (!target) return;
    if (/^https?:\/\//i.test(target)) {
      Linking.openURL(target).catch(() => {});
      return;
    }
    const path = target.startsWith('/') ? target : `/${target}`;
    const [pathname, searchText = ''] = path.split('?');
    const query = Object.fromEntries(new URLSearchParams(searchText));
    if (pathname === '/welfare-center') {
      const next = String(query.tab || 'activity');
      selectTab(next === 'redeem' || next === 'welfare' ? next : 'activity');
      return;
    }
    if (Object.keys(query).length) router.push({ pathname, params: query });
    else router.push(pathname);
  };

  const openHot = (activity) => openPath(activity?.url || activity?.link);

  const dailyTasks = tasks.filter((task) => task.taskType !== 'WEEKLY');
  const days = Array.isArray(sign?.dailyRewards) ? sign.dailyRewards : [];
  const milestones = Array.isArray(sign?.milestoneRewards) ? sign.milestoneRewards : [];
  const totalSignCount = Number(sign?.totalSignCount || 0);
  const activeMilestone = milestones.find((item) => item.status === 'CLAIMABLE')
    || milestones.find((item) => item.status !== 'CLAIMED')
    || milestones[milestones.length - 1]
    || null;
  const milestoneState = (reward) => {
    if (reward.status === 'CLAIMED') return 'claimed';
    if (reward.status === 'CLAIMABLE') return 'claimable';
    if (reward.status === 'PROCESSING') return 'processing';
    return totalSignCount >= Number(reward.signCount || 0) ? 'reached' : 'locked';
  };
  const milestoneProgress = (() => {
    const count = milestones.length;
    if (!count) return 0;
    const targets = milestones.map((item) => Number(item.signCount || 0));
    const node = (index) => ((index + 0.5) / count) * 100;
    let reached = -1;
    milestones.forEach((item, index) => {
      const state = milestoneState(item);
      if (state === 'claimed' || state === 'reached' || state === 'claimable' || state === 'processing') reached = index;
    });
    const first = targets[0];
    const last = targets[count - 1];
    let pos = 0;
    if (last > 0 && totalSignCount >= last) pos = node(count - 1);
    else if (first <= 0 || totalSignCount <= first) pos = first > 0 ? (totalSignCount / first) * node(0) : 0;
    else {
      for (let index = 1; index < count; index += 1) {
        if (totalSignCount <= targets[index]) {
          const prev = targets[index - 1];
          const curr = targets[index];
          const ratio = curr > prev ? (totalSignCount - prev) / (curr - prev) : 1;
          pos = node(index - 1) + (node(index) - node(index - 1)) * ratio;
          break;
        }
      }
    }
    if (reached >= 0) pos = Math.max(pos, node(reached));
    const end = node(count - 1);
    return end <= 0 ? 0 : Math.min(Math.max((pos / end) * 100, 0), 100);
  })();
  const todayReward = (() => {
    const cycleDay = Number(sign?.cycleDay);
    if (cycleDay) {
      const byCycle = days.find((item) => Number(item.day) === cycleDay);
      if (byCycle) return byCycle;
    }
    return days.find((item) => item.status === 'CLAIMABLE')
      || (sign?.signedToday ? [...days].reverse().find((item) => item.status === 'SIGNED') : null)
      || null;
  })();
  const welfareClaimable = dailyTasks.some((task) => task.completeStatus === 1)
    || days.some((item) => item.status === 'CLAIMABLE')
    || Boolean(todayReward?.canClaimTaskReward || todayReward?.taskRewardStatus === 'CLAIMABLE')
    || Boolean(activeMilestone?.canClaim || activeMilestone?.status === 'CLAIMABLE');
  const activityClaimable = activities.some((item) => item.canClaimReward);
  const limitedActivities = activities.filter((item) => LIMITED_ACTIVITY_TYPES.includes(String(item.type || '').toUpperCase()));
  const popularActivitiesList = activities.filter((item) => !LIMITED_ACTIVITY_TYPES.includes(String(item.type || '').toUpperCase()));
  const hotActivities = (Array.isArray(appConfig?.index_menu?.index_popular_activities) ? appConfig.index_menu.index_popular_activities : [])
    .flatMap((menu) => (Array.isArray(menu?.list) ? menu.list : []))
    .filter((activity) => activity?.icon && Number(activity.status ?? 1) === 1)
    .sort((left, right) => Number(right?.sort || 0) - Number(left?.sort || 0));
  const milestoneLabel = activeMilestone?.status === 'CLAIMED'
    ? t('welfareCenter.task.claimed')
    : activeMilestone?.status === 'PROCESSING'
      ? t('common.loading')
      : t('welfareCenter.task.claim');

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + s(8) }]}>
        <Text style={styles.title}>{t('welfareCenter.title')}</Text>
        <ScrollView horizontal style={styles.tabs} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map(([key, label]) => {
            const dot = (key === 'welfare' && welfareClaimable) || (key === 'activity' && activityClaimable);
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [styles.tab, tab === key && styles.tabActive, pressed && styles.pressed]}
                onPress={() => (key === 'vip' ? router.push('/vip-center') : selectTab(key))}
              >
                <View>
                  <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{key === 'vip' ? 'VIP' : t(label)}</Text>
                  {dot ? <View style={styles.tabDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView ref={bodyRef} style={styles.body} contentContainerStyle={[styles.content, !ready && styles.contentLoading]}>
        {!ready ? <PageSkeleton /> : null}
        {ready && tab === 'welfare' ? (
          <>
            <View style={styles.masthead}>
              <View style={styles.mastheadCopy}>
                <Text style={styles.mastheadTitle}>{t('welfareCenter.rewardsMastheadTitle')}</Text>
                <Text style={styles.mastheadSub}>{t('welfareCenter.rewardsMastheadSubtitle')}</Text>
              </View>
              <Image source={gift} style={styles.gift} contentFit="contain" />
            </View>
            <Text style={styles.section}>{t('welfareCenter.dailyTasksTitle')}</Text>
            {dailyTasks.length ? dailyTasks.map((task, index) => {
              const taskId = task.taskId || `${task.taskType}-${task.taskCode}`;
              const id = String(taskId || index);
              const claimable = task.completeStatus === 1;
              const claimed = task.completeStatus === 2;
              const busy = claimingId === id;
              return (
                <View key={id} style={styles.task}>
                  <View style={styles.taskTitleRow}>
                    {task.logoUrl ? <Image source={{ uri: task.logoUrl }} style={styles.taskLogo} contentFit="contain" /> : null}
                    <Text style={styles.taskTitle} numberOfLines={2}>{task.taskName || task.name}</Text>
                  </View>
                  <Text style={styles.taskRemark}>{task.taskTarget || t('welfareCenter.task.remark')}</Text>
                  <Text style={styles.reward}>₹{formatReward(task.rewardAmount)}</Text>
                  <Pressable
                    disabled={!claimable || busy}
                    style={[styles.action, claimable && !busy && styles.actionOn]}
                    onPress={() => claim(id, () => claimTask({ taskId, taskCode: task.taskCode }, { showLoading: false }), t('welfareCenter.task.claimSuccess'))}
                  >
                    <Text style={[styles.actionText, claimable && styles.actionTextOn]}>
                      {claimingId === id ? t('welfareCenter.task.claiming') : claimed ? t('welfareCenter.task.claimed') : t('welfareCenter.task.claim')}
                    </Text>
                  </Pressable>
                </View>
              );
            }) : <Text style={styles.empty}>{t('welfareCenter.comingSoon')}</Text>}

            <View style={styles.checkTitle}>
              <View style={styles.checkTitleLeft}>
                <Text style={styles.section}>{t('welfareCenter.dailyCheckInTitle')}</Text>
                <Pressable onPress={openRules} hitSlop={s(8)}>
                  <Image source={signInfo} style={styles.info} contentFit="contain" />
                </Pressable>
              </View>
              <Image source={calendar} style={styles.calendar} contentFit="contain" />
            </View>
            <View style={styles.days}>
              {days.map((day) => {
                const status = SIGN_STATUS[String(day.status || '').toUpperCase()] || 'upcoming';
                return (
                  <View key={day.dailyRewardId || day.signDate} style={styles.day}>
                    <Image source={coin} style={styles.coin} contentFit="contain" />
                    <Text style={styles.dayDate}>{formatSignDate(day.signDate)}</Text>
                    <Text style={styles.dayAmount}>₹{formatReward(day.rewardValue)}</Text>
                    {status === 'missed' ? (
                      <View pointerEvents="none" style={styles.expiredWrap}>
                        <Text style={styles.expired}>{t('welfareCenter.checkInExpired')}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
            <Pressable
              disabled={!sign?.canSign || claimingId === 'sign'}
              style={[styles.action, sign?.canSign && styles.actionOn]}
              onPress={() => {
                const reward = days.find((item) => item.status === 'CLAIMABLE');
                if (!reward) return;
                claim('sign', async () => {
                  await claimStageSignDailyReward({ dailyRewardId: reward.dailyRewardId }, { showLoading: false });
                  const turnover = Number(reward.taskTurnoverTarget || 0);
                  const extra = Number(reward.taskRewardValue || 0);
                  setCongrats({
                    amount: formatReward(reward.rewardValue),
                    premium: turnover > 0 && extra > 0 ? { turnover: formatReward(turnover), reward: formatReward(extra) } : null,
                  });
                }, '');
              }}
            >
              <Text style={[styles.actionText, sign?.canSign && styles.actionTextOn]}>
                {claimingId === 'sign' ? t('common.loading') : t('welfareCenter.signNow')}
              </Text>
            </Pressable>

            <View style={styles.streak}>
              <Text style={styles.section}>{t('welfareCenter.consecutiveCheckInTitle')}</Text>
              <View style={styles.streakRow}>
                <Text style={styles.streakCopy}>
                  <Text style={styles.streakCount}>D{activeMilestone?.signCount || '--'}</Text>
                  {'  '}
                  {activeMilestone?.status === 'CLAIMABLE' ? t('welfareCenter.rewardUnlocked') : t('welfareCenter.rewardProgress')}
                </Text>
                <Pressable
                  disabled={!activeMilestone?.canClaim || claimingId === 'milestone'}
                  onPress={() => claim('milestone', () => claimStageSignMilestoneReward({ milestoneRewardId: activeMilestone.milestoneRewardId }, { showLoading: false }), t('welfareCenter.task.claimSuccess'))}
                >
                  <Text style={styles.streakClaim}>{claimingId === 'milestone' ? t('common.loading') : milestoneLabel}</Text>
                </Pressable>
              </View>
              <View style={styles.track}>
                <View style={[styles.trackFill, { width: `${milestoneProgress}%` }]} />
              </View>
              <View style={styles.milestoneRow}>
                {milestones.map((item) => {
                  const state = milestoneState(item);
                  const on = state === 'claimable' || state === 'processing';
                  return (
                    <View key={item.milestoneRewardId || item.signCount} style={styles.milestone}>
                      <Text style={[styles.milestoneAmount, on && styles.milestoneOn]}>₹{formatReward(item.rewardValue)}</Text>
                      <Text style={[styles.milestoneDay, on && styles.milestoneOn]}>D{item.signCount}</Text>
                    </View>
                  );
                })}
                {!milestones.length ? <Text style={styles.empty}>--</Text> : null}
              </View>
            </View>

            {hotActivities.length ? (
              <>
                <View style={styles.hotHead}>
                  <Text style={styles.section}>{t('welfareCenter.popularActivitiesTitle')}</Text>
                  <Pressable style={styles.viewAll} onPress={() => selectTab('activity')}>
                    <Text style={styles.viewAllText}>{t('welfareCenter.viewAll')}</Text>
                    <Text style={styles.viewAllText}>›</Text>
                  </Pressable>
                </View>
                <View style={styles.hotGrid}>
                  {hotActivities.map((activity, index) => (
                    <Pressable key={`${activity.name || 'hot'}-${index}`} style={styles.hotCard} onPress={() => openHot(activity)}>
                      <Image source={{ uri: activity.icon }} style={styles.hotImage} contentFit="contain" />
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : null}
        {ready && tab === 'activity' ? (
          <>
            <View style={styles.hotHead}>
              <Text style={styles.section}>{t('welfareCenter.limitedTimeActivitiesTitle')}</Text>
              <Text style={styles.ongoing}>{t('welfareCenter.limitedTimeActivitiesStatus')}</Text>
            </View>
            {limitedActivities.map((item) => (
              <Pressable key={item.id} style={({ pressed }) => [styles.activity, pressed && styles.pressed]} onPress={() => openActivity(item)}>
                {item.hasPending ? <View style={styles.pendingDot} /> : null}
                {item.image ? <Image source={{ uri: item.image }} style={styles.activityIcon} contentFit="contain" /> : <View style={styles.activityIcon} />}
                <View style={styles.taskText}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{item.activityName}</Text>
                  <Text style={styles.taskRemark} numberOfLines={1}>{activitySubtitle(item, t('welfareCenter.activityTitle'))}</Text>
                </View>
                {item.canClaimReward ? <Text style={styles.claimChip}>{t('welfareCenter.task.claim')}</Text> : null}
              </Pressable>
            ))}
            {popularActivitiesList.length ? <Text style={styles.section}>{t('welfareCenter.popularActivitiesTitle')}</Text> : null}
            {popularActivitiesList.map((item) => (
              <Pressable key={item.id} style={({ pressed }) => [styles.activity, pressed && styles.pressed]} onPress={() => openActivity(item)}>
                {item.hasPending ? <View style={styles.pendingDot} /> : null}
                {item.image ? <Image source={{ uri: item.image }} style={styles.activityIcon} contentFit="contain" /> : <View style={styles.activityIcon} />}
                <View style={styles.taskText}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{item.activityName}</Text>
                  <Text style={styles.taskRemark} numberOfLines={1}>{activitySubtitle(item, t('welfareCenter.activityTitle'))}</Text>
                </View>
                {item.canClaimReward ? <Text style={styles.claimChip}>{t('welfareCenter.task.claim')}</Text> : null}
              </Pressable>
            ))}
            {!activities.length ? <Text style={styles.empty}>{t('common.noData')}</Text> : null}
          </>
        ) : null}
        {ready && tab === 'redeem' ? (
          <View style={styles.redeem}>
            <Image source={redeemBanner} style={styles.redeemBanner} contentFit="cover" />
            <Text style={styles.redeemTitle}>{t('welfareCenter.redeemTitle')}</Text>
            <View style={styles.redeemInput}>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder={t('welfareCenter.redeemPlaceholder')}
                placeholderTextColor={colors.muted}
                autoCapitalize="characters"
                style={styles.redeemField}
              />
              <Image source={redeemGiftIcon} style={styles.redeemGift} contentFit="contain" />
            </View>
            <Pressable
              disabled={!code.trim() || redeeming}
              style={[styles.redeemButton, (!code.trim() || redeeming) && styles.redeemButtonOff]}
              onPress={redeem}>
              <Text style={styles.redeemButtonText}>{redeeming ? t('welfareCenter.redeeming') : t('welfareCenter.redeem')}</Text>
            </Pressable>
            <View style={styles.redeemTip}>
              <Text style={styles.redeemTipTitle}>{t('welfareCenter.tip')}：</Text>
              <Text style={styles.redeemTipText}>{t('welfareCenter.redeemTipCodeFormat')}</Text>
              <Text style={styles.redeemTipText}>{t('welfareCenter.redeemTipUseOnce')}</Text>
              <Text style={styles.redeemTipText}>{t('welfareCenter.redeemTipContactSupport')}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <Modal visible={Boolean(congrats)} transparent animationType="fade" onRequestClose={() => setCongrats(null)}>
        <Pressable style={styles.congratsMask} onPress={() => setCongrats(null)}>
          <Pressable style={styles.congratsCard} onPress={() => {}}>
            <Image source={coin} style={styles.congratsCoin} contentFit="contain" />
            <Text style={styles.congratsTitle}>{t('welfareCenter.checkInCongratsTitle')}</Text>
            <Text style={styles.congratsPrize}>₹{congrats?.amount}</Text>
            <Text style={styles.taskRemark}>{t('welfareCenter.checkInCongratsDesc')}</Text>
            {congrats?.premium ? (
              <>
                <Text style={styles.congratsMore}>{t('welfareCenter.checkInCongratsMore', congrats.premium)}</Text>
                <Text style={styles.taskRemark}>{t('welfareCenter.checkInCongratsGuide')}</Text>
                <Pressable style={[styles.action, styles.actionOn]} onPress={() => { setCongrats(null); router.push('/game-list'); }}>
                  <Text style={[styles.actionText, styles.actionTextOn]}>{t('welfareCenter.betNow')}</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
      <BottomSheet visible={rulesOpen} onClose={() => setRulesOpen(false)} cardStyle={styles.sheetCard}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>{t('welfareCenter.signRuleTitle')}</Text>
          <Pressable onPress={() => setRulesOpen(false)} hitSlop={s(8)}>
            <Text style={styles.sheetClose}>×</Text>
          </Pressable>
        </View>
        <WebView originWhitelist={['*']} source={{ html: ruleHtml(signRule) }} style={styles.ruleWeb} setSupportMultipleWindows={false} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.bg, paddingHorizontal: s(12), paddingBottom: s(8), gap: s(8) },
  body: { flex: 1 },
  content: { padding: s(12), gap: s(12), paddingBottom: s(28) },
  contentLoading: { flexGrow: 1 },
  title: { color: colors.text, fontSize: s(18), fontWeight: '700', textAlign: 'center' },
  tabs: { height: s(44), maxHeight: s(44), flexGrow: 0 },
  tabsContent: { height: s(44), gap: s(6), alignItems: 'center' },
  tab: { height: s(44), minWidth: s(72), paddingHorizontal: s(10), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: '600', fontSize: s(14) },
  tabTextActive: { color: colors.accentInk },
  tabDot: { position: 'absolute', top: -s(1), right: -s(7), width: s(6), height: s(6), borderRadius: s(3), backgroundColor: '#ff0000' },
  pressed: { opacity: 0.72 },
  masthead: { minHeight: s(96), borderRadius: s(8), paddingHorizontal: s(16), paddingVertical: s(12), flexDirection: 'row', alignItems: 'center', gap: s(12), backgroundImage: 'linear-gradient(90deg, #10281d 0%, #213e1b 100%)' },
  mastheadCopy: { flex: 1, gap: s(8) },
  mastheadTitle: { color: colors.text, fontSize: s(18), fontWeight: '700', lineHeight: s(24) },
  mastheadSub: { color: colors.muted, fontSize: s(12), lineHeight: s(16) },
  gift: { width: s(72), height: s(72) },
  section: { color: colors.text, fontSize: s(14), fontWeight: '700' },
  task: { position: 'relative', minHeight: s(120), borderRadius: s(6), backgroundColor: colors.surface, padding: s(12) },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center', gap: s(8), marginRight: s(76) },
  taskLogo: { width: s(28), height: s(28) },
  taskTitle: { flex: 1, color: colors.text, fontSize: s(13), fontWeight: '600' },
  taskRemark: { marginTop: s(10), color: colors.muted, fontSize: s(12), lineHeight: s(16) },
  reward: { position: 'absolute', top: s(12), right: s(12), color: colors.accent, fontSize: s(14), fontWeight: '700' },
  action: { height: s(50), marginTop: s(12), borderRadius: s(6), backgroundColor: '#292f38', alignItems: 'center', justifyContent: 'center' },
  actionOn: { backgroundColor: colors.accent, boxShadow: `0 ${s(2)}px 0 #4d661e` },
  actionText: { color: '#747b89', fontSize: s(14), fontWeight: '600' },
  actionTextOn: { color: colors.accentInk },
  empty: { color: colors.muted, fontSize: s(12), textAlign: 'center' },
  checkTitle: { minHeight: s(28), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: s(6), flex: 1 },
  info: { width: s(20), height: s(20) },
  calendar: { width: s(56), height: s(56) },
  days: { flexDirection: 'row', gap: s(6) },
  day: { flex: 1, minHeight: s(100), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingVertical: s(12), paddingHorizontal: s(2), gap: s(6), overflow: 'hidden' },
  coin: { width: s(36), height: s(36) },
  dayDate: { color: colors.muted, fontSize: s(12) },
  dayAmount: { color: colors.text, fontSize: s(13), fontWeight: '600' },
  expiredWrap: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  expired: { color: '#ff8a96', fontSize: s(9), fontWeight: '800', letterSpacing: 0.2, textTransform: 'uppercase', borderWidth: 1.5, borderColor: 'rgba(255,93,108,0.95)', backgroundColor: 'rgba(48,13,31,0.72)', borderRadius: s(3), paddingHorizontal: s(4), paddingVertical: s(1), transform: [{ rotate: '-32deg' }] },
  streak: { borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(12), gap: s(10) },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(12) },
  streakCopy: { flex: 1, color: colors.muted, fontSize: s(12) },
  streakCount: { color: colors.text, fontWeight: '700' },
  streakClaim: { color: colors.accent, fontSize: s(12), fontWeight: '700' },
  track: { height: s(6), borderRadius: s(6), backgroundColor: '#292f38', overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: colors.accent },
  milestoneRow: { flexDirection: 'row' },
  milestone: { flex: 1, alignItems: 'center', gap: s(4) },
  milestoneAmount: { color: colors.text, fontSize: s(14), fontWeight: '700' },
  milestoneDay: { color: colors.muted, fontSize: s(12) },
  milestoneOn: { color: colors.accent },
  hotHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: s(2) },
  viewAllText: { color: colors.muted, fontSize: s(12), fontWeight: '600' },
  hotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(10) },
  hotCard: { width: '48%', aspectRatio: 338 / 236.5, borderRadius: s(6), overflow: 'hidden', backgroundColor: '#06173d' },
  hotImage: { width: '100%', height: '100%' },
  activity: { position: 'relative', minHeight: s(74), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(12) },
  activityIcon: { width: s(50), height: s(50), borderRadius: s(8) },
  pendingDot: { position: 'absolute', top: s(8), right: s(8), width: s(6), height: s(6), borderRadius: s(3), backgroundColor: '#ff0000' },
  claimChip: { height: s(24), paddingHorizontal: s(10), borderRadius: s(12), backgroundColor: '#eba84c', color: '#412408', fontSize: s(12), fontWeight: '700', lineHeight: s(24), overflow: 'hidden' },
  ongoing: { color: colors.text, fontSize: s(12) },
  congratsMask: { flex: 1, backgroundColor: 'rgba(2,8,28,0.62)', alignItems: 'center', justifyContent: 'center', padding: s(24) },
  congratsCard: { width: '100%', maxWidth: s(300), borderRadius: s(12), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(20), alignItems: 'center', gap: s(8) },
  congratsCoin: { width: s(72), height: s(72) },
  congratsTitle: { color: colors.accent, fontSize: s(18), fontWeight: '700' },
  congratsPrize: { color: colors.text, fontSize: s(28), fontWeight: '700' },
  congratsMore: { color: colors.accent, fontSize: s(13), textAlign: 'center' },
  taskText: { flex: 1, gap: s(2) },
  redeem: { gap: s(15) },
  redeemBanner: { width: '100%', aspectRatio: 686 / 360, borderRadius: s(6) },
  redeemTitle: { color: colors.text, fontSize: s(12), fontWeight: '700' },
  redeemInput: { height: s(40), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: s(14), paddingHorizontal: s(12) },
  redeemField: { flex: 1, color: colors.text, fontSize: s(12), padding: 0 },
  redeemGift: { width: s(24), height: s(24) },
  redeemButton: { height: s(44), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 ${colors.accentShadow}` },
  redeemButtonOff: { opacity: 0.6 },
  redeemButtonText: { color: colors.accentInk, fontSize: s(13), fontWeight: '700' },
  redeemTip: { borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(16), gap: s(10) },
  redeemTipTitle: { color: colors.text, fontSize: s(12), fontWeight: '700' },
  redeemTipText: { color: colors.muted, fontSize: s(12), lineHeight: s(16) },
  sheetCard: { padding: s(16), gap: s(8), borderTopLeftRadius: s(16), borderTopRightRadius: s(16), backgroundColor: colors.surface },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  sheetClose: { color: colors.muted, fontSize: s(24), lineHeight: s(24) },
  ruleWeb: { height: s(320), backgroundColor: colors.surface },
});
