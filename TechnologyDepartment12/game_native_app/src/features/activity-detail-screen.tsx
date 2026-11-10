// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

import { getLevelList } from '@/api/vip';
import {
  claimFirstRecharge,
  claimRebate,
  claimRescueFund,
  first_recharge_query,
  getActivityList,
  getRebate,
  getRescueFund,
} from '@/api/vip';
import { PageHeader, PageSkeleton, Screen } from '@/components/chrome';
import { readActivity } from '@/features/activity-cache';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const bigGift = require('../../assets/brand/welfare/sign-big-gift.png');
const giftIcon = require('../../assets/brand/welfare/sign-gift-icon.png');

const VIEW_TYPES = {
  FIRST_RECHARGE: 'basic',
  DAY_FIRST_RECHARGE: 'basic',
  RESCUE_FUND: 'periodic',
  REBATE: 'rebate',
  COMMUNITY: 'share',
  DISPLAY: 'display',
};

const unwrap = (result) => result?.data ?? result ?? null;

const parseJson = (value, fallback) => {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const bannerListOf = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter((item) => /^https?:\/\//i.test(item));
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = parseJson(trimmed, []);
    if (Array.isArray(parsed)) return bannerListOf(parsed);
    if (parsed && typeof parsed === 'object') return bannerListOf([parsed.url || parsed.src || parsed.img]);
  }
  return /^https?:\/\//i.test(trimmed) ? [trimmed] : [];
};

const normalizeTarget = (value) => {
  const target = String(value || '').trim().toLowerCase();
  return ['all', 'new', 'vip'].includes(target) ? target : '';
};

const remoteType = (value) => value === 'RESCUE_FUND' || value === 'REBATE' || value === 'FIRST_RECHARGE' || value === 'DAY_FIRST_RECHARGE';

const activityCodeOf = (item, queryType) =>
  String(item?.activityCode || item?.code || item?.originType || item?.type || queryType || '').trim().toUpperCase();

const formatCurrency = (value) => {
  const [whole, fraction] = Number(value || 0).toFixed(2).split('.');
  return `₹ ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
};

const formatDateRange = (startTime, endTime) => [startTime, endTime].filter(Boolean).join(' - ');

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(String(value).trim().replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
};

const hasRuleContent = (html) => String(html || '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .trim().length > 0;

const measureRules = `(function(){
  function send(){
    var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight);
    window.ReactNativeWebView.postMessage(String(Math.ceil(h)));
  }
  send();
  setTimeout(send,200);
  setTimeout(send,700);
})();
true;`;

const ruleDocument = (html) => {
  const raw = String(html || '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?(html|head|body)[^>]*>/gi, '');
  const body = /<(p|ul|ol|h3|h4|div)\b/i.test(raw) ? raw : `<p>${raw}</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
