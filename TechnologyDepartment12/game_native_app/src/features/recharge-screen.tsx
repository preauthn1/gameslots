// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { AppState, FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { get_article_detail } from '@/api/common';
import { getRechargeGiftCoupons, getWelfareActivityDetail, payIn, payList } from '@/api/bankcard';
import { getActivityList } from '@/api/vip';
import { BottomSheet, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const AMOUNTS = [100, 200, 300, 500, 1000, 2000, 3000, 5000];
const NTH_CODE = 'NTH_RECHARGE_REWARD';
const BANNER_INTERVAL = 4000;
const BANNER_SPEED = 550;
const CHANNEL_PRESETS = [
  { img: require('../../assets/brand/recharge/phonepe.webp'), name: 'PhonePe' },
  { img: require('../../assets/brand/recharge/paytm.webp'), name: 'PAYTM' },
  { img: require('../../assets/brand/recharge/fast-apps.webp'), name: 'FAST APPS' },
  { img: require('../../assets/brand/recharge/qr-code.webp'), name: 'QR Code' },
];

const truncateAmount = (num) => {
  const value = Number(num);
  if (!Number.isFinite(value)) return '0.00';
  const factor = 100;
  const truncated = value >= 0 ? Math.floor(value * factor) / factor : Math.ceil(value * factor) / factor;
  return truncated.toFixed(2);
};

const unwrap = (result) => result?.data ?? result ?? null;

const normalizeActivityList = (result) => {
  const payload = unwrap(result) ?? {};
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.data?.records)) return payload.data.records;
  return [];
};

