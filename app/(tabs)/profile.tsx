import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings as SettingsIcon, Target, LineChart } from 'lucide-react-native';

type TabKey = 'settings' | 'goals' | 'progress';

const STORAGE_KEYS = {
  darkMode: 'profile_darkMode',
  notifications: 'profile_notifications',
  goalsText: 'profile_goals_text',
  workoutsCompleted: 'profile_workouts_completed',
  workoutsTarget: 'profile_workouts_target',
};

function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

function SettingsTab() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, n] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.darkMode),
        AsyncStorage.getItem(STORAGE_KEYS.notifications),
      ]);
      setDarkMode(d === 'true');
      setNotifications(n !== 'false');
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.darkMode, String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.notifications, String(notifications));
  }, [notifications]);

  return (
    <View style={styles.tabContent}>
      <View style={styles.rowBetween}>
        <Text style={styles.itemLabel}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? '#00e676' : '#ccc'} />
      </View>
      <View style={styles.separator} />
      <View style={styles.rowBetween}>
        <Text style={styles.itemLabel}>Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} thumbColor={notifications ? '#00e676' : '#ccc'} />
      </View>
    </View>
  );
}

function GoalsTab() {
  const [goalsText, setGoalsText] = useState('Build consistency: 20 workouts this month');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.goalsText);
      if (saved) setGoalsText(saved);
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.goalsText, goalsText);
  }, [goalsText]);

  return (
    <View style={styles.tabContent}>
      <Text style={styles.itemLabel}>Your goal</Text>
      <TextInput
        value={goalsText}
        onChangeText={setGoalsText}
        placeholder="Describe your fitness goal"
        placeholderTextColor="#777"
        style={styles.input}
        multiline
      />
      <Text style={styles.hint}>Tip: Keep it measurable and time-bound.</Text>
    </View>
  );
}

function ProgressTab() {
  const [completed, setCompleted] = useState(10);
  const [target, setTarget] = useState(20);

  useEffect(() => {
    (async () => {
      const [c, t] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.workoutsCompleted),
        AsyncStorage.getItem(STORAGE_KEYS.workoutsTarget),
      ]);
      if (c) setCompleted(parseInt(c, 10));
      if (t) setTarget(parseInt(t, 10));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.workoutsCompleted, String(completed));
  }, [completed]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.workoutsTarget, String(target));
  }, [target]);

  const progress = useMemo(() => (target > 0 ? completed / target : 0), [completed, target]);

  return (
    <View style={styles.tabContent}>
      <Text style={styles.itemLabel}>Monthly Progress</Text>
      <ProgressBar progress={progress} />
      <Text style={styles.progressText}>{completed}/{target} workouts completed</Text>

      <View style={[styles.rowBetween, { marginTop: 16 }]}>
        <TouchableOpacity style={styles.counterButton} onPress={() => setCompleted(Math.max(0, completed - 1))}>
          <Text style={styles.counterButtonText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.counterButton} onPress={() => setCompleted(completed + 1)}>
          <Text style={styles.counterButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.counterButton} onPress={() => setTarget(Math.max(1, target - 1))}>
          <Text style={styles.counterButtonText}>Target -1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.counterButton} onPress={() => setTarget(target + 1)}>
          <Text style={styles.counterButtonText}>Target +1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const [active, setActive] = useState<TabKey>('settings');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your gym journey starts here</Text>

      <View style={styles.tabsContainer}>
        <TabButton label="Settings" icon={<SettingsIcon color={active === 'settings' ? '#0c0' : '#aaa'} size={18} />} active={active === 'settings'} onPress={() => setActive('settings')} />
        <TabButton label="Goals" icon={<Target color={active === 'goals' ? '#0c0' : '#aaa'} size={18} />} active={active === 'goals'} onPress={() => setActive('goals')} />
        <TabButton label="Progress" icon={<LineChart color={active === 'progress' ? '#0c0' : '#aaa'} size={18} />} active={active === 'progress'} onPress={() => setActive('progress')} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.tabWrapper, { display: active === 'settings' ? 'flex' : 'none' }]}>
          <SettingsTab />
        </View>
        <View style={[styles.tabWrapper, { display: active === 'goals' ? 'flex' : 'none' }]}>
          <GoalsTab />
        </View>
        <View style={[styles.tabWrapper, { display: active === 'progress' ? 'flex' : 'none' }]}>
          <ProgressTab />
        </View>
      </ScrollView>
    </View>
  );
}

function TabButton({ label, icon, active, onPress }: { label: string; icon: React.ReactNode; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      {icon}
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 6,
    gap: 6,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#181818',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0,230,118,0.12)',
  },
  tabButtonText: {
    color: '#aaa',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#00e676',
  },
  tabWrapper: {
    flex: 1,
  },
  tabContent: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
  },
  itemLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#181818',
    color: 'white',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  hint: {
    color: '#888',
  },
  progressBarContainer: {
    height: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00e676',
  },
  progressText: {
    color: 'white',
    marginTop: 8,
    fontWeight: '600',
  },
  counterButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  counterButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});