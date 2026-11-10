// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';

import { getTaskList } from '@/api/vip';
import { PageSkeleton } from '@/components/chrome';
import { GlobalNav } from '@/components/global-nav';
import { SearchGlyph } from '@/components/source-icon';
import { HomePopups } from '@/features/home-popups';
import { useI18n } from '@/i18n';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const CATEGORIES = [
  { key: 'slots', labelKey: 'demoHome.guestHome.slots' },
  { key: 'crash', labelKey: 'demoHome.guestHome.crash' },
  { key: 'new', labelKey: 'demoHome.guestHome.new' },
  { key: 'favorites', labelKey: 'demoHome.guestHome.favorites' },
];

const firstDepositIcon = require('../../assets/brand/first-deposit.png');
const BANNER_INTERVAL = 4000;
const BANNER_SPEED = 560;
const TASK_SLIDE_MS = 3000;
const TASK_SLIDE_SPEED = 450;
const TASK_CARD_HEIGHT = s(68);

const bannerParam = (slide) => {
  const raw = slide?.ext_param ?? slide?.param;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw).replace(/'/g, '"'));
  } catch {
    return {};
  }
};

function PromoCarousel({ banners, onPress }) {
  const slides = banners.filter((item) => item?.img || item?.image);
  const loop = slides.length > 1;
  const data = loop ? [...slides, slides[0]] : slides;
  const scroller = useRef(null);
  const indexRef = useRef(0);
  const widthRef = useRef(0);
  const timerRef = useRef(null);
  const resetRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);

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

  return (
    <View
      style={styles.promo}
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
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.id ?? 'banner'}-${index}`}
          getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
          onMomentumScrollEnd={(event) => {
            const width = widthRef.current || 1;
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            if (loop && index >= slides.length) {
              indexRef.current = 0;
              if (!resetRef.current) scroller.current?.scrollToOffset({ offset: 0, animated: false });
            } else {
              indexRef.current = Math.min(index, slides.length - 1);
            }
            start();
          }}
          renderItem={({ item }) => (
            <Pressable style={{ width: pageWidth, height: s(116) }} onPress={() => onPress(item)}>
              <Image source={{ uri: item.img || item.image }} style={styles.promoImage} contentFit="cover" />
            </Pressable>
          )}
        />
      ) : null}
    </View>
  );
}

function TaskCarousel({ tasks, onPress }) {
  const loop = tasks.length > 1;
  const slides = loop ? [...tasks, tasks[0]] : tasks;
  const offset = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const taskKey = tasks.map((task) => task.id).join('|');

  const stop = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    offset.stopAnimation();
  };

  const go = (next) => {
    const wrapped = next >= tasks.length;
    indexRef.current = next;
    Animated.timing(offset, {
      toValue: -next * TASK_CARD_HEIGHT,
      duration: TASK_SLIDE_SPEED,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || !wrapped) return;
      indexRef.current = 0;
      offset.setValue(0);
    });
  };

  const start = () => {
    stop();
    indexRef.current = 0;
    offset.setValue(0);
    if (!loop) return;
    timerRef.current = setInterval(() => {
      const current = indexRef.current >= tasks.length ? 0 : indexRef.current;
      if (current !== indexRef.current) {
        indexRef.current = 0;
        offset.setValue(0);
      }
      go(current + 1);
    }, TASK_SLIDE_MS);
  };

  useFocusEffect(
    useCallback(() => {
      start();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') start();
        else stop();
      });
      return () => {
        stop();
        subscription.remove();
      };
    }, [taskKey]),
  );

  return (
    <Pressable style={styles.depositViewport} onPress={onPress}>
      <Animated.View style={{ transform: [{ translateY: offset }] }}>
        {slides.map((task, index) => (
          <View key={`${task.id}-${index}`} style={styles.deposit}>
            <Image source={task.logoUrl ? { uri: task.logoUrl } : firstDepositIcon} style={styles.depositIcon} contentFit="contain" />
            <View style={styles.depositCopy}>
              <Text style={styles.depositTitle} numberOfLines={1}>{task.title}</Text>
              {task.remark ? <Text style={styles.depositRemark} numberOfLines={1}>{task.remark}</Text> : null}
            </View>
            <View style={styles.depositMeta}>
              <Text style={styles.depositReward}>₹{task.reward}</Text>
              <Text style={styles.depositRemark}>{(index % tasks.length) + 1}/{tasks.length}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </Pressable>
  );
}

export function HomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const appConfig = useSystemStore((state) => state.appConfig);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const [rewardTasks, setRewardTasks] = useState([]);

  useEffect(() => {
    loadAppConfig().catch(() => {});
  }, [loadAppConfig]);

  useEffect(() => {
    if (!isLoggedIn) {
      setRewardTasks([]);
      return;
    }
    getTaskList({}, { showLoading: false })
      .then((response) => {
        const raw = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        setRewardTasks(raw.filter((task) => task.taskType !== 'WEEKLY').map((task) => ({
          id: task.taskId,
          title: task.taskName || '--',
          logoUrl: task.logoUrl || task.logo_url || '',
          reward: Number(task.rewardAmount || 0),
          remark: task.taskTarget || '',
        })));
      })
      .catch(() => setRewardTasks([]));
  }, [isLoggedIn]);

  const sections = appConfig?.index_menu?.index_game_tab?.[0]?.list || [];
  const banners = Array.isArray(appConfig?.banner_list) ? appConfig.banner_list : [];

  const openGame = (game) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    router.push({ pathname: '/game', params: { id: String(game.id || ''), type: String(game.platform_type || '2'), name: game.name || game.game_name || '' } });
  };

  const openBanner = (slide) => {
    if (!slide?.url) return;
    const param = bannerParam(slide);
    if (param?.islogin && !isLoggedIn) {
      openLogin();
      return;
    }
    if (/^https?:\/\//i.test(slide.url)) {
      Linking.openURL(slide.url).catch(() => {});
      return;
    }
    router.push(slide.url);
  };

  return (
    <View style={styles.page}>
      <GlobalNav />
      {!appConfig ? (
        <PageSkeleton rows={4} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={({ pressed }) => [styles.search, pressed && styles.pressed]} onPress={() => router.push('/game-list')}>
            <SearchGlyph />
            <Text style={styles.searchText}>{t('demoHome.guestHome.search')}</Text>
          </Pressable>
          <PromoCarousel banners={banners} onPress={openBanner} />
          <View style={styles.chips}>
            {CATEGORIES.map((item, index) => (
              <Pressable key={item.key} style={({ pressed }) => [styles.chip, index === 0 && styles.chipActive, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/game-list', params: { category: item.key } })}>
                <Text style={[styles.chipText, index === 0 && styles.chipTextActive]} numberOfLines={1}>{t(item.labelKey)}</Text>
              </Pressable>
            ))}
          </View>
          {sections.map((section, index) => {
            const games = (section?.game_list?.items || []).slice(0, 8);
            if (!games.length) return null;
            const isFirst = sections.findIndex((item) => (item?.game_list?.items || []).length) === index;
            return (
              <View key={`${section.name}-${index}`} style={styles.block}>
                <View style={styles.blockHead}>
                  <Text style={styles.blockTitle}>{section.name}</Text>
                  <Pressable style={styles.viewAll} onPress={() => router.push({ pathname: '/game-list', params: { category: section.name || '' } })}>
                    <Text style={styles.viewAllText}>{t('demoHome.guestHome.viewAll')}</Text>
                    <Text style={styles.viewAllText}>›</Text>
                  </Pressable>
                </View>
                <FlatList
                  horizontal
                  data={games}
                  keyExtractor={(game, gameIndex) => String(game.id || gameIndex)}
                  showsHorizontalScrollIndicator={false}
                  style={styles.rail}
                  contentContainerStyle={styles.railContent}
                  renderItem={({ item }) => (
                    <Pressable style={({ pressed }) => [styles.game, pressed && styles.pressed]} onPress={() => openGame(item)}>
                      <Image source={{ uri: item.image || item.img }} style={styles.gameImage} contentFit="cover" />
                      <Text style={styles.gameName} numberOfLines={1}>{item.name || item.game_name}</Text>
                    </Pressable>
                  )}
                />
                {isFirst && rewardTasks.length ? (
                  <TaskCarousel tasks={rewardTasks} onPress={() => (isLoggedIn ? router.push('/welfare-center') : openLogin())} />
                ) : null}
              </View>
            );
          })}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providers} contentContainerStyle={styles.providerContent}>
            {['PG Soft', 'JILI', 'JDB', 'InOut'].map((name) => (
              <Pressable key={name} style={({ pressed }) => [styles.provider, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/provider/[provider]', params: { provider: name } })}>
                <Text style={styles.providerText}>{name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.support}>
            <Text style={styles.blockTitle}>{t('demoHome.guestHome.support')}</Text>
            <Pressable style={({ pressed }) => [styles.supportButton, pressed && styles.pressed]} onPress={() => router.push('/customer-service-center')}>
              <Text style={styles.supportText}>{t('demoHome.contactUs')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
      <HomePopups />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: s(12), gap: s(16), paddingBottom: s(24) },
  search: { height: s(48), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', flexDirection: 'row', gap: s(8), paddingHorizontal: s(14) },
  searchText: { color: colors.muted, fontSize: s(14) },
  pressed: { opacity: 0.72 },
  promo: { width: '100%', height: s(116), borderRadius: s(12), overflow: 'hidden', backgroundColor: colors.surface },
  promoImage: { width: '100%', height: s(116) },
  chips: { flexDirection: 'row', gap: s(8) },
  chip: { flex: 1, height: s(44), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(4) },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent, boxShadow: `0 ${s(2)}px 0 #4d661e` },
  chipText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  chipTextActive: { color: colors.accentInk },
  block: { gap: s(10) },
  blockHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blockTitle: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: s(2) },
  viewAllText: { color: colors.muted, fontSize: s(12) },
  rail: { height: s(156), maxHeight: s(156), flexGrow: 0 },
  railContent: { gap: s(8), height: s(156) },
  game: { width: s(98), gap: s(6) },
  gameImage: { width: s(98), height: s(130), borderRadius: s(8), backgroundColor: colors.surface },
  gameName: { color: colors.text, fontSize: s(12) },
  depositViewport: { height: TASK_CARD_HEIGHT, borderRadius: s(12), backgroundColor: colors.surface, overflow: 'hidden' },
  deposit: { height: TASK_CARD_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: s(10), paddingHorizontal: s(12) },
  depositIcon: { width: s(32), height: s(32) },
  depositCopy: { flex: 1, gap: s(2) },
  depositTitle: { color: colors.text, fontSize: s(14), fontWeight: '700' },
  depositRemark: { color: colors.muted, fontSize: s(12) },
  depositMeta: { alignItems: 'flex-end', gap: s(4) },
  depositReward: { color: colors.accent, fontSize: s(14), fontWeight: '700' },
  providers: { height: s(36), maxHeight: s(36), flexGrow: 0 },
  providerContent: { gap: s(8), height: s(36), alignItems: 'center' },
  provider: { height: s(36), paddingHorizontal: s(16), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  providerText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  support: { gap: s(8), paddingBottom: s(8) },
  supportButton: { height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 #4d661e` },
  supportText: { color: colors.accentInk, fontSize: s(16), fontWeight: '600' },
});