const parseActivityDate = (value) => {
  if (!value) return null;
  const parsed = new Date(String(value).trim().replace(' ', 'T'));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWithinTime = (detail) => {
  const start = parseActivityDate(detail?.startTime);
  const end = parseActivityDate(detail?.endTime);
  const now = new Date();
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
};

const isEligible = (detail, user) => {
  if (!isWithinTime(detail)) return false;
  const target = String(detail?.userTarget || 'all').trim().toLowerCase();
  if (target === 'all') return true;
  if (target === 'new') {
    const createdAt = user?.created_at;
    if (!createdAt) return false;
    const registered = new Date(String(createdAt).replace(' ', 'T'));
    if (Number.isNaN(registered.getTime())) return false;
    return (Date.now() - registered.getTime()) / 86400000 <= 7;
  }
  if (target === 'vip') {
    const level = Number(user?.level || 0);
    const levels = Array.isArray(detail?.vipNumbers)
      ? detail.vipNumbers.map(Number).filter((item) => Number.isFinite(item) && item > 0)
      : [];
    return !levels.length || levels.includes(level);
  }
  return true;
};

const findActivity = (list, code) =>
  list.find((item) => String(item?.activityCode || item?.type || '').toUpperCase() === code) || null;

const buildEligible = (list, code, detailResult, user) => {
  const detail = unwrap(detailResult);
  if (!code || !detail) return null;
  const listed = findActivity(list, code);
  const payload = {
    ...detail,
    listActivityId: listed?.id || detail.id || detail.activityId || '',
    startTime: listed?.startTime || detail.startTime,
    endTime: listed?.endTime || detail.endTime,
  };
  return isEligible(payload, user) ? payload : null;
};

const channelSettings = (activity, paymentId) => {
  if (!activity) return [];
  const channels = Array.isArray(activity.channelSettingList) ? activity.channelSettingList : [];
  const matched = channels.find((item) => Number(item?.channelId) === Number(paymentId)) || channels[0];
  const settingsOf = (channel) => (Array.isArray(channel?.firstRechargeSettings) ? channel.firstRechargeSettings : []);
  const selected = settingsOf(matched);
  if (selected.length) return selected;
  const all = channels.flatMap(settingsOf);
  if (all.length) return all;
  return [{ minVal: activity.minThreshold, maxVal: activity.maxThreshold, ratio: activity.ratio || 0, multiple: activity.multiple || 1 }];
};

const inRange = (amount, minVal, maxVal) => {
  const min = Number(minVal || 0);
  const max = Number(maxVal || 0);
  return amount >= min && (max <= 0 || amount <= max);
};

const settingRatio = (setting) => Number(setting?.ratio || setting?.rewardValue || 0);

const pickBest = (amount, settings, extra) => {
  const matched = (Array.isArray(settings) ? settings : []).filter((item) => {
    if (!inRange(amount, item.minVal, item.maxVal)) return false;
    return extra ? extra(item) : true;
  });
  if (!matched.length) return null;
  return matched.reduce((best, item) => {
    const min = Number(item.minVal || 0);
    const bestMin = Number(best.minVal || 0);
    if (min !== bestMin) return min > bestMin ? item : best;
    return settingRatio(item) > settingRatio(best) ? item : best;
  });
};

const countInRange = (count, from, to) => {
  const start = Number(from || 0);
  const end = Number(to || 0);
  return end <= 0 ? count >= start : count >= start && count <= end;
};

const calcBonus = (amount, setting, activity, code) => {
  if (!setting) return 0;
  const rechargeAmount = Number(amount || 0);
  const maxThreshold = Number(activity?.maxThreshold || 0);
  if (String(code || '').toUpperCase() === NTH_CODE) {
    const rewardType = String(setting.rewardType || '').toUpperCase();
    const rewardValue = Number(setting.rewardValue || 0);
    if (rewardType === 'FIXED') return rewardValue;
    if (rewardValue <= 0) return 0;
    const calculated = rechargeAmount * (rewardValue / 100);
    return maxThreshold > 0 ? Math.min(calculated, maxThreshold) : calculated;
  }
  const ratio = settingRatio(setting);
  return ratio > 0 ? rechargeAmount * (ratio / 100) : 0;
};

const resolveActivity = (amount, nth, fallback, fallbackCode, paymentId, user) => {
  const nextCount = Number(user?.recharge_count || 0) + 1;
  const nthSetting = pickBest(amount, channelSettings(nth, paymentId), (item) =>
    countInRange(nextCount, item.rechargeCountFrom, item.rechargeCountTo),
  );
  const hasNth = Boolean(nth && nthSetting);
  const preferNth = fallbackCode !== 'FIRST_RECHARGE' && nextCount < 4 && hasNth;
  if (!preferNth && fallback) {
    return { info: fallback, code: fallbackCode, setting: pickBest(amount, channelSettings(fallback, paymentId)) };
  }
  if (hasNth) return { info: nth, code: NTH_CODE, setting: nthSetting };
  return { info: null, code: '', setting: null };
};

const bonusFor = (amount, activities, paymentId, user) => {
  const resolved = resolveActivity(amount, activities.nth, activities.fallback, activities.fallbackCode, paymentId, user);
  return calcBonus(amount, resolved.setting, resolved.info, resolved.code);
};

const isVisibleChannel = (item) => ![2, 3].includes(Number(item.id)) && item.recharge_is_show === 1 && item.status === 1;

const normalizePayment = (item) => {
  const payment = { ...item };
  if (typeof payment.bank_config === 'string' && payment.bank_config.trim()) {
    try {
      payment.bank_config = JSON.parse(payment.bank_config);
    } catch {
      payment.bank_config = [];
    }
  } else if (!Array.isArray(payment.bank_config)) {
    payment.bank_config = [];
  }
  return payment;
};

const paymentAmount = (payment, base) => {
  const amount = Number(base || 0);
  if (!amount || !payment?.currency || String(payment.currency).toUpperCase() === 'INR') return amount;
  const rate = Number(payment.exchange_rate || 0);
  return rate > 0 ? Number((amount / rate).toFixed(4)) : amount;
};

const isEligiblePayment = (payment, base) => {
  const min = Number(payment?.min_recharge_money || 0);
  return !Number.isFinite(min) || min <= 0 || paymentAmount(payment, base) >= min;
};

const findEligiblePayment = (payment, all, base) => {
  const index = all.findIndex((item) => String(item.id) === String(payment?.id));
  if (index < 0) return null;
  return all.slice(index).find((item) => isEligiblePayment(item, base)) || null;
};

const matchedCoupon = (coupons, amount) => {
  const scored = coupons
    .map((coupon) => {
      const tiers = Array.isArray(coupon.tierList) ? coupon.tierList : [];
      if (!tiers.length) return { coupon, score: -1, hit: false };
      const sorted = [...tiers].sort((left, right) => Number(left.minRecharge || 0) - Number(right.minRecharge || 0));
      let hit = null;
      for (let index = sorted.length - 1; index >= 0; index -= 1) {
        if (amount >= Number(sorted[index].minRecharge || 0)) {
          hit = sorted[index];
          break;
        }
      }
      const weight = tiers.length > 1 ? 1000 : 1;
      return { coupon, score: hit ? Number(hit.minRecharge || 0) * weight + weight : -1, hit: Boolean(hit) };
    })
    .sort((left, right) => (left.hit === right.hit ? right.score - left.score : left.hit ? -1 : 1));
  return scored[0]?.hit ? scored[0].coupon : coupons[0] || null;
};

const noticeHtml = (html) => `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>body{margin:0;padding:12px 4px;background:#1b2027;color:#f5f6fa;font-family:sans-serif;font-size:14px;line-height:1.5}a{color:#b7ee52}img{max-width:100%}</style>
</head><body>${html || ''}</body></html>`;

function RechargeBanner({ banners, onPress }) {
  const slides = banners.filter((item) => item?.img);
  const loop = slides.length > 1;
  const data = loop ? [...slides, slides[0]] : slides;
  const scroller = useRef(null);
  const indexRef = useRef(0);
  const widthRef = useRef(0);
  const timerRef = useRef(null);
  const resetRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [dot, setDot] = useState(0);

  const stop = (keepReset = false) => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    if (!keepReset) {
      clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  };

  const start = () => {
    stop(true);
    if (!loop || !widthRef.current) return;
    timerRef.current = setInterval(() => {
      const width = widthRef.current;
      if (!width) return;
      const next = indexRef.current + 1;
      scroller.current?.scrollToOffset({ offset: next * width, animated: true });
      setDot(next >= slides.length ? 0 : next);
      if (next >= slides.length) {
        indexRef.current = 0;
        clearTimeout(resetRef.current);
        resetRef.current = setTimeout(() => {
          resetRef.current = null;
          scroller.current?.scrollToOffset({ offset: 0, animated: false });
        }, BANNER_SPEED);
      } else {
        indexRef.current = next;
      }
    }, BANNER_INTERVAL);
  };

  useEffect(() => {
    start();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') start();
      else stop();
    });
    return () => {
      stop();
      subscription.remove();
    };
  }, [slides.length, pageWidth]);

  if (!slides.length) return null;
  const height = pageWidth ? (pageWidth * 320) / 686 : s(160);

  return (
    <View
      style={[styles.banner, { height }]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        if (!width || width === widthRef.current) return;
        widthRef.current = width;
        setPageWidth(width);
      }}>
      {pageWidth ? (
        <FlatList
          ref={scroller}
          data={data}
          horizontal
          pagingEnabled
          bounces={false}
          scrollEnabled={loop}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (widthRef.current || 1));
            if (loop && index >= slides.length) {
              indexRef.current = 0;
              setDot(0);
              if (!resetRef.current) scroller.current?.scrollToOffset({ offset: 0, animated: false });
            } else {
              const next = Math.min(index, slides.length - 1);
              indexRef.current = next;
              setDot(next);
            }
            start();
          }}
          renderItem={({ item }) => (
            <Pressable style={{ width: pageWidth, height }} onPress={() => onPress(item)}>
              <Image source={{ uri: item.img }} style={{ width: pageWidth, height }} contentFit="cover" />
            </Pressable>
          )}
        />
      ) : null}
      {loop ? (
        <View style={styles.dots}>
          {slides.map((item, index) => (
            <View key={item.id} style={[styles.dot, index === dot && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function RechargeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const routeParams = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const user = useUserStore((state) => state.userInfo);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const appConfig = useSystemStore((state) => state.appConfig);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const [channels, setChannels] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [displayPayment, setDisplayPayment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [customSelected, setCustomSelected] = useState(false);
  const [activities, setActivities] = useState({ nth: null, fallback: null, fallbackCode: '' });
  const [coupons, setCoupons] = useState([]);
  const [notice, setNotice] = useState('');
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const banners = Array.isArray(appConfig?.recharge_banner_list) ? appConfig.recharge_banner_list : [];
  const payAmount = customAmount ? Number(customAmount) || 0 : Number(selectedAmount || 0);
  const paymentId = payment?.id;
  const bonus = bonusFor(payAmount, activities, paymentId, user);
  const resolved = resolveActivity(payAmount, activities.nth, activities.fallback, activities.fallbackCode, paymentId, user);

  useEffect(() => {
    let alive = true;
    (async () => {
      const freshUser = await fetchUserInfo().then(() => useUserStore.getState().userInfo).catch(() => useUserStore.getState().userInfo);
      const fallbackState = Number(freshUser?.first_recharge || 0) === 0
        ? 'FIRST_RECHARGE'
        : Number(freshUser?.is_recharge_day) === 0
          ? 'DAY_FIRST_RECHARGE'
          : '';
      const requests = [
        payList(),
        getActivityList({ page: 1, pageSize: 50, lang: 'en' }).catch(() => null),
        fallbackState ? getWelfareActivityDetail(fallbackState).catch(() => null) : Promise.resolve(null),
        getWelfareActivityDetail(NTH_CODE).catch(() => null),
        getRechargeGiftCoupons({ status: 'UNUSED' }, { showLoading: false }).catch(() => []),
        get_article_detail({ id: 9, type: 5 }).catch(() => null),
      ];
      const [payResult, activityResult, fallbackResult, nthResult, couponResult, article] = await Promise.all(requests);
      if (!alive) return;
      const activityList = normalizeActivityList(activityResult);
      const fallback = fallbackState ? buildEligible(activityList, fallbackState, fallbackResult, freshUser) : null;
      setActivities({
        fallback,
        fallbackCode: fallback ? fallbackState : '',
        nth: buildEligible(activityList, NTH_CODE, nthResult, freshUser),
      });
      const couponList = Array.isArray(unwrap(couponResult)) ? unwrap(couponResult) : Array.isArray(couponResult) ? couponResult : [];
      setCoupons(couponList);
      setNotice(article?.content || '');
      const all = (payResult?.pay_in_list || []).map(normalizePayment);
      const visible = all.slice(0, 4).filter(isVisibleChannel).map((item, index) => ({
        ...item,
        ...(CHANNEL_PRESETS[index] || {}),
      }));
      setAllPayments(all);
      setChannels(visible);
      const first = visible[0] || null;
      const eligible = first ? findEligiblePayment(first, all, 200) : null;
      setDisplayPayment(eligible ? first : null);
      setPayment(eligible);
    })()
      .catch((error) => {
        if (alive) toast.error(error?.message || t('errors.requestFailed'));
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [fetchUserInfo, t]);

  useEffect(() => {
    if (!appConfig) loadAppConfig().catch(() => {});
  }, [appConfig, loadAppConfig]);

  const selectChannel = (channel) => {
    const eligible = findEligiblePayment(channel, allPayments, payAmount);
    if (!eligible) {
      setDisplayPayment(null);
      setPayment(null);
      toast.warning(t('recharge.amountBelowMinimum'));
      return;
    }
    setDisplayPayment(channel);
    setPayment(eligible);
  };

  const selectPreset = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(String(amount));
    setCustomSelected(false);
  };

  const selectCustom = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setCustomSelected(true);
  };

  const changeCustom = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const max = Number(payment?.max_recharge_money || 0);
    let next = digits;
    if (max > 0 && Number(digits || 0) > max) {
      next = String(Math.floor(max));
      toast.warning(t('recharge.maxRechargeAmount', { amount: max.toLocaleString('en-US', { maximumFractionDigits: 2 }) }));
    }
    setCustomAmount(next);
    if (next) {
      setCustomSelected(true);
      setSelectedAmount(null);
      return;
    }
    setCustomSelected(false);
  };

  const openBanner = (slide) => {
    const link = String(slide?.url || slide?.link || '').trim();
    if (!link) return;
    if (/^https?:\/\//i.test(link)) {
      Linking.openURL(link).catch(() => {});
      return;
    }
    router.push(link);
  };

  const submit = async () => {
    if (!payAmount) {
      toast.warning(t('recharge.selectAmountAlert'));
      return;
    }
    if (!payment) {
      toast.error(t('recharge.paymentMethod'));
      return;
    }
    const amount = paymentAmount(payment, payAmount);
    const min = Number(payment.min_recharge_money || 0);
    const max = Number(payment.max_recharge_money || 0);
    if (min > 0 && amount < min) {
      toast.warning(t('recharge.amountBelowMinimum'));
      return;
    }
    if (max > 0 && amount > max) {
      toast.warning(t('recharge.maxRechargeAmount', { amount: max.toLocaleString('en-US', { maximumFractionDigits: 2 }) }));
      return;
    }
    const coupon = matchedCoupon(coupons, payAmount);
    const couponParams = coupon?.couponCode
      ? { coupon_code: coupon.couponCode, ...(coupon.activityId ? { activity_id: coupon.activityId } : {}) }
      : {};
    const activityParams = resolved.info ? { is_join: 1, activity_id: resolved.info.listActivityId || '' } : {};
    const packageCode = routeParams.packageCode;
    const siteId = routeParams.site_id;
    const sacred = {
      ...(packageCode ? { package_code: String(packageCode), payment_scene: String(routeParams.scene || 'SACRED_JOURNEY_RESIGN') } : {}),
      ...(siteId ? { site_id: String(siteId) } : {}),
    };
    setSubmitting(true);
    try {
      const paymentType = Number(payment.type);
      if (paymentType === 3) {
        const offlineAddress = payment.offline_address;
        if (!offlineAddress) {
          toast.warning(t('recharge.paymentInfoMissing'));
          return;
        }
        const pathname = Number(offlineAddress.type) === 1 ? '/yhk-detail' : '/usdt-offline-detail';
        router.push({ pathname, params: { amount: String(amount), paymentId: String(payment.id), ...couponParams, ...activityParams, ...sacred } });
        return;
      }
      const res = await payIn({
        id: payment.id,
        amount: Number(amount),
        remark: '',
        page_url: 'https://pu.sukim.top',
        ...couponParams,
        ...activityParams,
        ...sacred,
      });
      if (paymentType === 2 && res?.pay_url) {
        await Linking.openURL(res.pay_url);
        router.push({
          pathname: '/usdt-online-pay',
          params: {
            amount: String(res.amount || amount),
            paymentId: String(res.payment_id || payment.id),
            address: String(res.address || res.wallet_address || ''),
            icon: String(res.icon || ''),
          },
        });
        return;
      }
      if (res?.pay_url) await Linking.openURL(res.pay_url);
      else toast.success(t('recharge.submitSuccess'));
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.fill} contentContainerStyle={[styles.content, { paddingTop: insets.top + s(12) }, !ready && styles.contentLoading]}>
        <Text style={styles.title}>{t('recharge.title')}</Text>
        {!ready ? (
          <PageSkeleton />
        ) : (
          <>
            <RechargeBanner banners={banners} onPress={openBanner} />
            {channels.length ? (
              <>
                <Text style={styles.step}>1  {t('recharge.selectDepositChannel')}</Text>
                <ScrollView horizontal style={styles.paymentRow} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.payments}>
                  {channels.map((item, index) => {
                    const active = displayPayment?.id === item.id;
                    return (
                      <Pressable key={item.id} style={({ pressed }) => [styles.payment, active && styles.active, pressed && styles.pressed]} onPress={() => selectChannel(item)}>
                        {index === 0 ? <Text style={styles.hot}>{t('pageCopy.casinoPromo.hot')}</Text> : null}
                        <Image source={typeof item.img === 'string' ? { uri: item.img } : item.img} style={styles.paymentIcon} contentFit="contain" />
                        <Text style={styles.paymentName} numberOfLines={1}>{item.name}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}
            <Text style={styles.step}>2  {t('recharge.selectAmount')}</Text>
            <View style={styles.amounts}>
              {AMOUNTS.map((amount) => {
                const reward = bonusFor(amount, activities, paymentId, user);
                const active = !customSelected && selectedAmount === amount;
                return (
                  <Pressable key={amount} style={({ pressed }) => [styles.amount, active && styles.active, pressed && styles.pressed]} onPress={() => selectPreset(amount)}>
                    {reward > 0 ? <Text style={styles.amountReward}>{amount}+{truncateAmount(reward)}</Text> : null}
                    <Text style={[styles.amountValue, active && styles.amountValueActive]}>₹{amount.toLocaleString()}</Text>
                  </Pressable>
                );
              })}
              <Pressable style={({ pressed }) => [styles.amount, customSelected && styles.active, pressed && styles.pressed]} onPress={() => { if (!customSelected) selectCustom(); }}>
                {customSelected ? (
                  <TextInput
                    autoFocus
                    value={customAmount}
                    onChangeText={changeCustom}
                    keyboardType="number-pad"
                    maxLength={4}
                    style={styles.amountInput}
                  />
                ) : (
                  <>
                    <Text style={styles.amountValue}>{t('recharge.customAmount')}</Text>
                    <Text style={styles.amountSub}>{t('recharge.inputAmount')}</Text>
                  </>
                )}
              </Pressable>
            </View>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('recharge.youPay')}</Text>
                <Text style={styles.summaryValue}>₹ {customAmount || selectedAmount || 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('recharge.bonus')}</Text>
                <Text style={styles.summaryBonus}>+ ₹ {truncateAmount(bonus)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('recharge.youReceive')}</Text>
                <Text style={styles.summaryBonus}>₹ {truncateAmount(payAmount + bonus)}</Text>
              </View>
            </View>
            <PrimaryButton label={t('recharge.title')} onPress={submit} loading={submitting} disabled={!payAmount} />
            {notice ? (
              <Pressable style={styles.notice} onPress={() => setNoticeOpen(true)}>
                <Text style={styles.noticeText}>{t('recharge.notice')}</Text>
                <Text style={styles.noticeArrow}>⌄</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
      <BottomSheet visible={noticeOpen} onClose={() => setNoticeOpen(false)} cardStyle={styles.sheetCard}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>{t('recharge.notice')}</Text>
          <Pressable onPress={() => setNoticeOpen(false)} hitSlop={s(8)}>
            <Text style={styles.sheetClose}>×</Text>
          </Pressable>
        </View>
        <WebView originWhitelist={['*']} source={{ html: noticeHtml(notice) }} style={styles.noticeWeb} setSupportMultipleWindows={false} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: s(12), gap: s(12), paddingBottom: s(28) },
  contentLoading: { flexGrow: 1 },
  title: { color: colors.text, fontSize: s(18), fontWeight: '700', textAlign: 'center' },
  banner: { width: '100%', borderRadius: s(18), overflow: 'hidden', backgroundColor: colors.surface },
  dots: { position: 'absolute', right: s(12), bottom: s(8), flexDirection: 'row', alignItems: 'center', gap: s(4) },
  dot: { width: s(6), height: s(6), borderRadius: s(6), backgroundColor: 'rgba(240,243,255,0.45)' },
  dotActive: { width: s(8), backgroundColor: '#18c8f5' },
  step: { color: colors.text, fontSize: s(15), fontWeight: '700' },
  paymentRow: { height: s(86), maxHeight: s(86), flexGrow: 0 },
  payments: { height: s(86), gap: s(8), alignItems: 'center' },
  payment: { width: s(104), height: s(86), borderRadius: s(10), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(6), gap: s(5) },
  paymentIcon: { width: s(32), height: s(32) },
  paymentName: { color: colors.text, fontSize: s(12), textAlign: 'center' },
  hot: { position: 'absolute', top: s(5), right: s(5), paddingHorizontal: s(4), paddingVertical: s(2), borderRadius: s(3), backgroundColor: '#f3c45f', color: colors.bg, fontSize: s(8), fontWeight: '700', overflow: 'hidden' },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8) },
  amount: { width: '31%', minHeight: s(78), borderRadius: s(10), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(4), paddingVertical: s(10), gap: s(5) },
  active: { borderColor: colors.accent },
  amountReward: { color: '#f3c45f', fontSize: s(12) },
  amountValue: { color: colors.text, fontSize: s(14), fontWeight: '600', textAlign: 'center' },
  amountValueActive: { color: colors.accent },
  amountSub: { color: colors.muted, fontSize: s(10), textAlign: 'center' },
  amountInput: { width: '100%', color: colors.accent, fontSize: s(13), fontWeight: '700', textAlign: 'center', padding: 0 },
  summary: { borderRadius: s(12), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(12), gap: s(12) },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(12) },
  summaryLabel: { color: colors.muted, fontSize: s(13) },
  summaryValue: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  summaryBonus: { color: colors.accent, fontSize: s(14), fontWeight: '600' },
  notice: { minHeight: s(44), borderRadius: s(12), borderWidth: 1, borderColor: 'rgba(183,238,82,0.45)', backgroundColor: colors.surface, paddingHorizontal: s(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noticeText: { color: colors.text, fontSize: s(13), fontWeight: '700' },
  noticeArrow: { color: colors.accent, fontSize: s(18), lineHeight: s(18) },
  sheetCard: { padding: s(16), gap: s(8), borderTopLeftRadius: s(16), borderTopRightRadius: s(16), backgroundColor: colors.surface },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  sheetClose: { color: colors.muted, fontSize: s(24), lineHeight: s(24) },
  noticeWeb: { height: s(320), backgroundColor: colors.surface },
  pressed: { opacity: 0.72 },
});
