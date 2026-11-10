// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getNotice } from '@/api/index';
import { payIn, payList } from '@/api/bankcard';
import {
  claimFirstRechargeFollowupTask,
  claimLimitedActivity,
  getCurrentLimitedActivity,
  getFirstRechargeFollowupEntry,
  getFirstRechargeFollowupInfo,
  getLimitedActivityProgress,
  getStageSignInfo,
  joinFirstRechargeFollowup,
  joinLimitedActivity,
} from '@/api/vip';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { memoryStorage } from '@/utils/memory-storage';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const NOTICE_HIDE_KEY = 'hideNoticeDate';
const PROMO_SECONDS = 120;
const PROMO_END_KEY = 'demo-home-promo-countdown-end-time';
const giftArt = require('../../assets/brand/home/first-deposit-bonus.png');
const signArt = require('../../assets/brand/home/sign_pop.webp');
const carnivalArt = require('../../assets/brand/home/carnival-seven-days.png');
const carnivalClose = require('../../assets/brand/home/carnival-close.png');
const limitedArt = require('../../assets/brand/home/limited-time-activity.webp');
const limitedIcon = require('../../assets/brand/home/limited-time-activity-new.png');
const timeIcon = require('../../assets/brand/home/limited-activity-time.png');

const homeSession = {
  signDismissed: false,
  bannerDismissed: false,
  joinedRounds: new Set(),
};
const promoMemory = new Map();

const todayKey = () => new Date().toISOString().slice(0, 10);

const plainText = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const noticeDate = (value) => {
  const matched = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return matched ? matched[1] : String(value || '');
};

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? null;

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const readSession = (key) => {
  if (typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return promoMemory.get(key) ?? null;
    }
  }
  return promoMemory.get(key) ?? null;
};

const writeSession = (key, value) => {
  promoMemory.set(key, value);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Private browsing can block session storage.
    }
  }
};

const bannerUrlOf = (activity) => {
  const value = activity?.bannerUrl;
  if (Array.isArray(value)) return String(value[0] || '').trim();
  const text = String(value ?? '').trim();
  if (!text.startsWith('[')) return text;
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return String(parsed[0] || '').trim();
  } catch {
    return '';
  }
  return '';
};

const formatAmount = (value) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return '0';
  return number.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const pad = (value) => String(value).padStart(2, '0');

const clockOf = (total) => {
  const seconds = Math.max(0, Number(total) || 0);
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map(pad);
};

