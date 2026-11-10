// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import qrcode from 'qrcode-generator';
import { SvgXml } from 'react-native-svg';

import { getAgentList, getBillList, getTeamList, getTeamStatistics, postWalletTransfer } from '@/api/vip';
import { BottomSheet, ConfirmSheet, EmptyState, PageHeader, PrimaryButton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useUserStore } from '@/stores/user-store';
import { API_BASE_URL } from '@/utils/http';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const pendingIcon = require('../../assets/brand/team/team_dash_pending.png');
const invitedIcon = require('../../assets/brand/team/team_dash_invited.png');
const activeIcon = require('../../assets/brand/team/team_dash_active.png');
const turnoverIcon = require('../../assets/brand/team/team_dash_turnover.png');
const earnedIcon = require('../../assets/brand/team/team_dash_earned.png');
const partnerArt = require('../../assets/brand/team/team_guide_partner_illustration.png');
const shareDownload = require('../../assets/brand/team/team_share_download_white.svg');
const shareWhatsapp = require('../../assets/brand/team/team_share_whatsapp_white.svg');
const shareTelegram = require('../../assets/brand/team/team_share_telegram_white.svg');
const avatarYou = require('../../assets/brand/team/team_rule_h.png');
const avatarA = require('../../assets/brand/team/team_rule_a.png');
const avatarB = require('../../assets/brand/team/team_rule_g.png');
const avatarC = require('../../assets/brand/team/team_rule_c.png');
const avatarD = require('../../assets/brand/team/team_rule_d.png');
const avatarE = require('../../assets/brand/team/team_rule_e.png');
const avatarF = require('../../assets/brand/team/team_rule_f.png');
const defaultAvatar = require('../../assets/brand/nav/avatar.png');
const ASSETS_BASE_URL = 'https://gamex5.s3.ap-south-1.amazonaws.com/gamesos';
const searchIcon = `<svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="9" r="6.2" stroke="${colors.muted}" stroke-width="1.8"/><path d="M13.6 13.6L17.4 17.4" stroke="${colors.muted}" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const calendarIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 5.5H6.5C4.84315 5.5 3.5 6.84315 3.5 8.5V17.5C3.5 19.1569 4.84315 20.5 6.5 20.5H17.5C19.1569 20.5 20.5 19.1569 20.5 17.5V8.5C20.5 6.84315 19.1569 5.5 17.5 5.5Z" stroke="${colors.muted}" stroke-width="1.8"/><path d="M7 3.5V7.5M17 3.5V7.5M3.5 10H20.5" stroke="${colors.muted}" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const chevronIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7.5L10 12.5L15 7.5" stroke="${colors.muted}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const treeLine = '#d7e6c4';
const rootConnector = `<svg width="638" height="76" viewBox="0 0 638 76" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.8" x="318" width="2" height="56" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="155" y="55" width="328" height="2" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="155" y="56" width="2" height="20" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="482" y="56" width="2" height="20" rx="1" fill="${treeLine}"/></svg>`;
const levelConnector = `<svg width="638" height="32" viewBox="0 0 638 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.8" x="155" width="2" height="12" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="482" width="2" height="12" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="75" y="11" width="488" height="2" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="75" y="12" width="2" height="20" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="237" y="12" width="2" height="20" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="400" y="12" width="2" height="20" rx="1" fill="${treeLine}"/><rect opacity="0.8" x="562" y="12" width="2" height="20" rx="1" fill="${treeLine}"/></svg>`;

const PAGE_SIZE = 20;
const CALCULATOR_MAX = 1000000;
const REBATE_TYPES = [
  { id: 'all', labelKey: 'myTeam.rebateTypes.all', value: '' },
  { id: '14', labelKey: 'wallet.billTypeDirectCommission', value: '14' },
  { id: '15', labelKey: 'myTeam.rebateTypes.secondary', value: '15' },
  { id: '16', labelKey: 'myTeam.rebateTypes.third', value: '16' },
  { id: '13', labelKey: 'wallet.billTypeLevelReward', value: '13' },
];
const BILL_TITLE = {
  13: 'wallet.billTypeLevelReward',
  14: 'wallet.billTypeDirectCommission',
  15: 'wallet.billTypeSecondaryCommission',
  16: 'wallet.billTypeThirdCommission',
};

const formatAmount = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en').format(Number.isFinite(amount) ? amount : 0);
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number.isFinite(amount) ? amount : 0,
  );
};

const pad = (value) => String(value).padStart(2, '0');

const formatDateParam = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const monthRange = () => {
  const today = startOfToday();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start: formatDateParam(start), end: formatDateParam(end), custom: false };
};