html,body{margin:0;padding:0;background:transparent;color:#a8adbd;font-family:sans-serif}
img{max-width:100%;height:auto}a{color:#b7ee52}
h3,h4{margin:0;padding:16px 16px 0;border:1px solid #3a414d;border-bottom:0;border-radius:12px 12px 0 0;background:#1b2027;color:#f5f6fa;font-size:14px;font-weight:700}
h3+p,h4+p{margin:0 0 12px;padding:6px 16px 16px;border:1px solid #3a414d;border-top:0;border-radius:0 0 12px 12px;background:#1b2027}
p{margin:0 0 12px;padding:16px;border:1px solid #3a414d;border-radius:12px;background:#1b2027;color:#a8adbd;font-size:13px;line-height:1.55}
p:last-child,ul:last-child,ol:last-child{margin-bottom:0}
ul,ol{margin:0 0 12px;padding:16px 16px 16px 32px;border:1px solid #3a414d;border-radius:12px;background:#1b2027;color:#a8adbd;font-size:13px;line-height:1.55}
li{margin-bottom:6px}
strong,b{color:#f5f6fa}
</style>
</head><body>${body}</body></html>`;
};

const presentationOf = (payload, context) => {
  const banners = bannerListOf(payload?.bannerUrl).concat(bannerListOf(payload?.bannerUrls), bannerListOf(context?.banners), bannerListOf(context?.image));
  const startTime = context?.startTime || payload?.startTime || '';
  const endTime = context?.endTime || payload?.endTime || '';
  return {
    image: banners[0] || '',
    title: payload?.activityName || context?.activityName || context?.name || context?.title || '',
    date: formatDateRange(startTime, endTime),
    userTarget: normalizeTarget(payload?.userTarget || context?.userTarget || context?.extJson?.userTarget),
    startTime,
    endTime,
    vipConfigs: Array.isArray(payload?.vipConfigs) ? payload.vipConfigs : Array.isArray(context?.vipConfigs) ? context.vipConfigs : [],
    ruleHtml: payload?.ruleHtml || context?.ruleHtml || '',
  };
};

const normalizeDirect = (item = {}) => {
  const extJson = parseJson(item.extJson, {});
  return {
    ...item,
    image: bannerListOf(item.bannerUrls)[0] || bannerListOf(item.image)[0] || '',
    extJson,
    userTarget: normalizeTarget(item.userTarget || extJson.userTarget),
    vipConfigs: Array.isArray(item.vipConfigs) ? item.vipConfigs : [],
    ruleHtml: item.ruleHtml || '',
    startTime: item.startTime || '',
    endTime: item.endTime || '',
    activityName: item.activityName || item.title || item.name || '',
  };
};

export function ActivityDetailScreen() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const userInfo = useUserStore((state) => state.userInfo);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const refreshPending = useUserStore((state) => state.fetchWelfarePendingStatus);
  const appConfig = useSystemStore((state) => state.appConfig);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const [context, setContext] = useState(() => readActivity(id));
  const [detail, setDetail] = useState(null);
  const [code, setCode] = useState(() => activityCodeOf(readActivity(id), type));
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [levels, setLevels] = useState([]);
  const [ruleHeight, setRuleHeight] = useState(0);
  const rulesRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setDetail(null);
    let current = readActivity(id);
    if (!current || String(current.id) !== String(id)) {
      const result = await getActivityList({ id, page: 1, pageSize: 100 }).catch(() => null);
      const records = Array.isArray(unwrap(result)?.records) ? unwrap(result).records : [];
      const matched = records.find((item) => String(item?.id) === String(id));
      current = matched ? normalizeDirect(matched) : null;
    } else {
      current = normalizeDirect(current);
    }
    setContext(current);
    const nextCode = activityCodeOf(current, type);
    setCode(nextCode);
    try {
      if (nextCode === 'RESCUE_FUND') setDetail(normalizeRescue(unwrap(await getRescueFund({ activityCode: 'RESCUE_FUND', id }, { showLoading: false })), current, t));
      else if (nextCode === 'REBATE') setDetail(normalizeRebate(unwrap(await getRebate({ activityCode: 'REBATE', id }, { showLoading: false })), current, t));
      else if (nextCode === 'FIRST_RECHARGE' || nextCode === 'DAY_FIRST_RECHARGE') {
        setDetail(normalizeFirst(unwrap(await first_recharge_query({ activityCode: nextCode, id }, { showLoading: false })), current, nextCode, id, t));
      } else setDetail(null);
    } catch (error) {
      setDetail(null);
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!appConfig) loadAppConfig().catch(() => {});
    if (isLoggedIn) fetchUserInfo().catch(() => {});
    getLevelList().then((result) => {
      const list = Array.isArray(result) ? result : result?.data || result?.list || [];
      setLevels(Array.isArray(list) ? list : []);
    }).catch(() => setLevels([]));
  }, [id, type, isLoggedIn]);

  const fallback = normalizeServer(context, type, t);
  const activity = detail || { ...fallback, type: remoteType(code) ? 'display' : fallback.type };
  const showRules = hasRuleContent(activity.htmlContent);
  useEffect(() => {
    setRuleHeight(0);
  }, [activity.htmlContent]);
  const shareSource = appConfig?.index_menu?.index_contact_us;
  const shareList = Array.isArray(shareSource?.list) ? shareSource.list : shareSource?.[0]?.list || [];
  const shareItems = [...shareList]
    .sort((left, right) => Number(left?.sort || 0) - Number(right?.sort || 0))
    .map((item, index) => ({ id: item?.id || item?.name || index, label: item?.name || '', icon: item?.icon_active || item?.icon || '', url: item?.url || '' }))
    .filter((item) => item.icon);
  const vipLevels = (Array.isArray(activity.vipConfigs) ? activity.vipConfigs : [])
    .map((config) => Number(levels.find((item) => Number(item.id) === Number(config?.vipId))?.number || 0))
    .filter((level) => level > 0)
    .sort((left, right) => left - right);
  const userTargetLabel = (() => {
    const target = normalizeTarget(activity.userTarget);
    if (target !== 'vip') return target ? t(`welfareActivityDetail.userTargets.${target}`) : '';
    if (!vipLevels.length) return t('welfareActivityDetail.userTargets.vip');
    if (vipLevels.length === 1) return `VIP${vipLevels[0]}`;
    const continuous = vipLevels.every((level, index) => index === 0 || level === vipLevels[index - 1] + 1);
    return continuous ? `VIP${vipLevels[0]}-VIP${vipLevels[vipLevels.length - 1]}` : vipLevels.map((level) => `VIP${level}`).join(', ');
  })();
  const withinTime = (() => {
    const start = parseDate(activity.startTime);
    const end = parseDate(activity.endTime);
    const now = new Date();
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  })();
  const eligible = (() => {
    const target = normalizeTarget(activity.userTarget);
    if (!target || target === 'all') return true;
    if (!isLoggedIn) return false;
    if (target === 'new') {
      const created = parseDate(userInfo?.created_at);
      if (!created) return false;
      return (Date.now() - created.getTime()) / 86400000 <= 7;
    }
    if (target === 'vip') {
      const level = Number(userInfo?.level || userInfo?.vipLevel || 0);
      if (level <= 0) return false;
      if (!vipLevels.length) return true;
      return vipLevels.includes(level);
    }
    return true;
  })();
  const rechargeAllowed = withinTime && eligible;
  const rechargeMessage = !withinTime
    ? t('welfareActivityDetail.rechargeBlockedActivityTime')
    : t('welfareActivityDetail.rechargeBlockedUserTarget');

  const claim = async () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (claiming || !activity.canClaim) return;
    setClaiming(true);
    try {
      if (code === 'RESCUE_FUND') await claimRescueFund({ activityCode: 'RESCUE_FUND', id }, { showLoading: false });
      else if (code === 'REBATE') await claimRebate({ activityCode: 'REBATE', id }, { showLoading: false });
      else await claimFirstRecharge({ activityCode: code, id, recordId: activity.firstRechargeTodayReward?.recordId }, { showLoading: false });
      toast.success(t('welfareActivityDetail.claimSuccess'));
      refreshPending({ force: true }).catch(() => {});
      await load();
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setClaiming(false);
    }
  };

  const goRecharge = () => {
    if (!rechargeAllowed) {
      toast.warning(rechargeMessage);
      return;
    }
    router.push('/recharge');
  };

  const remote = remoteType(code || activityCodeOf(context, type));
  const rebateDisabled = claiming || (isLoggedIn && !activity.canClaim);

  return (
    <Screen>
      <PageHeader title={t('welfareActivityDetail.title')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {activity.image ? <Image source={{ uri: activity.image }} style={styles.heroImage} contentFit="cover" cachePolicy="memory-disk" /> : <View style={styles.heroImage} />}
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{activity.title}</Text>
            {activity.date ? <Text style={styles.heroMeta}>{t('welfareActivityDetail.activityTime')}：{activity.date}</Text> : null}
            {userTargetLabel ? <Text style={styles.heroMeta}>{t('welfareActivityDetail.userTarget')}：{userTargetLabel}</Text> : null}
            {activity.type === 'rebate' && activity.rebateRate ? <Text style={styles.heroMeta}>{activity.rebateRate}</Text> : null}
          </View>
        </View>
        {loading && remote ? <PageSkeleton /> : (
          <View style={styles.body}>
            {activity.type === 'periodic' ? (
              <>
                <Text style={styles.section}>{t('welfareActivityDetail.settlementStatusTitle')}</Text>
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{activity.tomorrowEstimateTitle}</Text>
                  <Text style={styles.valueRow}>
                    <Text style={styles.value}>{activity.tomorrowEstimateAmount}</Text>
                    <Text style={styles.note}>  · {activity.tomorrowEstimateNote}</Text>
                  </Text>
                  <Text style={[styles.status, activity.tomorrowRewardValue > 0 ? styles.qualified : styles.pending]}>
                    {activity.tomorrowRewardValue > 0 ? t('welfareActivityDetail.status.reached') : t('welfareActivityDetail.status.calculating')}
                  </Text>
                </View>
                <View style={styles.panel}>
                  <View style={styles.between}>
                    <Text style={styles.panelTitle}>{t('welfareActivityDetail.netLossToday')}</Text>
                    <Text style={styles.value}>{formatCurrency(activity.todayNetLossValue)}</Text>
                  </View>
                  <Text style={[styles.status, activity.reachedThreshold ? styles.qualified : styles.pending]}>{activity.progressStatus}</Text>
                  <View style={styles.track}><View style={[styles.fill, { width: `${activity.progressValue || 0}%` }]} /></View>
                  <Text style={styles.foot}>{activity.progressLabel}</Text>
                </View>
                {isLoggedIn ? (
                  <View style={styles.panel}>
                    <Text style={styles.panelTitle}>{activity.currentEstimateTitle}</Text>
                    <Text style={styles.estimate}>{activity.currentEstimateAmount}</Text>
                    <Text style={styles.hint}>{activity.currentEstimateHint}</Text>
                  </View>
                ) : null}
                <Pressable disabled={!activity.canClaim || claiming} style={[styles.button, activity.canClaim && !claiming && styles.buttonOn]} onPress={claim}>
                  <Text style={[styles.buttonText, activity.canClaim && !claiming && styles.buttonTextOn]}>
                    {claiming ? t('welfareActivityDetail.claiming') : activity.actionText}
                  </Text>
                </Pressable>
              </>
            ) : null}
            {activity.type === 'rebate' ? (
              <>
                <Text style={styles.section}>{t('welfareActivityDetail.todayDataTitle')}</Text>
                {isLoggedIn ? activity.metrics.map((metric) => (
                  <View key={metric.label} style={[styles.panel, styles.between]}>
                    <Text style={styles.panelTitle}>{metric.label}</Text>
                    <Text style={[styles.value, metric.accent && styles.qualified]}>{metric.value}</Text>
                  </View>
                )) : null}
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{t('welfareActivityDetail.automaticSettlement')}</Text>
                  <Text style={styles.hint}>{activity.settlementHint}</Text>
                </View>
                <Pressable disabled={rebateDisabled} style={[styles.button, !rebateDisabled && styles.buttonOn]} onPress={claim}>
                  <Text style={[styles.buttonText, !rebateDisabled && styles.buttonTextOn]}>{claiming ? t('welfareActivityDetail.claiming') : activity.actionText}</Text>
                </Pressable>
              </>
            ) : null}
            {activity.type === 'share' && shareItems.length ? (
              <>
                <Text style={styles.section}>{t('welfareActivityDetail.socialChannel')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shares}>
                  {shareItems.map((item) => (
                    <Pressable key={item.id} style={styles.share} onPress={() => item.url && Linking.openURL(item.url).catch(() => {})}>
                      <Image source={{ uri: item.icon }} style={styles.shareIcon} contentFit="contain" />
                      <Text style={styles.shareLabel}>{item.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={styles.hint}>{t('welfareActivityDetail.sharePrompt')}</Text>
              </>
            ) : null}
            {activity.type === 'basic' && activity.hasFirstRecharge ? (
              <>
                <Text style={styles.section}>{t('welfareActivityDetail.firstRecharge.daysReward', { days: activity.totalDays || 7 })}</Text>
                <View style={styles.summary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{formatCurrency(activity.rechargeAmount)}</Text>
                    <Text style={styles.panelTitle}>{t('welfareActivityDetail.firstRecharge.rechargeAmount')}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{formatCurrency(activity.totalRewardAmount)}</Text>
                    <Text style={styles.panelTitle}>{t('welfareActivityDetail.firstRecharge.giftAmount')}</Text>
                  </View>
                </View>
                <View style={styles.rewardGrid}>
                  {activity.rewardItems.map((reward) => (
                    <View key={reward.day} style={[styles.rewardCard, reward.isToday && styles.rewardToday, (reward.isClaimed || reward.isExpired) && styles.rewardDim]}>
                      <Text style={[styles.day, reward.isToday && styles.qualified]}>{reward.day}</Text>
                      {reward.day === 1 ? <Image source={bigGift} style={styles.bigGift} contentFit="contain" /> : <Image source={giftIcon} style={styles.smallGift} contentFit="contain" />}
                      <Text style={styles.panelTitle}>
                        {reward.isClaimed ? t('welfareActivityDetail.firstRecharge.claimed') : reward.isToday ? t('welfareActivityDetail.firstRecharge.claimable') : t('welfareActivityDetail.firstRecharge.pendingClaim')}
                      </Text>
                      <Text style={styles.value}>{reward.day !== 1 && reward.isClaimed ? t('welfareActivityDetail.firstRecharge.claimed') : formatCurrency(reward.rewardAmount)}</Text>
                    </View>
                  ))}
                </View>
                <Pressable disabled={!activity.canClaim || claiming} style={[styles.button, activity.canClaim && !claiming && styles.buttonOn]} onPress={claim}>
                  <Text style={[styles.buttonText, activity.canClaim && !claiming && styles.buttonTextOn]}>
                    {claiming ? t('welfareActivityDetail.claiming') : activity.firstRechargeActionText}
                  </Text>
                </Pressable>
              </>
            ) : null}
            {activity.type === 'basic' && !activity.hasFirstRecharge ? (
              <>
                <Text style={styles.section}>{rechargeAllowed ? t('welfareActivityDetail.currentRewardTitle') : t('welfareActivityDetail.todayEligibilityTitle')}</Text>
                {activity.ctaHint ? <Text style={styles.hint}>{activity.ctaHint}</Text> : null}
                <Pressable disabled={!rechargeAllowed} style={[styles.button, rechargeAllowed && styles.buttonOn]} onPress={goRecharge}>
                  <Text style={[styles.buttonText, rechargeAllowed && styles.buttonTextOn]}>
                    {rechargeAllowed ? t('welfareActivityDetail.actions.goRecharge') : t('welfareActivityDetail.actions.eligibilityExpired')}
                  </Text>
                </Pressable>
                {!rechargeAllowed ? <Text style={styles.hint}>{rechargeMessage}</Text> : null}
              </>
            ) : null}
            {showRules ? (
              <>
                <Text style={styles.section}>{activity.ruleTitle || t('welfareActivityDetail.ruleTitle')}</Text>
                <WebView
                  ref={rulesRef}
                  originWhitelist={['*']}
                  source={{ html: ruleDocument(activity.htmlContent) }}
                  style={[styles.rules, { height: ruleHeight }]}
                  scrollEnabled={false}
                  nestedScrollEnabled={false}
                  textZoom={100}
                  injectedJavaScript={measureRules}
                  setSupportMultipleWindows={false}
                  showsVerticalScrollIndicator={false}
                  onLoadEnd={() => rulesRef.current?.injectJavaScript(measureRules)}
                  onMessage={(event) => {
                    const next = Math.ceil(Number(event.nativeEvent.data));
                    if (next > 0) setRuleHeight(next);
                  }}
                />
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const normalizeRescue = (payload, context, t) => {
  if (!payload) return null;
  const view = presentationOf(payload, context);
  const minThreshold = Number(payload.minThreshold || 0);
  const todayNetLoss = Math.abs(Number(payload.todayNetLoss || 0));
  const yesterdayNetLoss = Math.abs(Number(payload.yesterdayNetLoss || 0));
  const yesterdayRewardAmount = Number(payload.yesterdayRewardAmount || 0);
  const tomorrowRewardAmount = Number(payload.estimatedRewardAmount || 0);
  const reachedThreshold = minThreshold > 0 ? todayNetLoss >= minThreshold : todayNetLoss > 0;
  const canClaim = payload.yesterdayClaimStatus === 'PENDING' && yesterdayRewardAmount > 0;
  return {
    ...view,
    type: 'periodic',
    htmlContent: view.ruleHtml,
    ruleTitle: t('welfareActivityDetail.ruleTitle'),
    tomorrowEstimateTitle: t('welfareActivityDetail.tomorrowClaimTitle'),
    tomorrowEstimateAmount: formatCurrency(tomorrowRewardAmount),
    tomorrowEstimateNote: tomorrowRewardAmount > 0 ? t('welfareActivityDetail.tomorrowRewardScheduled') : t('welfareActivityDetail.tomorrowRewardPending'),
    tomorrowRewardValue: tomorrowRewardAmount,
    currentEstimateTitle: t('welfareActivityDetail.currentClaimTitle'),
    currentEstimateAmount: formatCurrency(yesterdayRewardAmount),
    currentEstimateHint: `${t('welfareActivityDetail.basedOnYesterdayLoss')}：${formatCurrency(yesterdayNetLoss)}`,
    todayNetLossValue: todayNetLoss,
    progressLabel: `${t('welfareActivityDetail.minimumLossThreshold')}：${formatCurrency(minThreshold)}`,
    progressStatus: reachedThreshold ? t('welfareActivityDetail.status.reached') : t('welfareActivityDetail.status.notReached'),
    progressValue: minThreshold > 0 ? Math.min((todayNetLoss / minThreshold) * 100, 100) : 0,
    reachedThreshold,
    actionText: canClaim ? t('welfareActivityDetail.actions.claimReward') : t('welfareActivityDetail.actions.notEligible'),
    canClaim,
  };
};

const normalizeRebate = (payload, context, t) => {
  if (!payload) return null;
  const view = presentationOf(payload, context);
  const ratio = Number(payload.ratio || 0);
  const pending = Number(payload.pendingRewardAmount || 0);
  return {
    ...view,
    type: 'rebate',
    htmlContent: view.ruleHtml,
    ruleTitle: t('welfareActivityDetail.ruleTitle'),
    rebateRate: ratio ? `${t('welfareActivityDetail.currentRebateRate')}：${ratio}%` : '',
    settlementHint: t('welfareActivityDetail.settlementHint'),
    actionText: pending > 0 ? t('welfareActivityDetail.actions.claim') : t('welfareActivityDetail.actions.noReward'),
    canClaim: pending > 0,
    metrics: [
      { label: t('welfareActivityDetail.metrics.todayTotalTurnover'), value: formatCurrency(Number(payload.dayValidBet ?? payload.todayValidBet ?? 0)) },
      { label: t('welfareActivityDetail.metrics.rebateToCollect'), value: formatCurrency(pending), accent: true },
    ],
  };
};

const normalizeFirst = (payload, context, activityCode, id, t) => {
  if (!payload) return null;
  const view = presentationOf(payload, context);
  const today = todayKey();
  const rewardItems = (Array.isArray(payload.rewardItems) ? payload.rewardItems : []).map((item) => {
    const validDate = item?.validDate ? String(item.validDate).slice(0, 10) : '';
    const isToday = validDate === today;
    return {
      day: Number(item?.dayNum || 0),
      rewardAmount: Number(item?.rewardAmount || 0),
      recordId: item?.recordId ?? null,
      isToday,
      isClaimed: item?.claimStatus === 'CLAIMED',
      isExpired: item?.claimStatus === 'EXPIRED',
      canClaimToday: isToday && item?.claimStatus === 'PENDING',
    };
  });
  const todayReward = rewardItems.find((item) => item.isToday) || null;
  return {
    ...view,
    type: 'basic',
    htmlContent: view.ruleHtml,
    ruleTitle: t('welfareActivityDetail.ruleTitle'),
    hasFirstRecharge: Number(payload.rechargeAmount || 0) > 0,
    rechargeAmount: Number(payload.rechargeAmount || 0),
    totalRewardAmount: Number(payload.totalRewardAmount || 0),
    totalDays: Number(payload.totalDays || rewardItems.length || 0),
    rewardItems,
    firstRechargeTodayReward: todayReward,
    firstRechargeActionText: todayReward?.isClaimed
      ? t('welfareActivityDetail.firstRecharge.todayClaimed')
      : todayReward?.canClaimToday
        ? t('welfareActivityDetail.actions.claimReward')
        : t('welfareActivityDetail.firstRecharge.claimEnded'),
    canClaim: Boolean(todayReward?.canClaimToday),
    ctaHint: '',
    id: payload.activityCode || id,
    originType: activityCode,
  };
};

const normalizeServer = (item, queryType, t) => {
  const current = item ? normalizeDirect(item) : {};
  const type = activityCodeOf(current, queryType);
  const viewType = VIEW_TYPES[type] || 'display';
  const bonusRatio = Number(current.bonusRatio || current.extJson?.bonusRatio || 0);
  return {
    image: current.image || '',
    title: current.activityName || '',
    date: formatDateRange(current.startTime, current.endTime),
    userTarget: current.userTarget || '',
    startTime: current.startTime || '',
    endTime: current.endTime || '',
    vipConfigs: current.vipConfigs || [],
    type: viewType,
    htmlContent: current.ruleHtml || '',
    ruleTitle: t('welfareActivityDetail.ruleTitle'),
    ctaHint: bonusRatio ? `${t('welfareActivityDetail.metrics.rewardRatio')} ${bonusRatio}%` : '',
    hasFirstRecharge: false,
    canClaim: false,
    rewardItems: [],
    metrics: [],
  };
};

const styles = StyleSheet.create({
  content: { padding: s(16), gap: s(20), paddingBottom: s(28) },
  hero: { overflow: 'hidden', borderRadius: s(12), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  heroImage: { width: '100%', aspectRatio: 750 / 340, backgroundColor: colors.surface },
  heroCopy: { position: 'absolute', left: s(20), right: s(20), bottom: s(16) },
  heroTitle: { color: '#fff', fontSize: s(26), fontWeight: '800', lineHeight: s(32), textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12 },
  heroMeta: { marginTop: s(4), color: '#a8adbd', fontSize: s(12), lineHeight: s(16) },
  body: { gap: s(12) },
  section: { marginTop: s(8), color: colors.text, fontSize: s(15), fontWeight: '700' },
  panel: { padding: s(16), borderRadius: s(12), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: s(8) },
  panelTitle: { color: colors.muted, fontSize: s(14) },
  valueRow: { marginTop: s(2) },
  value: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  note: { color: colors.muted, fontSize: s(13) },
  estimate: { color: colors.text, fontSize: s(22), fontWeight: '700' },
  hint: { color: colors.muted, fontSize: s(13), lineHeight: s(18) },
  foot: { color: colors.muted, fontSize: s(13) },
  status: { fontSize: s(13), fontWeight: '600' },
  qualified: { color: colors.accent },
  pending: { color: '#e7c48d' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(12) },
  track: { height: s(8), borderRadius: s(8), backgroundColor: '#292f38', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  button: { height: s(50), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: '#292f38', alignItems: 'center', justifyContent: 'center' },
  buttonOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  buttonText: { color: '#747b89', fontSize: s(15), fontWeight: '700' },
  buttonTextOn: { color: colors.accentInk },
  shares: { gap: s(10) },
  share: { width: s(96), alignItems: 'center', gap: s(8), paddingVertical: s(14), paddingHorizontal: s(8), borderRadius: s(10), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  shareIcon: { width: s(40), height: s(40) },
  shareLabel: { color: colors.muted, fontSize: s(13), textAlign: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', paddingVertical: s(14), paddingHorizontal: s(16), borderRadius: s(12), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  summaryItem: { flex: 1, alignItems: 'center', gap: s(4) },
  summaryValue: { color: colors.accent, fontSize: s(18), fontWeight: '700' },
  divider: { width: 1, height: s(32), backgroundColor: colors.line },
  rewardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(10) },
  rewardCard: { width: '48%', minHeight: s(140), padding: s(14), borderRadius: s(12), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: s(8) },
  rewardToday: { borderColor: colors.accent },
  rewardDim: { opacity: 0.6 },
  day: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  bigGift: { width: s(72), height: s(72) },
  smallGift: { width: s(36), height: s(36) },
  rules: { backgroundColor: 'transparent' },
});