const isDepositLink = (link) => /(?:^|\/)recharge(?:[/?#]|$)/i.test(String(link || ''));

export function HomePopups() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const userInfo = useUserStore((state) => state.userInfo);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const userId = String(userInfo?.id || userInfo?.user_id || userInfo?.userId || '');

  const [noticeChecked, setNoticeChecked] = useState(false);
  const [notices, setNotices] = useState([]);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [hideToday, setHideToday] = useState(false);
  const [signChecked, setSignChecked] = useState(false);
  const [pendingSign, setPendingSign] = useState(false);
  const [pendingPromo, setPendingPromo] = useState(false);
  const [promoLeft, setPromoLeft] = useState(0);
  const [activity, setActivity] = useState(null);
  const [remain, setRemain] = useState(0);
  const [pendingBanner, setPendingBanner] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLeft, setDetailLeft] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [rechargingKey, setRechargingKey] = useState('');
  const [carnivalOpen, setCarnivalOpen] = useState(false);
  const [carnivalId, setCarnivalId] = useState('');
  const [joiningCarnival, setJoiningCarnival] = useState(false);
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [benefit, setBenefit] = useState(null);
  const [claimingTask, setClaimingTask] = useState('');
  const [ask, setAsk] = useState(null);
  const promoEndRef = useRef(0);
  const promoClosedRef = useRef(false);
  const openingRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = memoryStorage.getItem(NOTICE_HIDE_KEY) || (await AsyncStorage.getItem(NOTICE_HIDE_KEY));
      try {
        const result = await getNotice({ type: 1 });
        const list = asList(unwrap(result) ?? result);
        if (!alive) return;
        setNotices(list);
        setNoticeIndex(0);
        setNoticeOpen(list.length > 0 && stored !== todayKey());
      } catch {
        if (!alive) return;
        setNoticeOpen(false);
      } finally {
        if (alive) setNoticeChecked(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      homeSession.signDismissed = false;
      setPendingSign(false);
      setSignChecked(true);
      setPendingPromo(false);
      setCarnivalOpen(false);
      return undefined;
    }
    if (homeSession.signDismissed) {
      setPendingSign(false);
      setSignChecked(true);
      return undefined;
    }
    let alive = true;
    setSignChecked(false);
    getStageSignInfo({}, { showLoading: false })
      .then((response) => {
        if (!alive) return;
        const info = unwrap(response) || {};
        const signedToday = info.signedToday ?? info.signed_today;
        const canSign = info.canSign ?? info.can_sign;
        setPendingSign(signedToday === false || (signedToday !== true && (canSign === true || canSign === 1)));
      })
      .catch(() => {
        if (alive) setPendingSign(false);
      })
      .finally(() => {
        if (alive) setSignChecked(true);
      });
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      promoClosedRef.current = false;
      setPendingPromo(false);
      return undefined;
    }
    if (!userInfo || promoClosedRef.current) return undefined;
    if (Number(userInfo.recharge_count || 0) !== 0) {
      setPendingPromo(false);
      return undefined;
    }
    const key = userId ? `${PROMO_END_KEY}:${userId}` : '';
    let end = key ? Number(readSession(key)) : 0;
    if (!Number.isFinite(end) || end <= 0) {
      end = Date.now() + PROMO_SECONDS * 1000;
      if (key) writeSession(key, String(end));
    }
    promoEndRef.current = end;
    if (end <= Date.now()) {
      setPendingPromo(false);
      setPromoLeft(0);
      return undefined;
    }
    setPendingPromo(true);
    const tick = () => {
      const left = Math.max(0, Math.ceil((promoEndRef.current - Date.now()) / 1000));
      setPromoLeft(left);
      if (left === 0) setPendingPromo(false);
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [isLoggedIn, userId, userInfo?.recharge_count]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    let alive = true;
    getFirstRechargeFollowupEntry({}, { showLoading: false })
      .then((response) => {
        if (!alive) return;
        const entry = unwrap(response) || {};
        setCarnivalId(entry.activityId || '');
        setCarnivalOpen(entry.showJoinPopup === true);
      })
      .catch(() => {
        if (alive) setCarnivalOpen(false);
      });
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const applyActivity = (payload) => {
    const seconds = Math.floor(Number(payload?.remainingSeconds));
    const status = String(payload?.status || '').toUpperCase();
    if (!payload?.roundId || status === 'WAITING' || !Number.isFinite(seconds) || seconds <= 0) {
      setActivity(null);
      setRemain(0);
      setPendingBanner(false);
      return;
    }
    setActivity(payload);
    setRemain(seconds);
    const url = bannerUrlOf(payload);
    setPendingBanner(Boolean(url) && !homeSession.bannerDismissed);
  };

  useEffect(() => {
    let alive = true;
    getCurrentLimitedActivity()
      .then((response) => {
        if (alive) applyActivity(unwrap(response));
      })
      .catch(() => {
        if (alive) applyActivity(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (remain <= 0) return undefined;
    const timer = setInterval(() => {
      setRemain((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remain > 0]);

  useEffect(() => {
    if (remain !== 0 || !activity) return undefined;
    const timer = setTimeout(() => {
      getCurrentLimitedActivity()
        .then((response) => applyActivity(unwrap(response)))
        .catch(() => applyActivity(null));
    }, 3000);
    return () => clearTimeout(timer);
  }, [remain, activity]);

  useEffect(() => {
    if (!detailOpen) return undefined;
    if (detailLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setDetailLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [detailOpen, detailLeft > 0]);

  const bannerUrl = bannerUrlOf(activity);
  const active = useMemo(() => {
    if (!noticeChecked || !signChecked) return noticeOpen ? 'notice' : 'wait';
    if (noticeOpen) return 'notice';
    if (pendingPromo && promoLeft > 0) return 'promo';
    if (pendingSign) return 'sign';
    if (pendingBanner && bannerUrl) return 'banner';
    return 'none';
  }, [bannerUrl, noticeChecked, noticeOpen, pendingBanner, pendingPromo, pendingSign, promoLeft, signChecked]);

  const closeNotice = () => {
    if (hideToday) memoryStorage.setItem(NOTICE_HIDE_KEY, todayKey());
    setNoticeOpen(false);
  };

  const nextNotice = () => {
    if (noticeIndex < notices.length - 1) setNoticeIndex((value) => value + 1);
    else closeNotice();
  };

  const dismissSign = () => {
    homeSession.signDismissed = true;
    setPendingSign(false);
  };

  const dismissBanner = () => {
    homeSession.bannerDismissed = true;
    setPendingBanner(false);
  };

  const openActivity = async (source) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    const roundId = String(source?.roundId || '');
    if (!roundId || openingRef.current) return;
    openingRef.current = true;
    try {
      const status = String(source?.status || '').toUpperCase();
      const skipJoin = ['CLAIMED', 'EXPIRED', 'COMPLETED'].includes(status) || source?.joined === true || homeSession.joinedRounds.has(roundId);
      if (source?.joined === false && !skipJoin) {
        await joinLimitedActivity({ roundId });
        homeSession.joinedRounds.add(roundId);
        source.joined = true;
      }
      const response = await getLimitedActivityProgress({ roundId });
      const payload = unwrap(response);
      const seconds = Math.floor(Number(payload?.remainingSeconds));
      setDetail(payload?.roundId ? payload : source);
      setDetailLeft(Number.isFinite(seconds) ? Math.max(0, seconds) : 0);
      setDetailOpen(true);
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      openingRef.current = false;
    }
  };

  const goLink = (link) => {
    const target = String(link || '').trim();
    setDetailOpen(false);
    if (!target) {
      router.push('/game-list');
      return;
    }
    if (/^https?:\/\//i.test(target)) {
      Linking.openURL(target).catch(() => {});
      return;
    }
    router.push(target.startsWith('/') ? target : `/${target}`);
  };

  const rechargeTier = async (rule) => {
    const key = `${rule?.sortNo}-${rule?.thresholdValue}`;
    if (rechargingKey) return;
    const baseAmount = Number(rule?.thresholdValue || 0);
    if (!baseAmount) return;
    setRechargingKey(key);
    try {
      const channelList = await payList();
      const channel = (channelList?.pay_in_list || []).slice(0, 4).find((item) => ![2, 3].includes(Number(item?.id)) && item?.recharge_is_show === 1 && item?.status === 1);
      if (!channel) {
        toast.error(t('recharge.paymentMethod'));
        return;
      }
      const rate = Number(channel.exchange_rate || 0);
      const foreign = channel.currency && String(channel.currency).toUpperCase() !== 'INR';
      const amount = foreign && rate > 0 ? Number((baseAmount / rate).toFixed(4)) : baseAmount;
      const minAmount = Number(channel.min_recharge_money);
      const maxAmount = Number(channel.max_recharge_money);
      if (minAmount > 0 && amount < minAmount) {
        toast.warning(t('recharge.amountBelowMinimum'));
        return;
      }
      if (maxAmount > 0 && amount > maxAmount) {
        toast.warning(t('recharge.maxRechargeAmount', { amount: formatAmount(maxAmount) }));
        return;
      }
      if (Number(channel.type) === 3) {
        const offline = typeof channel.offline_address === 'string' ? JSON.parse(channel.offline_address || '{}') : channel.offline_address;
        const offlineType = Number(offline?.type);
        if (offlineType !== 1 && offlineType !== 2) {
          toast.warning(t('recharge.paymentInfoMissing'));
          return;
        }
        setDetailOpen(false);
        router.push({ pathname: offlineType === 1 ? '/yhk-detail' : '/usdt-offline-detail', params: { amount: String(amount), paymentId: String(channel.id) } });
        return;
      }
      const payResult = await payIn({ id: channel.id, amount: Number(amount), remark: '', page_url: 'https://pu.sukim.top' });
      if (payResult?.pay_url && /^https?:\/\//i.test(payResult.pay_url)) {
        setDetailOpen(false);
        Linking.openURL(payResult.pay_url).catch(() => {});
        return;
      }
      toast.success(t('recharge.submitSuccess'));
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setRechargingKey('');
    }
  };

  const confirmAsk = (options) => new Promise((resolve) => setAsk({ ...options, resolve }));

  const claimReward = async () => {
    if (!detail?.roundId || claiming) return;
    const rules = [...(detail.rewardRules || [])].sort((left, right) => Number(left.sortNo || 0) - Number(right.sortNo || 0));
    const progress = Number(detail.progress || 0);
    const last = rules[rules.length - 1];
    const higherLeft = last ? progress < Number(last.thresholdValue || 0) : false;
    const repeat = detail.repeatParticipationEnabled === true || detail.repeatParticipationEnabled === 1 || detail.repeatParticipationEnabled === '1';
    if (higherLeft && (repeat || rules.length > 0)) {
      const confirmed = await confirmAsk({
        title: t('demoHome.limitedActivity.claimConfirmTitle'),
        message: t(repeat ? 'demoHome.limitedActivity.repeatClaimConfirmMessage' : 'demoHome.limitedActivity.claimConfirmGeneric'),
      });
      if (!confirmed) return;
    }
    setClaiming(true);
    try {
      const result = unwrap(await claimLimitedActivity({ roundId: detail.roundId }));
      const amount = Number(result?.rewardValue ?? result?.claimableAmount ?? result?.amount ?? detail.claimableAmount ?? rules[0]?.rewardValue ?? 0);
      setDetailOpen(false);
      await confirmAsk({
        title: t('demoHome.limitedActivity.claimSuccessTitle'),
        message: t('demoHome.limitedActivity.claimSuccessMessage', { amount: formatAmount(amount) }),
        hideCancel: true,
      });
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setClaiming(false);
    }
  };

  const joinCarnival = async () => {
    if (joiningCarnival) return;
    setJoiningCarnival(true);
    try {
      await joinFirstRechargeFollowup(carnivalId ? { activityId: carnivalId } : {});
      const info = unwrap(await getFirstRechargeFollowupInfo());
      setBenefit(info);
      setCarnivalOpen(false);
      setBenefitOpen(true);
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setJoiningCarnival(false);
    }
  };

  const loadBenefit = async () => {
    const info = unwrap(await getFirstRechargeFollowupInfo());
    setBenefit(info);
    return info;
  };

  useEffect(() => {
    if (!benefitOpen) return undefined;
    let alive = true;
    getFirstRechargeFollowupInfo()
      .then((response) => {
        if (alive) setBenefit(unwrap(response));
      })
      .catch(() => {
        if (alive) setBenefit(null);
      });
    return () => {
      alive = false;
    };
  }, [benefitOpen]);

  const claimCarnivalTask = async (task) => {
    if (task?.status !== 'CLAIMABLE' || claimingTask) return;
    setClaimingTask(String(task.taskNo));
    try {
      await claimFirstRechargeFollowupTask({ taskNo: task.taskNo });
      await loadBenefit();
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setClaimingTask('');
    }
  };

  const notice = notices[noticeIndex];
  const dismissTop = () => {
    if (ask) {
      ask.resolve(false);
      setAsk(null);
      return;
    }
    if (benefitOpen) {
      setBenefitOpen(false);
      return;
    }
    if (carnivalOpen) {
      setCarnivalOpen(false);
      return;
    }
    if (detailOpen) {
      setDetailOpen(false);
      return;
    }
    if (active === 'notice') closeNotice();
    else if (active === 'promo') {
      promoClosedRef.current = true;
      setPendingPromo(false);
    } else if (active === 'sign') dismissSign();
    else if (active === 'banner') dismissBanner();
  };
  const overlayOpen = Boolean((active === 'notice' && notice) || active === 'promo' || active === 'sign' || active === 'banner' || (detailOpen && detail) || carnivalOpen || benefitOpen || ask);
  const promoClock = clockOf(promoLeft);
  const detailClock = clockOf(detailLeft);
  const detailRules = [...(detail?.rewardRules || [])].sort((left, right) => Number(left.sortNo || 0) - Number(right.sortNo || 0));
  const detailStatus = String(detail?.status || '').toUpperCase();
  const canClaim = detailStatus !== 'CLAIMED' && detailStatus !== 'EXPIRED' && (detailStatus === 'COMPLETED' || detail?.canClaim === true);
  const detailProgress = Number(detail?.progress || 0);
  const detailMax = Number(detailRules[detailRules.length - 1]?.thresholdValue || detail?.target || 0);
  const jumpLink = String(detail?.jumpLink || '').trim();
  const showGo = Boolean(jumpLink) && detailStatus !== 'CLAIMED' && detailStatus !== 'EXPIRED' && (!detailMax || detailProgress < detailMax);
  const singleRecharge = String(detail?.condition?.taskType || '').toUpperCase() === 'SINGLE_RECHARGE';
  const tasks = [...(benefit?.tasks || [])].sort((left, right) => Number(left.taskNo) - Number(right.taskNo));
  const currentTask = tasks.find((task) => Number(task.taskNo) === Number(benefit?.currentTaskNo || 0)) || tasks.find((task) => task.status !== 'CLAIMED');

  return (
    <>
      {activity && remain > 0 ? (
        <Pressable style={styles.float} onPress={() => openActivity(activity)}>
          <Image source={limitedArt} style={styles.floatArt} contentFit="contain" />
          <Text style={styles.floatTime}>{clockOf(remain).join(':')}</Text>
        </Pressable>
      ) : null}
      <Modal visible={overlayOpen} transparent statusBarTranslucent navigationBarTranslucent animationType="fade" onRequestClose={dismissTop}>
        <View style={styles.modalRoot}>
      {active === 'notice' && notice ? (
        <View style={[styles.mask, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.notice}>
            <View style={styles.noticeHead}>
              <Text style={styles.noticeLabel}>{t('demoHome.latestNotice')}</Text>
              <Pressable onPress={closeNotice}><Text style={styles.close}>×</Text></Pressable>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.date}>{noticeDate(notice.created_at)}</Text>
            <ScrollView style={styles.noticeBody}><Text style={styles.body}>{plainText(notice.content)}</Text></ScrollView>
            <Pressable style={styles.checkRow} onPress={() => setHideToday((value) => !value)}>
              <View style={[styles.box, hideToday && styles.boxOn]}>{hideToday ? <Text style={styles.boxMark}>✓</Text> : null}</View>
              <Text style={styles.body}>{t('demoHome.dontRemindToday')}</Text>
            </Pressable>
            {notices.length > 1 ? (
              <View style={styles.dots}>
                {notices.map((item, index) => <View key={item.id || index} style={[styles.dot, index === noticeIndex && styles.dotOn]} />)}
              </View>
            ) : null}
            <View style={styles.footer}>
              <Pressable style={styles.cancel} onPress={closeNotice}><Text style={styles.cancelText}>{t('common.cancel')}</Text></Pressable>
              <Pressable style={styles.confirm} onPress={nextNotice}><Text style={styles.confirmText}>{t('common.confirm')}</Text></Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {active === 'promo' ? (
        <View style={[styles.mask, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.promo}>
            <Image source={giftArt} style={styles.gift} contentFit="contain" />
            <Pressable style={styles.promoClose} onPress={() => { promoClosedRef.current = true; setPendingPromo(false); }}><Text style={styles.close}>×</Text></Pressable>
            <Text style={styles.promoTitle}>{t('demoHome.promoModal.fortune')}</Text>
            <Text style={styles.promoDeposit}>{t('demoHome.promoModal.depositLine')}</Text>
            <Text style={styles.promoBonus}>{t('demoHome.promoModal.bonusLine')}</Text>
            <Text style={styles.promoEnds}>{t('demoHome.promoModal.endsIn')}</Text>
            <View style={styles.clock}>
              {promoClock.map((unit, index) => (
                <View key={['hrs', 'min', 'sec'][index]} style={styles.clockPart}>
                  {index > 0 ? <Text style={styles.colon}>:</Text> : null}
                  <View style={styles.clockUnit}>
                    <Text style={styles.clockValue}>{unit}</Text>
                    <Text style={styles.clockLabel}>{t(`demoHome.promoModal.${['hrs', 'min', 'sec'][index]}`)}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable style={styles.confirmWide} onPress={() => router.push('/recharge')}>
              <Text style={styles.confirmText}>{t('demoHome.promoModal.deposit')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {active === 'sign' ? (
        <View style={styles.signMask}>
          <View style={styles.sign}>
            <Pressable collapsable={false} style={styles.signHit} onPress={() => { dismissSign(); router.push('/welfare-center'); }}>
              <View style={styles.signCard}>
                <Text style={styles.signTitle}>{t('demoHome.signPop.title')}</Text>
                <Text style={styles.signDays}>{t('demoHome.signPop.days')}</Text>
                <Text style={styles.signSub}>{t('demoHome.signPop.subtitle')}</Text>
              </View>
              <Image source={signArt} style={styles.signArt} contentFit="contain" />
            </Pressable>
            <Pressable onPress={dismissSign} hitSlop={s(8)} style={styles.signClose}>
              <Text style={[styles.close, styles.signCloseText]}>×</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {active === 'banner' ? (
        <View style={[styles.mask, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.bannerStage}>
            <Pressable onPress={() => { dismissBanner(); openActivity(activity); }}>
              <Image source={{ uri: bannerUrl }} style={styles.bannerImage} contentFit="contain" />
            </Pressable>
            <Pressable style={styles.bannerClose} onPress={dismissBanner}><Text style={styles.close}>×</Text></Pressable>
          </View>
        </View>
      ) : null}

      {detailOpen && detail ? (
        <View style={[styles.mask, styles.front, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.detail}>
            <View style={styles.noticeHead}>
              <Text style={styles.noticeLabel}>{t('demoHome.limitedActivity.title')}</Text>
              <Pressable onPress={() => setDetailOpen(false)}><Text style={styles.close}>×</Text></Pressable>
            </View>
            <View style={styles.timerRow}>
              <Image source={timeIcon} style={styles.timeIcon} contentFit="contain" />
              <Text style={styles.date}>{t('demoHome.limitedActivity.remainingTime')}</Text>
              <Text style={styles.clockValue}>{detailClock.join(':')}</Text>
            </View>
            {detailRules.length ? (
              <View style={styles.tierCard}>
                <View style={styles.tierHead}>
                  <Image source={limitedIcon} style={styles.tierIcon} contentFit="contain" />
                  <Text style={styles.noticeTitle}>{detail.activityName}</Text>
                </View>
                <Text style={styles.body}>{formatAmount(detailProgress)} / {formatAmount(detailMax)}</Text>
                {detailRules.map((rule) => {
                  const reached = detailProgress >= Number(rule.thresholdValue || 0);
                  const key = `${rule.sortNo}-${rule.thresholdValue}`;
                  return (
                    <View key={key} style={styles.tier}>
                      <View style={styles.tierCopy}>
                        <Text style={styles.body}>{t('demoHome.limitedActivity.reachGoal', { value: formatAmount(rule.thresholdValue) })}</Text>
                        <Text style={[styles.reward, reached && styles.rewardOn]}>+₹{formatAmount(rule.rewardValue)}</Text>
                      </View>
                      {singleRecharge && detailStatus !== 'CLAIMED' && detailStatus !== 'EXPIRED' ? (
                        <Pressable style={styles.tierButton} disabled={rechargingKey === key} onPress={() => rechargeTier(rule)}>
                          <Text style={styles.confirmText}>{rechargingKey === key ? t('common.loading') : t('demoHome.activity.deposit')}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.tierCard}>
                <Text style={styles.noticeTitle}>{detail.activityName}</Text>
                <Text style={styles.body}>{formatAmount(detailProgress)} / {formatAmount(detail.target || 0)}</Text>
              </View>
            )}
            {detailStatus === 'CLAIMED' ? <Text style={styles.date}>{t('demoHome.limitedActivity.alreadyJoined')}</Text> : null}
            {detailStatus === 'EXPIRED' ? <Text style={styles.date}>{t('demoHome.limitedActivity.expiredHint')}</Text> : null}
            {showGo || canClaim ? (
              <View style={styles.footer}>
                {showGo ? (
                  <Pressable style={styles.cancel} onPress={() => goLink(jumpLink)}>
                    <Text style={styles.cancelText}>{t(isDepositLink(jumpLink) ? 'demoHome.limitedActivity.goDeposit' : 'demoHome.limitedActivity.goBet')}</Text>
                  </Pressable>
                ) : null}
                {canClaim ? (
                  <Pressable style={styles.confirm} disabled={claiming} onPress={claimReward}>
                    <Text style={styles.confirmText}>{claiming ? t('demoHome.limitedActivity.claiming') : t('demoHome.activity.claim')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {carnivalOpen ? (
        <View style={[styles.mask, styles.carnivalMask, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.carnival}>
            <Pressable disabled={joiningCarnival} onPress={joinCarnival}>
              <Image source={carnivalArt} style={styles.carnivalArt} contentFit="contain" />
            </Pressable>
            <Pressable style={styles.carnivalClose} onPress={() => setCarnivalOpen(false)}>
              <Image source={carnivalClose} style={styles.carnivalCloseIcon} contentFit="contain" />
            </Pressable>
          </View>
        </View>
      ) : null}

      {benefitOpen ? (
        <View style={[styles.mask, styles.front, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.benefit}>
            <View style={styles.noticeHead}>
              <Text style={styles.noticeLabel}>{benefit?.title || t('demoHome.carnivalFollowup.title')}</Text>
              <Pressable onPress={() => setBenefitOpen(false)}><Text style={styles.close}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.benefitList}>
              {tasks.map((task) => (
                <View key={task.taskNo} style={styles.task}>
                  <View style={styles.tierCopy}>
                    <Text style={styles.noticeTitle}>{t('demoHome.carnivalFollowup.day', { day: task.taskNo })}</Text>
                    <Text style={styles.body}>
                      {task.taskType === 'TURNOVER'
                        ? t('demoHome.carnivalFollowup.betRequirement', { amount: formatAmount(task.thresholdValue) })
                        : task.taskType === 'SINGLE_RECHARGE'
                          ? t('demoHome.carnivalFollowup.depositRequirement', { amount: formatAmount(task.thresholdValue) })
                          : t('demoHome.carnivalFollowup.free')}
                    </Text>
                    <Text style={styles.reward}>{task.rewardType === 'FREE_SPIN' ? t('demoHome.carnivalFollowup.freeReward', { amount: formatAmount(task.rewardValue) }) : `+ ₹${formatAmount(task.rewardValue)}`}</Text>
                  </View>
                  {task.status === 'CLAIMABLE' ? (
                    <Pressable style={styles.tierButton} onPress={() => claimCarnivalTask(task)}>
                      <Text style={styles.confirmText}>{claimingTask === String(task.taskNo) ? t('demoHome.carnivalFollowup.claiming') : t('demoHome.carnivalFollowup.claim')}</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.date}>{task.status === 'CLAIMED' ? t('demoHome.carnivalFollowup.done') : task.status === 'EXPIRED' ? t('demoHome.limitedActivity.expired') : task.status === 'ISSUING' ? t('demoHome.carnivalFollowup.issuing') : ''}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
            {currentTask?.taskType === 'TURNOVER' || currentTask?.taskType === 'SINGLE_RECHARGE' ? (
              <Pressable style={styles.confirmWide} onPress={() => { setBenefitOpen(false); router.push(currentTask.taskType === 'TURNOVER' ? '/game-list' : '/recharge'); }}>
                <Text style={styles.confirmText}>{t(currentTask.taskType === 'TURNOVER' ? 'demoHome.carnivalFollowup.bet' : 'demoHome.carnivalFollowup.deposit')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {ask ? (
        <View style={[styles.mask, styles.front, { paddingBottom: insets.bottom + s(20) }]}>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{ask.title}</Text>
            <Text style={styles.body}>{ask.message}</Text>
            <View style={styles.footer}>
              {ask.hideCancel ? null : (
                <Pressable style={styles.cancel} onPress={() => { ask.resolve(false); setAsk(null); }}>
                  <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                </Pressable>
              )}
              <Pressable style={styles.confirm} onPress={() => { ask.resolve(true); setAsk(null); }}>
                <Text style={styles.confirmText}>{t('common.confirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  mask: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 30, backgroundColor: 'rgba(14,16,20,0.78)', alignItems: 'center', justifyContent: 'center', padding: s(20) },
  front: { zIndex: 40 },
  carnivalMask: { zIndex: 45, backgroundColor: 'rgba(0,6,23,0.78)' },
  notice: { width: '100%', maxWidth: s(327), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(12), gap: s(8) },
  noticeHead: { minHeight: s(24), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noticeLabel: { flex: 1, color: colors.text, fontSize: s(14), fontWeight: '700' },
  close: { width: s(24), color: colors.muted, fontSize: s(24), lineHeight: s(24), textAlign: 'center' },
  noticeTitle: { color: colors.text, fontSize: s(14), fontWeight: '700', lineHeight: s(18) },
  date: { color: colors.muted, fontSize: s(12), lineHeight: s(16) },
  noticeBody: { maxHeight: s(160) },
  body: { flex: 1, color: colors.text, fontSize: s(12), lineHeight: s(16) },
  checkRow: { minHeight: s(44), flexDirection: 'row', alignItems: 'center', gap: s(6) },
  box: { width: s(24), height: s(24), borderRadius: s(6), borderWidth: s(1.5), borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  boxMark: { color: colors.accentInk, fontSize: s(14), fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: s(6) },
  dot: { width: s(6), height: s(6), borderRadius: s(99), backgroundColor: colors.line },
  dotOn: { width: s(12), backgroundColor: colors.accent },
  footer: { flexDirection: 'row', gap: s(8) },
  cancel: { flex: 1, height: s(48), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  confirm: { flex: 1, height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 #4d661e` },
  confirmWide: { width: '100%', height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 #4d661e` },
  confirmText: { color: colors.accentInk, fontSize: s(14), fontWeight: '600' },
  promo: { width: '100%', maxWidth: s(320), marginTop: s(55), borderRadius: s(12), backgroundColor: colors.surface, alignItems: 'center', gap: s(8), paddingTop: s(85), paddingHorizontal: s(16), paddingBottom: s(12) },
  gift: { position: 'absolute', top: s(-55), width: s(160), height: s(140) },
  promoClose: { position: 'absolute', top: s(12), right: s(12) },
  promoTitle: { color: colors.text, fontSize: s(20), fontWeight: '700', textAlign: 'center' },
  promoDeposit: { color: colors.text, fontSize: s(18), fontWeight: '700', textAlign: 'center' },
  promoBonus: { color: colors.text, fontSize: s(22), fontWeight: '700', textAlign: 'center' },
  promoEnds: { color: colors.text, fontSize: s(12), fontWeight: '700' },
  clock: { flexDirection: 'row', alignItems: 'flex-start' },
  clockPart: { flexDirection: 'row', alignItems: 'flex-start' },
  clockUnit: { alignItems: 'center', minWidth: s(42) },
  clockValue: { color: colors.text, fontSize: s(24), fontWeight: '700' },
  clockLabel: { color: colors.text, fontSize: s(10), fontWeight: '700' },
  colon: { color: colors.text, fontSize: s(24), fontWeight: '700', marginHorizontal: s(6) },
  signMask: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 30, backgroundColor: 'rgba(14,16,20,0.78)', alignItems: 'center', justifyContent: 'center' },
  sign: { width: s(327), position: 'relative' },
  signHit: { paddingTop: s(105) },
  signArt: { position: 'absolute', top: 0, left: s(18), width: s(291), height: s(218), zIndex: 2 },
  signCard: { zIndex: 1, borderWidth: 1, borderColor: colors.accent, borderRadius: s(8), backgroundColor: colors.surface, alignItems: 'center', gap: s(8), paddingTop: s(118), paddingBottom: s(18), paddingHorizontal: s(16), boxShadow: `0 ${s(9)}px ${s(12)}px rgba(0,0,0,0.35)` },
  signClose: { position: 'absolute', top: 0, right: 0, zIndex: 3, width: s(24), height: s(24), alignItems: 'center', justifyContent: 'center' },
  signCloseText: { fontWeight: '700' },
  signTitle: { color: colors.text, fontSize: s(18), fontWeight: '700', lineHeight: s(24), textAlign: 'center' },
  signDays: { color: colors.accent, fontSize: s(40), fontWeight: '700', lineHeight: s(48), textAlign: 'center' },
  signSub: { color: colors.text, fontSize: s(14), lineHeight: s(20), textAlign: 'center' },
  bannerStage: { width: '100%', maxWidth: s(327) },
  bannerImage: { width: '100%', height: s(420) },
  bannerClose: { position: 'absolute', top: s(8), right: s(8) },
  float: { position: 'absolute', right: s(12), top: '42%', zIndex: 12, width: s(88), height: s(96), alignItems: 'center' },
  floatArt: { width: s(88), height: s(78) },
  floatTime: { color: colors.text, fontSize: s(11), fontWeight: '700' },
  detail: { width: '100%', maxWidth: s(360), maxHeight: '86%', borderRadius: s(12), backgroundColor: colors.surface, padding: s(12), gap: s(10) },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  timeIcon: { width: s(16), height: s(16) },
  tierCard: { gap: s(8) },
  tierHead: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  tierIcon: { width: s(42), height: s(42) },
  tier: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  tierCopy: { flex: 1, gap: s(2) },
  reward: { color: colors.text, fontSize: s(13), fontWeight: '700' },
  rewardOn: { color: colors.accent },
  tierButton: { height: s(32), paddingHorizontal: s(10), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  carnival: { width: '100%', maxWidth: s(396) },
  carnivalArt: { width: '100%', height: s(460) },
  carnivalClose: { position: 'absolute', top: s(18), right: s(16), width: s(24), height: s(24) },
  carnivalCloseIcon: { width: s(24), height: s(24) },
  benefit: { width: '100%', maxWidth: s(420), maxHeight: '86%', borderRadius: s(16), backgroundColor: colors.surface, padding: s(12), gap: s(10) },
  benefitList: { maxHeight: s(420) },
  task: { flexDirection: 'row', alignItems: 'center', gap: s(8), paddingVertical: s(8), borderBottomWidth: 1, borderBottomColor: colors.line },
});