const dashboardRange = (tab) => {
  if (tab === 'total') return '';
  const start = startOfToday();
  const end = startOfToday();
  if (tab === 'yesterday') {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (tab === 'week') {
    start.setDate(start.getDate() - 7);
  }
  return `${formatDateParam(start)}_${formatDateParam(end)}`;
};

const normalizeStats = (payload = {}) => ({
  team_count: Number(payload.team_count || 0),
  team_recharge: Number(payload.team_recharge || 0),
  team_wagers: Number(payload.team_wagers || 0),
  team_commission: Number(payload.team_commission || 0),
  team_commission_settled: Number(payload.team_commission_settled || 0),
});

const normalizeList = (result) => {
  const data = result?.data ?? result ?? {};
  if (Array.isArray(data)) return { list: data, total: data.length };
  const list = data.list || data.records || data.rows || [];
  const rows = Array.isArray(list) ? list : [];
  const total = Number(data.total ?? data.count ?? rows.length);
  return { list: rows, total: Number.isFinite(total) ? total : rows.length };
};

const memberLevelLabel = (level, t) => {
  const value = Number(level);
  if (value === 1) return t('myTeam.agentLevels.direct');
  if (value === 2) return t('myTeam.agentLevels.secondary');
  if (value === 3) return t('myTeam.agentLevels.third');
  return t('myTeam.agentLevels.member', { level: value || '--' });
};

const requirementText = (value, emptyLabel) => {
  const amount = Number(value);
  if (value == null || value === '' || !Number.isFinite(amount) || amount <= 0) return emptyLabel;
  return formatAmount(amount);
};

const rateText = (value) => {
  const amount = Number(value);
  if (value == null || value === '' || !Number.isFinite(amount) || amount <= 0) return '-';
  return `${amount}%`;
};

const avatarSource = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return defaultAvatar;
  if (/^https?:\/\//i.test(raw)) return { uri: raw };
  if (raw.startsWith('//')) return { uri: `https:${raw}` };
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const base = path.startsWith('/upload') || path.startsWith('/api/') ? API_BASE_URL : ASSETS_BASE_URL;
  return { uri: `${base}${path}` };
};

function ProfileAvatar({ uri }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const source = failed ? defaultAvatar : avatarSource(uri);
  return (
    <View style={styles.avatarClip}>
      <Image
        source={source}
        placeholder={defaultAvatar}
        style={styles.avatarPhoto}
        contentFit="cover"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

function InviteQr({ value, size }) {
  const xml = useMemo(() => {
    if (!value) return '';
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }, [value]);
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} />;
}

const dateParts = (date) => ({
  y: String(date.getFullYear()),
  m: pad(date.getMonth() + 1),
  d: pad(date.getDate()),
});

const shiftDate = (days) => {
  const date = startOfToday();
  date.setDate(date.getDate() + days);
  return dateParts(date);
};

const sameParts = (left, right) => left && right && left.y === right.y && left.m === right.m && left.d === right.d;

const quickDateRange = (key) => {
  if (key === 'today') return { start: shiftDate(0), end: shiftDate(0) };
  if (key === 'yesterday') return { start: shiftDate(-1), end: shiftDate(-1) };
  if (key === 'last7Days') return { start: shiftDate(-7), end: shiftDate(0) };
  if (key === 'last30Days') return { start: shiftDate(-30), end: shiftDate(0) };
  return null;
};

const daysInMonth = (year, month) => new Date(Number(year), Number(month), 0).getDate();

function WheelColumn({ items, value, onChange }) {
  const listRef = useRef(null);
  const itemHeight = s(36);
  const dragging = useRef(false);
  useEffect(() => {
    const index = Math.max(0, items.indexOf(value));
    if (dragging.current) return;
    listRef.current?.scrollTo({ y: index * itemHeight, animated: false });
  }, [itemHeight, items, value]);
  const commit = (offset) => {
    const index = Math.min(Math.max(Math.round(offset / itemHeight), 0), items.length - 1);
    dragging.current = false;
    if (items[index] !== value) onChange(items[index]);
  };
  return (
    <ScrollView
      ref={listRef}
      style={styles.wheelCol}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: itemHeight }}
      onScrollBeginDrag={() => {
        dragging.current = true;
      }}
      onMomentumScrollEnd={(event) => commit(event.nativeEvent.contentOffset.y)}
      onScrollEndDrag={(event) => {
        if (event.nativeEvent.velocity?.y) return;
        commit(event.nativeEvent.contentOffset.y);
      }}>
      {items.map((item) => (
        <View key={item} style={[styles.wheelItem, { height: itemHeight }]}>
          <Text style={item === value ? styles.wheelTextOn : styles.wheelText}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function RebateRangeSheet({ visible, onClose, onConfirm }) {
  const { t } = useI18n();
  const [focus, setFocus] = useState('start');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [cursor, setCursor] = useState(() => dateParts(startOfToday()));
  useEffect(() => {
    if (!visible) return;
    const today = dateParts(startOfToday());
    setStart(today);
    setEnd(null);
    setFocus('start');
    setCursor(today);
  }, [visible]);
  const years = useMemo(() => {
    const last = startOfToday().getFullYear() + 1;
    return Array.from({ length: last - 2020 + 1 }, (_, index) => String(2020 + index));
  }, []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => pad(index + 1)), []);
  const days = useMemo(
    () => Array.from({ length: daysInMonth(cursor.y, cursor.m) }, (_, index) => pad(index + 1)),
    [cursor.m, cursor.y],
  );
  const applyCursor = (patch) => {
    const next = { ...cursor, ...patch };
    const maxDay = daysInMonth(next.y, next.m);
    if (Number(next.d) > maxDay) next.d = pad(maxDay);
    setCursor(next);
    if (focus === 'start') {
      setStart(next);
      setEnd(null);
    } else {
      setEnd(next);
    }
  };
  const chooseFocus = (nextFocus) => {
    if (nextFocus === 'end' && !start) return;
    const target = nextFocus === 'end' ? end || start : start;
    setFocus(nextFocus);
    if (nextFocus === 'end' && !end && start) setEnd(start);
    if (target) setCursor(target);
  };
  const chooseQuick = (key) => {
    const range = quickDateRange(key);
    if (!range) return;
    setStart(range.start);
    setEnd(range.end);
    setFocus('end');
    setCursor(range.end);
  };
  const activeQuick = ['today', 'yesterday', 'last7Days', 'last30Days'].find((key) => {
    const range = quickDateRange(key);
    return sameParts(range?.start, start) && sameParts(range?.end, end);
  });
  const confirmRange = () => {
    if (!end) {
      toast.warning(t('datePicker.selectEndDate'));
      return;
    }
    const startDate = new Date(Number(start.y), Number(start.m) - 1, Number(start.d));
    const endDate = new Date(Number(end.y), Number(end.m) - 1, Number(end.d));
    if (startDate > endDate) {
      toast.warning(t('datePicker.invalidRange'));
      return;
    }
    const maxDate = new Date(startDate);
    maxDate.setMonth(maxDate.getMonth() + 1);
    if (!activeQuick && endDate > maxDate) {
      toast.warning(t('datePicker.moreMonth'));
      return;
    }
    onConfirm({
      start: `${start.y}-${start.m}-${start.d}`,
      end: `${end.y}-${end.m}-${end.d}`,
      custom: true,
    });
  };
  const partText = (parts) => (parts ? `${parts.y}/${parts.m}/${parts.d}` : t('datePicker.tapToSelect'));
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetHead}>
        <Text style={styles.sheetTitle}>{t('datePicker.selectRange')}</Text>
        <Pressable onPress={onClose} hitSlop={s(8)}>
          <Text style={styles.sheetClose}>×</Text>
        </Pressable>
      </View>
      <View style={styles.quickRow}>
        {['today', 'yesterday', 'last7Days', 'last30Days'].map((key) => (
          <Pressable key={key} style={[styles.quickChip, activeQuick === key && styles.tabOn]} onPress={() => chooseQuick(key)}>
            <Text style={[styles.quickText, activeQuick === key && styles.tabTextOn]}>{t(`datePicker.${key}`)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.rangeFields}>
        <Pressable style={[styles.rangeField, focus === 'start' && styles.rangeFieldOn]} onPress={() => chooseFocus('start')}>
          <Text style={styles.rangeLabel}>{t('datePicker.startDate')}</Text>
          <Text style={styles.rangeValue}>{partText(start)}</Text>
        </Pressable>
        <Pressable style={[styles.rangeField, focus === 'end' && styles.rangeFieldOn, !start && styles.rangeFieldOff]} onPress={() => chooseFocus('end')}>
          <Text style={styles.rangeLabel}>{t('datePicker.endDate')}</Text>
          <Text style={styles.rangeValue}>{partText(end)}</Text>
        </Pressable>
      </View>
      <View style={styles.wheels}>
        <View pointerEvents="none" style={styles.wheelHighlight} />
        <WheelColumn items={years} value={cursor.y} onChange={(value) => applyCursor({ y: value })} />
        <WheelColumn items={months} value={cursor.m} onChange={(value) => applyCursor({ m: value })} />
        <WheelColumn items={days} value={cursor.d} onChange={(value) => applyCursor({ d: value })} />
      </View>
      <View style={styles.pickerActions}>
        <Pressable style={styles.pickerCancel} onPress={onClose}>
          <Text style={styles.pickerCancelText}>{t('datePicker.cancel')}</Text>
        </Pressable>
        <Pressable style={styles.pickerConfirm} onPress={confirmRange}>
          <Text style={styles.greenButtonText}>{t('datePicker.confirm')}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function FlowSlider({ value, max, onChange }) {
  const width = useRef(1);
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const apply = (x) => {
    const ratio = Math.min(Math.max(x / (width.current || 1), 0), 1);
    onChange(Math.round((ratio * max) / 100) * 100);
  };
  return (
    <View
      style={styles.slider}
      onLayout={(event) => {
        width.current = event.nativeEvent.layout.width;
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(event) => apply(event.nativeEvent.locationX)}
      onResponderMove={(event) => apply(event.nativeEvent.locationX)}>
      <View style={styles.sliderRail} />
      <View style={[styles.sliderFill, { width: `${progress * 100}%` }]} />
      <View style={[styles.sliderKnob, { left: `${progress * 100}%` }]} />
    </View>
  );
}

export function TeamScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const bodyRef = useRef(null);
  const [tab, setTab] = useState('overview');
  const [board, setBoard] = useState('today');
  const [stats, setStats] = useState(normalizeStats());
  const [levels, setLevels] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [memberQuery, setMemberQuery] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);
  const [rebates, setRebates] = useState([]);
  const [rebateTotal, setRebateTotal] = useState(0);
  const [rebateType, setRebateType] = useState('all');
  const [rebateRange, setRebateRange] = useState(monthRange);
  const [rebateLoading, setRebateLoading] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [flows, setFlows] = useState({ l1: 0, l2: 0, l3: 0 });
  const [editingFlow, setEditingFlow] = useState('');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [levelRulesOpen, setLevelRulesOpen] = useState(false);
  const [fissionOpen, setFissionOpen] = useState(false);
  const [treeWidth, setTreeWidth] = useState(0);
  const memberPage = useRef(1);
  const memberDone = useRef(false);
  const memberBusy = useRef(false);
  const rebatePage = useRef(1);
  const rebateDone = useRef(false);
  const rebateBusy = useRef(false);

  const inviteCode = user?.invitation_code || '--';
  const inviteLink = `${API_BASE_URL}/?invite=${encodeURIComponent(inviteCode === '--' ? '' : inviteCode)}&register=true`;
  const hasPayPassword = Number(user?.is_pay_password) === 0;
  const teamWagers = Number(user?.team?.wagers || 0);
  const teamCount = Number(user?.team?.count || 0);

  const selectTab = (next) => {
    setTab(next);
    bodyRef.current?.scrollTo({ y: 0, animated: false });
  };

  const copyText = async (value, success) => {
    const text = String(value || '');
    if (!text || text === '--') return;
    try {
      if (Platform.OS === 'web' && global.navigator?.clipboard?.writeText) {
        await global.navigator.clipboard.writeText(text);
        toast.success(success);
        return;
      }
      await Share.share({ message: text });
    } catch (error) {
      if (String(error?.message || '').includes('cancel')) return;
      toast.error(t('myTeam.copyFailed'));
    }
  };

  const shareTo = async (platform) => {
    const text = t('common.shareDefaultText');
    const url =
      platform === 'telegram'
        ? `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(`${text} ${inviteLink}`)}`;
    try {
      await Linking.openURL(url);
    } catch {
      await copyText(`${text} ${inviteLink}`, t('common.shareFallbackHint'));
    }
  };

  const loadStats = useCallback(async (dashboardTab) => {
    try {
      const result = await getTeamStatistics({ partition_date: dashboardRange(dashboardTab) });
      setStats(normalizeStats(result?.data ?? result ?? {}));
    } catch (error) {
      console.error('Get team statistics failed:', error);
      setStats(normalizeStats());
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      useUserStore.getState().fetchUserInfo?.().catch(() => {});
    }, []),
  );

  useEffect(() => {
    let alive = true;
    setOverviewLoading(true);
    Promise.all([getAgentList().catch(() => []), loadStats(board)])
      .then(([result]) => {
        if (!alive) return;
        const rows = normalizeList(result).list;
        const source = rows.length ? rows : Array.isArray(result) ? result : [];
        setLevels([...source].sort((a, b) => Number(a.level_number) - Number(b.level_number)));
      })
      .finally(() => {
        if (alive) setOverviewLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [board, loadStats]);

  useEffect(() => {
    if (!levels.length || selectedLevelId) return;
    const current = levels.find((item) => Number(item.id) === Number(user?.agent_level));
    setSelectedLevelId(String((current || levels[0]).id));
  }, [levels, selectedLevelId, user?.agent_level]);

  const loadMembers = useCallback(async (refresh = false) => {
    if (memberBusy.current) return;
    if (!refresh && memberDone.current) return;
    const page = refresh ? 1 : memberPage.current;
    memberBusy.current = true;
    setMembersLoading(true);
    try {
      const result = await getTeamList({ page, page_size: PAGE_SIZE });
      const { list, total } = normalizeList(result);
      const mapped = list.map((item) => ({
        id: item.id,
        name: item.nickname || '--',
        uid: String(item.id || ''),
        registerTime: item.register_at || '--',
        level: Number(item.agent_level || 0),
        levelLabel: memberLevelLabel(item.agent_level, t),
      }));
      setMemberTotal(total);
      setMembers((current) => {
        const next = refresh ? mapped : [...current, ...mapped];
        memberDone.current = (total > 0 && next.length >= total) || mapped.length < PAGE_SIZE;
        return next;
      });
      if (!memberDone.current) memberPage.current = page + 1;
    } catch (error) {
      console.error('Get team list failed:', error);
      if (refresh) {
        setMembers([]);
        setMemberTotal(0);
        memberDone.current = true;
      }
    } finally {
      memberBusy.current = false;
      setMembersLoading(false);
    }
  }, [t]);

  const loadRebates = useCallback(async (refresh = false) => {
    if (rebateBusy.current) return;
    if (!refresh && rebateDone.current) return;
    const page = refresh ? 1 : rebatePage.current;
    rebateBusy.current = true;
    setRebateLoading(true);
    try {
      const result = await getBillList({
        page,
        page_size: PAGE_SIZE,
        partition_date: `${rebateRange.start}_${rebateRange.end}`,
        detail_type: rebateType === 'all' ? '' : rebateType,
        change: '',
      });
      const { list, total } = normalizeList(result);
      const mapped = list.map((item) => {
        const value = Number(item.balance || 0);
        const signed = Number(item.change) === 1 ? value : -value;
        const type = Number(item.detail_type || item.type || 0);
        return {
          id: item.id,
          title: item.title || t(BILL_TITLE[type] || 'myTeam.rebateRecords'),
          detail: item.remarks || `₹ ${Number(item.before || 0).toFixed(2)} → ₹ ${Number(item.after || 0).toFixed(2)}`,
          time: item.created_at || item.partition_date || '--',
          amount: `${signed >= 0 ? '+' : '-'} ₹ ${formatMoney(Math.abs(signed))}`,
          value: signed,
        };
      });
      setRebateTotal(total);
      setRebates((current) => {
        const next = refresh ? mapped : [...current, ...mapped];
        rebateDone.current = (total > 0 && next.length >= total) || mapped.length < PAGE_SIZE;
        return next;
      });
      if (!rebateDone.current) rebatePage.current = page + 1;
    } catch (error) {
      console.error('Get bill list failed:', error);
      if (refresh) {
        setRebates([]);
        setRebateTotal(0);
        rebateDone.current = true;
      }
    } finally {
      rebateBusy.current = false;
      setRebateLoading(false);
    }
  }, [rebateRange.end, rebateRange.start, rebateType, t]);

  useEffect(() => {
    if (tab !== 'members' || members.length || memberDone.current) return;
    memberPage.current = 1;
    memberDone.current = false;
    loadMembers(true);
  }, [loadMembers, members.length, tab]);

  useEffect(() => {
    if (tab !== 'rebate') return;
    rebatePage.current = 1;
    rebateDone.current = false;
    loadRebates(true);
  }, [loadRebates, tab]);

  const filteredMembers = useMemo(() => {
    const keyword = memberQuery.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((member) => member.name.toLowerCase().includes(keyword) || member.uid.includes(keyword));
  }, [memberQuery, members]);

  const levelStats = [
    { id: 'direct', label: t('myTeam.memberLevelDirect'), value: members.filter((member) => member.level === 1).length },
    { id: 'level-2', label: t('myTeam.memberLevel2'), value: members.filter((member) => member.level === 2).length },
    { id: 'level-3', label: t('myTeam.memberLevel3'), value: members.filter((member) => member.level === 3).length },
  ];

  const selectedLevel = levels.find((item) => String(item.id) === String(selectedLevelId)) || levels[0];
  const currentLevel = levels.find((item) => Number(item.id) === Number(user?.agent_level));
  const rates = [
    { key: 'l1', chip: t('myTeam.calculator.flowL1'), rate: Number(selectedLevel?.team_l1 || 0) },
    { key: 'l2', chip: t('myTeam.calculator.flowL2'), rate: Number(selectedLevel?.team_l2 || 0) },
    { key: 'l3', chip: t('myTeam.calculator.flowL3'), rate: Number(selectedLevel?.team_l3 || 0) },
  ];
  const baseIncome = rates.reduce((sum, item) => sum + (Number(flows[item.key] || 0) * item.rate) / 100, 0);
  const upgradeReward = Number(selectedLevel?.level_reward || 0);
  const settledMonth = rebates.reduce((sum, item) => sum + (item.value > 0 ? item.value : 0), 0);

  const statCards = [
    { id: 'pending', label: t('myTeam.pendingCommission'), value: `₹ ${formatAmount(stats.team_commission)}`, icon: pendingIcon },
    { id: 'invited', label: t('myTeam.invitedSuccess'), value: formatAmount(stats.team_count), icon: invitedIcon },
    { id: 'active', label: t('myTeam.activePlayers'), value: formatAmount(stats.team_recharge), icon: activeIcon },
    { id: 'turnover', label: t('myTeam.teamTurnover'), value: `₹ ${formatAmount(stats.team_wagers)}`, icon: turnoverIcon },
    { id: 'earned', label: t('myTeam.earnedCommission'), value: `₹ ${formatAmount(stats.team_commission_settled)}`, icon: earnedIcon },
  ];

  const openWithdraw = () => {
    if (!hasPayPassword) {
      setPasswordPrompt(true);
      return;
    }
    setAmount('');
    setPassword('');
    setShowPassword(false);
    setWithdrawOpen(true);
  };

  const submitTransfer = async () => {
    const raw = String(amount || '').trim();
    const value = Number(raw);
    const available = Number(user?.commission || 0);
    if (!raw || !Number.isFinite(value) || value <= 0) {
      toast.warning(t('myTeam.withdrawAmountPlaceholder'));
      return;
    }
    if (value > available) {
      toast.warning(t('myTeam.withdrawAmountExceeds'));
      return;
    }
    if (!String(password || '').trim()) {
      toast.warning(t('withdrawDetail.enterTransactionPasswordRequired'));
      return;
    }
    setTransferring(true);
    try {
      const result = await postWalletTransfer({ amount: raw, pay_password: String(password).trim() });
      const apiBalance = result?.balance ?? result?.current_balance ?? result?.wallet_balance;
      if (apiBalance !== undefined && apiBalance !== null) useUserStore.getState().updateBalance(Number(apiBalance));
      const current = useUserStore.getState().userInfo;
      if (current) {
        useUserStore.getState().setUserInfo({
          ...current,
          commission: Number(Math.max(0, Number(current.commission || 0) - value).toFixed(2)),
        });
      }
      setWithdrawOpen(false);
      toast.success(t('myTeam.transferSuccess'));
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setTransferring(false);
    }
  };

  const onScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y < contentSize.height - s(80)) return;
    if (tab === 'members') loadMembers(false);
    if (tab === 'rebate') loadRebates(false);
  };

  const monthText = (start) => new Date(`${start}T00:00:00`).toLocaleDateString('en', { month: 'short', year: 'numeric' });
  const prettyDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en', { month: 'short', day: '2-digit', year: 'numeric' });
  const rangeLabel = rebateRange.custom ? `${prettyDate(rebateRange.start)} - ${prettyDate(rebateRange.end)}` : monthText(rebateRange.start);

  const notes = t('myTeam.settlementNotes');
  const settlementNotes = Array.isArray(notes) ? notes : [];

  return (
    <Screen>
      <PageHeader title={t('myTeam.title')} onBack={() => router.back()} />
      <View style={styles.tabWrap}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}>
          {[
            ['overview', t('myTeam.tabOverview')],
            ['members', t('myTeam.tabMembers')],
            ['rebate', t('myTeam.tabRebate')],
            ['calculator', t('myTeam.tabCalculator')],
            ['commission', t('myTeam.tabCommission')],
          ].map(([id, label]) => (
            <Pressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => selectTab(id)}>
              <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView ref={bodyRef} style={styles.body} contentContainerStyle={styles.page} onScroll={onScroll} scrollEventThrottle={16}>
        {tab === 'overview' ? (
          overviewLoading && !levels.length ? (
            <ActivityIndicator color={colors.accent} style={styles.spinner} />
          ) : (
            <>
              <View style={styles.card}>
                <View style={styles.profile}>
                  <ProfileAvatar uri={user?.avatar} />
                  <View style={styles.profileCopy}>
                    <Text style={styles.name} numberOfLines={1}>{user?.nickname || '--'}</Text>
                    <Text style={styles.meta}>{t('myTeam.upperUid')}: {user?.superior_uid || t('myTeam.noSuperior')}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>{t('myTeam.currentCommission')} (INR)</Text>
                <Text style={styles.commission}>₹{formatAmount(user?.commission || 0)}</Text>
                <View style={styles.metric}>
                  <Text style={styles.meta}>{t('myTeam.teamBetTurnover')}</Text>
                  <Text style={styles.metricValue}>₹{formatAmount(teamWagers)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.meta}>{t('myTeam.teamMembers')}</Text>
                  <Text style={styles.metricValue}>{formatAmount(teamCount)}</Text>
                </View>
                <Pressable style={styles.greenButton} onPress={openWithdraw}>
                  <Text style={styles.greenButtonText}>{t('myTeam.transferCommission')}</Text>
                </Pressable>
              </View>

              <Pressable style={styles.card} onPress={() => router.push('/refer-bonus')}>
                <Text style={styles.bannerTitle}>
                  {t('myTeam.shareAndEarn')} <Text style={styles.bannerStrong}>50000K</Text>
                </Text>
                <Text style={styles.meta}>{t('myTeam.inviteFriendsSubtitle')}</Text>
              </Pressable>

              <Text style={styles.section}>{t('myTeam.dashboard')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardRow}>
                {[
                  ['today', t('myTeam.today')],
                  ['yesterday', t('myTeam.yesterday')],
                  ['week', t('myTeam.week')],
                  ['total', t('myTeam.total')],
                ].map(([id, label]) => (
                  <Pressable key={id} style={[styles.boardTab, board === id && styles.tabOn]} onPress={() => setBoard(id)}>
                    <Text style={[styles.boardText, board === id && styles.tabTextOn]}>{label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.stats}>
                {statCards.map((card) => (
                  <View key={card.id} style={styles.stat}>
                    <Image source={card.icon} style={styles.statIcon} contentFit="contain" />
                    <View style={styles.statCopy}>
                      <Text style={styles.meta}>{card.label}</Text>
                      <Text style={styles.statValue}>{card.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <Text style={styles.blockTitle}>{t('myTeam.inviteQrCode')}</Text>
                <View style={styles.qrRow}>
                  <View style={styles.qrGlass}>
                    <InviteQr value={inviteCode === '--' ? '' : inviteLink} size={s(65)} />
                  </View>
                  <View style={styles.qrFields}>
                    <Text style={styles.meta}>{t('myTeam.qrCaption')}</Text>
                    <Pressable onPress={() => copyText(inviteCode, t('myTeam.inviteCodeCopied'))}>
                      <Text style={styles.copyLine} numberOfLines={1}>{t('myTeam.inviteCodeLabel')} · {inviteCode}</Text>
                    </Pressable>
                    <Text style={styles.meta}>{t('myTeam.shareLinkLabel')}</Text>
                    <Pressable onPress={() => copyText(inviteLink, t('myTeam.inviteLinkCopied'))}>
                      <Text style={styles.linkValue} numberOfLines={2}>{inviteLink}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              <View style={styles.socialRow}>
                {[
                  ['download', 'Download', shareDownload],
                  ['whatsapp', 'WhatsApp', shareWhatsapp],
                  ['telegram', 'Telegram', shareTelegram],
                ].map(([id, label, icon]) => (
                  <Pressable
                    key={id}
                    style={styles.social}
                    onPress={() => (id === 'download' ? copyText(inviteLink, t('common.shareFallbackHint')) : shareTo(id))}>
                    <Image source={icon} style={styles.socialIcon} contentFit="contain" />
                    <Text style={styles.socialText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.greenButton} onPress={() => setPosterOpen(true)}>
                <Text style={styles.greenButtonText}>{t('myTeam.generatePoster')}</Text>
              </Pressable>
            </>
          )
        ) : null}

        {tab === 'members' ? (
          <>
            <View style={styles.search}>
              <SvgXml xml={searchIcon} width={s(24)} height={s(24)} />
              <TextInput
                value={memberQuery}
                onChangeText={setMemberQuery}
                placeholder={t('myTeam.searchMembers')}
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>
            <View style={styles.metric}>
              <Text style={styles.meta}>{t('myTeam.teamMembers')}</Text>
              <Text style={styles.metricValue}>{t('myTeam.membersTotal', { count: memberTotal })}</Text>
            </View>
            <View style={styles.levelStats}>
              {levelStats.map((item) => (
                <View key={item.id} style={styles.levelStat}>
                  <Text style={styles.levelStatLabel} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.levelStatValue}>{item.value}</Text>
                </View>
              ))}
            </View>
            {membersLoading && !members.length ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
            {filteredMembers.map((member) => (
              <View key={member.id} style={styles.member}>
                <Text style={styles.blockTitle}>{member.name}</Text>
                <Text style={styles.accentText}>{member.levelLabel}</Text>
                <Text style={styles.meta}>{t('myTeam.uid')}: {member.uid}</Text>
                <Text style={styles.meta}>{t('myTeam.registerTime')}: {member.registerTime}</Text>
              </View>
            ))}
            {!membersLoading && !filteredMembers.length ? <EmptyState label={t('common.noData')} /> : null}
            {membersLoading && members.length ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
            {!membersLoading && filteredMembers.length && memberDone.current ? <Text style={styles.finished}>{t('common.noMoreData')}</Text> : null}
          </>
        ) : null}

        {tab === 'rebate' ? (
          <>
            <View style={styles.card}>
              <View style={styles.metric}>
                <Pressable style={styles.monthField} onPress={() => setRangeOpen(true)}>
                  <SvgXml xml={calendarIcon} width={s(12)} height={s(12)} />
                  <Text style={styles.monthText}>{rangeLabel}</Text>
                  <SvgXml xml={chevronIcon} width={s(10)} height={s(10)} />
                </Pressable>
                <Text style={styles.settled}>+ ₹ {formatMoney(settledMonth)}</Text>
              </View>
              <Text style={styles.meta}>{t('myTeam.settledThisMonth')}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardRow}>
              {REBATE_TYPES.map((item) => (
                <Pressable key={item.id} style={[styles.boardTab, rebateType === item.id && styles.tabOn]} onPress={() => setRebateType(item.id)}>
                  <Text style={[styles.boardText, rebateType === item.id && styles.tabTextOn]}>{t(item.labelKey)}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.metric}>
              <Text style={styles.meta}>{t('myTeam.rebateRecords')}</Text>
              <Text style={styles.metricValue}>{t('myTeam.rebateRecordCount', { count: rebateTotal })}</Text>
            </View>
            {rebateLoading && !rebates.length ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
            {rebates.map((record) => (
              <View key={record.id} style={styles.member}>
                <Text style={styles.blockTitle}>{record.title} · {record.amount}</Text>
                <Text style={styles.accentText}>{t('myTeam.settled')}</Text>
                <Text style={styles.meta}>{record.detail}</Text>
                <Text style={styles.meta}>{record.time}</Text>
              </View>
            ))}
            {!rebateLoading && !rebates.length ? <EmptyState label={t('common.noData')} /> : null}
            {rebates.length ? (
              <View style={styles.notice}>
                <Text style={styles.noticeTitle}>{t('myTeam.rebateSettlementTitle')}</Text>
                <Text style={styles.meta}>{t('myTeam.rebateSettlementBody')}</Text>
              </View>
            ) : null}
          </>
        ) : null}

        {tab === 'calculator' ? (
          <>
            <Text style={styles.blockTitle}>{t('myTeam.calculator.selectLevel')}</Text>
            <Text style={styles.meta}>{t('myTeam.calculator.currentLevel', { level: currentLevel?.level_name || '--' })}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardRow}>
              {levels.map((level) => (
                <Pressable
                  key={level.id}
                  style={[styles.boardTab, String(selectedLevelId) === String(level.id) && styles.tabOn]}
                  onPress={() => setSelectedLevelId(String(level.id))}>
                  <Text style={[styles.boardText, String(selectedLevelId) === String(level.id) && styles.tabTextOn]}>{level.level_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {rates.map((item) => (
              <View key={item.key} style={styles.sliderBlock}>
                <Text style={styles.sliderLabel}>{item.chip}</Text>
                <View style={styles.amountBox}>
                  <Text style={styles.amountCurrency}>₹</Text>
                  <TextInput
                    value={editingFlow === item.key ? String(flows[item.key] || 0) : formatAmount(flows[item.key] || 0)}
                    onFocus={() => setEditingFlow(item.key)}
                    onBlur={() => setEditingFlow('')}
                    onChangeText={(text) => {
                      const digits = String(text || '').replace(/\D/g, '');
                      setFlows((current) => ({ ...current, [item.key]: Math.min(Number(digits || 0), CALCULATOR_MAX) }));
                    }}
                    keyboardType="number-pad"
                    style={styles.amountInput}
                  />
                </View>
                <FlowSlider
                  value={Number(flows[item.key] || 0)}
                  max={CALCULATOR_MAX}
                  onChange={(next) => setFlows((current) => ({ ...current, [item.key]: next }))}
                />
                <View style={styles.scaleRow}>
                  <Text style={styles.scaleText}>0</Text>
                  <Text style={styles.scaleText}>{formatAmount(CALCULATOR_MAX)}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.blockTitle}>{t('myTeam.calculator.currentLevelRate')}</Text>
            <View style={styles.rateTable}>
              {[t('myTeam.calculator.level'), t('myTeam.calculator.flowL1'), t('myTeam.calculator.flowL2'), t('myTeam.calculator.flowL3')].map((label) => (
                <Text key={label} style={styles.rateHead}>{label}</Text>
              ))}
              <Text style={styles.rateCell}>{selectedLevel?.level_name || '--'}</Text>
              {rates.map((item) => (
                <Text key={item.key} style={styles.rateCell}>{item.rate.toFixed(2)}%</Text>
              ))}
            </View>
            <View style={styles.card}>
              <Text style={styles.meta}>{t('myTeam.calculator.estimatedWeeklyIncomeWithReward')}</Text>
              <Text style={styles.commission}>₹ {formatAmount(baseIncome + upgradeReward)}</Text>
              <Text style={styles.meta}>{t('myTeam.calculator.includingUpgradeReward')}：₹ {formatAmount(upgradeReward)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.meta}>{t('myTeam.calculatorTip')}</Text>
            </View>
          </>
        ) : null}

        {tab === 'commission' ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{t('myTeam.partnerPlan')}</Text>
                <Text style={styles.heroTitle}>{t('myTeam.guideCommissionTitle')}</Text>
                <Text style={styles.heroDesc}>{t('myTeam.guideWeeklySettlement')}</Text>
                <Text style={styles.heroDesc}>{t('myTeam.guideTransferHint')}</Text>
              </View>
              <Image source={partnerArt} style={styles.heroArt} contentFit="contain" />
            </View>
            <View style={styles.sectionHead}>
              <Text style={styles.blockTitle}>{t('myTeam.howToEarn')}</Text>
              <Pressable style={styles.infoDot} onPress={() => setLevelRulesOpen(true)}>
                <Text style={styles.infoDotText}>i</Text>
              </Pressable>
            </View>
            {['inviteCode', 'inviteMembers', 'weeklyIncome'].map((key) => (
              <View key={key} style={styles.notice}>
                <Text style={styles.noticeTitle}>{t(`myTeam.commissionHighlights.${key}.title`)}</Text>
                <Text style={styles.meta}>{t(`myTeam.commissionHighlights.${key}.desc`)}</Text>
              </View>
            ))}
            <View style={styles.sectionHead}>
              <Text style={styles.blockTitle}>{t('myTeam.multiLevelFission')}</Text>
              <Pressable style={styles.infoDot} onPress={() => setFissionOpen(true)}>
                <Text style={styles.infoDotText}>i</Text>
              </Pressable>
            </View>
            <View style={styles.tree}>
              <Text style={styles.meta}>{t('myTeam.fissionTitle')}</Text>
              <View style={styles.treeBody} onLayout={(event) => setTreeWidth(event.nativeEvent.layout.width)}>
              <View style={styles.treeYou}>
                <Image source={avatarYou} style={styles.youAvatar} contentFit="cover" />
                <Text style={styles.treeName}>{t('myTeam.you')}</Text>
              </View>
              {treeWidth > 0 ? <SvgXml xml={rootConnector} width={treeWidth} height={(treeWidth * 76) / 638} /> : null}
              <View style={[styles.treePair, { gap: treeWidth * 0.02508 }]}>
                {[[avatarA, t('myTeam.userA')], [avatarB, t('myTeam.userB')]].map(([source, name]) => (
                  <View key={name} style={styles.treeMember}>
                    <Image source={source} style={styles.memberAvatar} contentFit="cover" />
                    <View>
                      <Text style={styles.treeName}>{name}</Text>
                      <Text style={styles.treeLevel}>{t('myTeam.l1Member')}</Text>
                    </View>
                  </View>
                ))}
              </View>
              {treeWidth > 0 ? <SvgXml xml={levelConnector} width={treeWidth} height={(treeWidth * 32) / 638} /> : null}
              <View style={[styles.treeLeaves, { gap: treeWidth * 0.01881 }]}>
                {[
                  [avatarC, t('myTeam.userC'), t('myTeam.l2Member')],
                  [avatarD, t('myTeam.userD'), t('myTeam.l2Member')],
                  [avatarE, t('myTeam.userE'), t('myTeam.l3Member')],
                  [avatarF, t('myTeam.userF'), t('myTeam.l3Member')],
                ].map(([source, name, level]) => (
                  <View key={name} style={styles.leaf}>
                    <Image source={source} style={styles.memberAvatar} contentFit="cover" />
                    <Text style={styles.treeName}>{name}</Text>
                    <Text style={styles.treeLevel}>{level}</Text>
                  </View>
                ))}
              </View>
              </View>
              <Pressable onPress={() => setFissionOpen(true)}>
                <Text style={styles.rulesLink}>{t('myTeam.viewDetailedRules')}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>

      <BottomSheet visible={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>{t('myTeam.transferCommission')}</Text>
          <Pressable onPress={() => setWithdrawOpen(false)} hitSlop={s(8)}>
            <Text style={styles.sheetClose}>×</Text>
          </Pressable>
        </View>
        <Text style={styles.noticeTitle}>{t('myTeam.withdrawNoticeTitle')}</Text>
        <Text style={styles.meta}>{t('myTeam.withdrawSubtitle')}</Text>
        <Text style={styles.available}>₹ {formatMoney(user?.commission || 0)}</Text>
        <Text style={styles.meta}>{t('myTeam.withdrawAvailable')}</Text>
        <Text style={styles.fieldLabel}>{t('myTeam.withdrawAmountLabel')}</Text>
        <View style={styles.amountBox}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder={t('myTeam.withdrawAmountPlaceholder')}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={styles.amountInput}
          />
          <Pressable onPress={() => setAmount(String(Number(user?.commission || 0)))}>
            <Text style={styles.accentText}>{t('myTeam.withdrawAllShort')}</Text>
          </Pressable>
        </View>
        <Text style={styles.fieldLabel}>{t('myTeam.transactionPassword')}</Text>
        <View style={styles.amountBox}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('myTeam.withdrawPasswordPlaceholder')}
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            style={styles.amountInput}
          />
          <Pressable onPress={() => setShowPassword((current) => !current)}>
            <Text style={styles.accentText}>{showPassword ? t('myTeam.hidePassword') : t('myTeam.showPassword')}</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>{t('myTeam.withdrawTip')}</Text>
        <PrimaryButton label={t('myTeam.transferCommission')} loading={transferring} onPress={submitTransfer} />
      </BottomSheet>

      <ConfirmSheet
        visible={passwordPrompt}
        title={t('withdrawMethod.setTransactionPasswordTitle')}
        message={t('withdrawMethod.setTransactionPasswordMessage')}
        confirmText={t('withdrawMethod.setTransactionPasswordAction')}
        cancelText={t('common.close')}
        onConfirm={() => {
          setPasswordPrompt(false);
          router.push('/change-transaction-password');
        }}
        onClose={() => setPasswordPrompt(false)}
      />

      <RebateRangeSheet
        visible={rangeOpen}
        onClose={() => setRangeOpen(false)}
        onConfirm={(range) => {
          setRebateRange(range);
          setRangeOpen(false);
        }}
      />

      <BottomSheet visible={posterOpen} onClose={() => setPosterOpen(false)}>
        <Text style={styles.sheetTitle}>{t('myTeam.generatePoster')}</Text>
        <View style={styles.posterQr}>
          <InviteQr value={inviteCode === '--' ? '' : inviteLink} size={s(160)} />
        </View>
        <Text style={styles.meta}>{t('myTeam.inviteCodeLabel')} · {inviteCode}</Text>
        <Text style={styles.linkValue}>{inviteLink}</Text>
        <PrimaryButton label={t('myTeam.copyLink')} onPress={() => copyText(inviteLink, t('myTeam.inviteLinkCopied'))} />
        <PrimaryButton label="WhatsApp" variant="outline" onPress={() => shareTo('whatsapp')} />
      </BottomSheet>

      <BottomSheet visible={levelRulesOpen} onClose={() => setLevelRulesOpen(false)}>
        <ScrollView style={styles.sheetScroll}>
          <Text style={styles.sheetTitle}>{t('myTeam.levelUpgradeTitle')}</Text>
          <Text style={styles.meta}>{t('myTeam.levelUpRequirements')}</Text>
          {levels.map((level) => (
            <View key={level.id} style={styles.ruleRow}>
              <Text style={styles.noticeTitle}>{level.level_name || '--'}</Text>
              <Text style={styles.meta}>{t('myTeam.teamTurnoverHeader')} {requirementText(level.team_turnover, t('myTeam.noRequirement'))}</Text>
              <Text style={styles.meta}>{t('myTeam.teamMembersHeader')} {requirementText(level.team_member_count, t('myTeam.noRequirement'))}</Text>
              <Text style={styles.meta}>{t('myTeam.levelIncomeHeader')} {requirementText(level.level_reward, '-')}</Text>
              <Text style={styles.meta}>{t('myTeam.rebateL1Header')} {rateText(level.team_l1)} · {t('myTeam.rebateL2Header')} {rateText(level.team_l2)} · {t('myTeam.rebateL3Header')} {rateText(level.team_l3)}</Text>
            </View>
          ))}
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={fissionOpen} onClose={() => setFissionOpen(false)}>
        <ScrollView style={styles.sheetScroll}>
          <Text style={styles.sheetTitle}>{t('myTeam.referralSettlementRules')}</Text>
          {['intro', 'level1', 'level2', 'level3', 'summary'].map((key) => (
            <Text key={key} style={styles.ruleParagraph}>{t(`myTeam.fissionNotes.${key}`)}</Text>
          ))}
          <Text style={styles.noticeTitle}>{t('myTeam.settlementRules')}</Text>
          {settlementNotes.map((note) => (
            <Text key={note} style={styles.ruleParagraph}>{note}</Text>
          ))}
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabWrap: { height: s(44), marginHorizontal: s(12), marginBottom: s(12) },
  tabScroll: { flexGrow: 0 },
  tabRow: { gap: s(6) },
  body: { flex: 1 },
  tab: { flexShrink: 0, height: s(44), paddingHorizontal: s(16), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontSize: s(14), fontWeight: '600' },
  tabTextOn: { color: colors.accentInk },
  page: { paddingHorizontal: s(12), paddingBottom: s(30), gap: s(12) },
  spinner: { marginTop: s(24) },
  card: { padding: s(12), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: s(8) },
  profile: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  avatarClip: { width: s(36), height: s(36), borderRadius: s(18), overflow: 'hidden', backgroundColor: '#292f38' },
  avatarPhoto: { width: '100%', height: '100%' },
  qrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: s(12) },
  qrGlass: { width: s(79), height: s(79), padding: s(4), borderRadius: s(6), backgroundColor: '#f5f6fa', alignItems: 'center', justifyContent: 'center' },
  qrFields: { flex: 1, minWidth: 0, gap: s(4) },
  posterQr: { width: s(168), height: s(168), borderRadius: s(6), backgroundColor: '#f5f6fa', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  profileCopy: { flex: 1, gap: s(3) },
  name: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  meta: { color: colors.muted, fontSize: s(12), lineHeight: s(16) },
  commission: { color: colors.text, fontSize: s(22), lineHeight: s(26), fontWeight: '700' },
  metric: { minHeight: s(18), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(12) },
  metricValue: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  greenButton: { height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 ${colors.accentShadow}` },
  greenButtonText: { color: colors.accentInk, fontSize: s(14), fontWeight: '600' },
  bannerTitle: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  bannerStrong: { fontSize: s(18), fontWeight: '700' },
  section: { color: colors.text, fontSize: s(18), lineHeight: s(24), fontWeight: '700' },
  boardRow: { gap: s(6) },
  boardTab: { minWidth: s(83), height: s(36), paddingHorizontal: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  boardText: { color: colors.muted, fontSize: s(13) },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(8) },
  stat: { width: '48.5%', minHeight: s(72), padding: s(10), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: s(8) },
  statIcon: { width: s(28), height: s(28) },
  statCopy: { flex: 1, gap: s(4) },
  statValue: { color: colors.text, fontSize: s(16), lineHeight: s(20), fontWeight: '700' },
  blockTitle: { color: colors.text, fontSize: s(14), lineHeight: s(18), fontWeight: '700' },
  copyLine: { color: colors.text, fontSize: s(12), lineHeight: s(16), fontWeight: '600' },
  fieldGap: { marginTop: s(4) },
  linkValue: { color: colors.accent, fontSize: s(12), lineHeight: s(16) },
  socialRow: { flexDirection: 'row', gap: s(6) },
  social: { flex: 1, height: s(48), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(4) },
  socialIcon: { width: s(16), height: s(16) },
  socialText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  search: { height: s(48), paddingHorizontal: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: s(6) },
  searchInput: { flex: 1, color: colors.text, fontSize: s(14), padding: 0 },
  levelStats: { flexDirection: 'row', gap: s(6) },
  levelStat: { flex: 1, padding: s(8), borderRadius: s(6), backgroundColor: colors.surface, gap: s(6) },
  levelStatLabel: { color: colors.text, fontSize: s(12), lineHeight: s(16) },
  levelStatValue: { color: colors.text, fontSize: s(14), lineHeight: s(18), fontWeight: '700' },
  member: { padding: s(8), borderRadius: s(6), backgroundColor: colors.surface, gap: s(6) },
  accentText: { color: colors.accent, fontSize: s(12), lineHeight: s(16) },
  finished: { color: colors.muted, fontSize: s(12), textAlign: 'center' },
  monthField: { height: s(32), flexDirection: 'row', alignItems: 'center', gap: s(6) },
  monthText: { color: colors.muted, fontSize: s(13) },
  settled: { color: '#70d89b', fontSize: s(14), fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: s(6) },
  quickChip: { flex: 1, height: s(36), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  quickText: { color: colors.muted, fontSize: s(12) },
  rangeFields: { flexDirection: 'row', gap: s(8) },
  rangeField: { flex: 1, padding: s(10), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: '#292f38', gap: s(4) },
  rangeFieldOn: { borderColor: colors.accent },
  rangeFieldOff: { opacity: 0.55 },
  rangeLabel: { color: colors.muted, fontSize: s(11) },
  rangeValue: { color: colors.text, fontSize: s(13) },
  wheels: { height: s(108), flexDirection: 'row', alignItems: 'center' },
  wheelHighlight: { position: 'absolute', left: 0, right: 0, height: s(36), borderRadius: s(6), backgroundColor: '#292f38' },
  wheelCol: { flex: 1, height: s(108) },
  wheelItem: { alignItems: 'center', justifyContent: 'center' },
  wheelText: { color: colors.muted, fontSize: s(13) },
  wheelTextOn: { color: colors.accent, fontSize: s(13), fontWeight: '600' },
  pickerActions: { flexDirection: 'row', gap: s(8) },
  pickerCancel: { flex: 1, height: s(48), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  pickerCancelText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  pickerConfirm: { flex: 1, height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 ${colors.accentShadow}` },
  notice: { padding: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: s(6) },
  noticeTitle: { color: colors.text, fontSize: s(12), lineHeight: s(16), fontWeight: '600' },
  sliderBlock: { gap: s(6) },
  sliderLabel: { color: colors.text, fontSize: s(12), lineHeight: s(16), fontWeight: '600' },
  amountBox: { height: s(36), paddingHorizontal: s(10), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: s(4) },
  amountCurrency: { color: colors.text, fontSize: s(13) },
  amountInput: { flex: 1, color: colors.text, fontSize: s(13), padding: 0 },
  slider: { height: s(22), justifyContent: 'center' },
  sliderRail: { height: s(6), borderRadius: s(3), backgroundColor: '#292f38' },
  sliderFill: { position: 'absolute', left: 0, height: s(6), borderRadius: s(3), backgroundColor: colors.accent },
  sliderKnob: { position: 'absolute', width: s(14), height: s(14), marginLeft: -s(7), borderRadius: s(7), backgroundColor: colors.text, borderWidth: s(2), borderColor: colors.accent },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { color: '#fff', fontSize: s(11), lineHeight: s(14) },
  rateTable: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: s(6), overflow: 'hidden' },
  rateHead: { width: '25%', minHeight: s(42), padding: s(4), backgroundColor: colors.surface, color: colors.muted, fontSize: s(11), lineHeight: s(14), textAlign: 'center' },
  rateCell: { width: '25%', minHeight: s(42), marginTop: s(2), padding: s(4), backgroundColor: '#292f38', color: colors.text, fontSize: s(11), lineHeight: s(14), textAlign: 'center' },
  hero: { height: s(135), padding: s(12), paddingHorizontal: s(16), borderRadius: s(10), overflow: 'hidden', backgroundColor: '#111533', flexDirection: 'row' },
  heroCopy: { flex: 1, gap: s(4), paddingRight: s(8) },
  heroEyebrow: { color: colors.text, fontSize: s(12), lineHeight: s(16), fontWeight: '700' },
  heroTitle: { color: colors.accent, fontSize: s(17), lineHeight: s(19), fontWeight: '700' },
  heroDesc: { color: colors.text, fontSize: s(11), lineHeight: s(14) },
  heroArt: { width: s(100), height: s(100) },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  infoDot: { width: s(20), height: s(20), borderRadius: s(10), borderWidth: 1, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  infoDotText: { color: colors.muted, fontSize: s(12), fontWeight: '700' },
  tree: { padding: s(12), borderRadius: s(10), borderWidth: 1, borderColor: 'rgba(58, 65, 77, 0.75)', backgroundColor: '#252d2a', gap: s(12) },
  treeBody: { width: '100%' },
  treeYou: { alignItems: 'center', gap: s(4) },
  youAvatar: { width: s(48), height: s(48), borderRadius: s(24), borderWidth: 1, borderColor: colors.accent },
  treeName: { color: colors.text, fontSize: s(12), fontWeight: '600' },
  treeLevel: { color: colors.muted, fontSize: s(10), lineHeight: s(14) },
  treePair: { flexDirection: 'row' },
  treeMember: { flex: 1, minHeight: s(62), padding: s(8), borderRadius: s(10), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: s(8) },
  memberAvatar: { width: s(32), height: s(32), borderRadius: s(16), borderWidth: 1, borderColor: colors.line },
  treeLeaves: { flexDirection: 'row' },
  leaf: { flex: 1, minHeight: s(72), paddingVertical: s(8), paddingHorizontal: s(4), borderRadius: s(10), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', gap: s(2) },
  rulesLink: { color: colors.accent, fontSize: s(12), fontWeight: '600', textAlign: 'center' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  sheetClose: { color: colors.muted, fontSize: s(24), lineHeight: s(24) },
  available: { color: colors.text, fontSize: s(22), fontWeight: '700' },
  fieldLabel: { color: colors.text, fontSize: s(12), fontWeight: '600' },
  sheetScroll: { maxHeight: s(420) },
  ruleRow: { marginTop: s(12), gap: s(4) },
  ruleParagraph: { color: colors.muted, fontSize: s(12), lineHeight: s(18), marginTop: s(8) },
});
