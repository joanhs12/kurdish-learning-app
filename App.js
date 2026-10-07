import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STORAGE_KEY = 'kurdish-learning-app-state-v1';

const vocabularyTopics = [
  {
    id: 'greetings',
    title: 'Greetings',
    accent: '#7c3aed',
    words: [
      { kurdish: 'سڵاو', transliteration: 'Salaam', english: 'Hello', note: 'A common greeting' },
      { kurdish: 'چۆنی؟', transliteration: 'Chonî?', english: 'How are you?', note: 'Used in everyday conversation' },
      { kurdish: 'باشم', transliteration: 'Basham', english: 'I am fine', note: 'A polite reply' },
      { kurdish: 'بەخێربێیت', transliteration: 'Bexêr bêt', english: 'Welcome', note: 'Used to welcome someone' },
    ],
  },
  {
    id: 'food',
    title: 'Food',
    accent: '#f97316',
    words: [
      { kurdish: 'ئاو', transliteration: 'Aw', english: 'Water', note: 'Essential drink' },
      { kurdish: 'نانی', transliteration: 'Nani', english: 'Bread', note: 'Daily staple' },
      { kurdish: 'چای', transliteration: 'Chay', english: 'Tea', note: 'Popular hot drink' },
      { kurdish: 'خواردن', transliteration: 'Xwardin', english: 'Food', note: 'General word for meals' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel',
    accent: '#10b981',
    words: [
      { kurdish: 'گواستنەوە', transliteration: 'Guwastinêwê', english: 'Travel', note: 'Movement from one place to another' },
      { kurdish: 'پێویستە', transliteration: 'Pêwîst e', english: 'It is necessary', note: 'Useful for directions' },
      { kurdish: 'بەرامبەر', transliteration: 'Beramber', english: 'Opposite', note: 'Used in navigation' },
      { kurdish: ' شوێن', transliteration: 'Şwên', english: 'Place', note: 'Used for locations' },
    ],
  },
];

const lessons = [
  {
    id: 'greetings-lesson',
    title: 'Daily greetings',
    objective: 'Speak politely in basic conversations.',
    duration: '12 min',
    xp: 50,
    words: ['سڵاو', 'چۆنی؟', 'باشم', 'بەخێربێیت'],
  },
  {
    id: 'food-lesson',
    title: 'Food and drink',
    objective: 'Order food and ask for drinks.',
    duration: '15 min',
    xp: 60,
    words: ['ئاو', 'چای', 'نانی', 'خواردن'],
  },
  {
    id: 'travel-lesson',
    title: 'Travel phrases',
    objective: 'Ask for directions and travel help.',
    duration: '20 min',
    xp: 70,
    words: ['گواستنەوە', 'پێویستە', 'بەرامبەر', 'شوێن'],
  },
];

const challengeData = [
  {
    id: 'challenge-1',
    prompt: 'What does “سڵاو” mean?',
    options: ['Hello', 'Tea', 'Book', 'Goodbye'],
    answer: 'Hello',
  },
  {
    id: 'challenge-2',
    prompt: 'Which word means “Water”?',
    options: ['نانی', 'ئاو', 'چای', 'خۆر'],
    answer: 'ئاو',
  },
  {
    id: 'challenge-3',
    prompt: 'What is the English meaning of “چۆنی؟”?',
    options: ['How are you?', 'Welcome', 'Food', 'House'],
    answer: 'How are you?',
  },
];

const DEFAULT_STATE = {
  isLoggedIn: false,
  profile: { name: 'Guest', email: 'guest@example.com' },
  xp: 0,
  streak: 0,
  completedLessons: [],
  completedChallenges: [],
  favoriteWords: [],
  level: 'Beginner',
};

const getLevel = (xp) => {
  if (xp < 200) return 'Beginner';
  if (xp < 500) return 'Elementary';
  if (xp < 1000) return 'Intermediate';
  return 'Advanced';
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTopic, setSelectedTopic] = useState(vocabularyTopics[0].id);
  const [screenState, setScreenState] = useState(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState('');
  const [challengeSelected, setChallengeSelected] = useState('');

  useEffect(() => {
    const loadState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setScreenState({ ...DEFAULT_STATE, ...parsed, profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) } });
        }
      } catch (error) {
        console.log('Storage load failed', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const persistState = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(screenState));
      } catch (error) {
        console.log('Storage save failed', error);
      }
    };

    persistState();
  }, [screenState, isLoaded]);

  const selectedTopicData = useMemo(
    () => vocabularyTopics.find((item) => item.id === selectedTopic) || vocabularyTopics[0],
    [selectedTopic]
  );

  const completedLessonsCount = screenState.completedLessons.length;
  const totalLessons = lessons.length;
  const completionPercent = Math.round((completedLessonsCount / totalLessons) * 100);
  const currentChallenge = challengeData[currentChallengeIndex];

  const loginUser = () => {
    if (!loginName.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }

    setScreenState((prev) => ({
      ...prev,
      isLoggedIn: true,
      profile: {
        name: loginName.trim(),
        email: loginEmail.trim() || 'student@kurdishlearn.app',
      },
    }));
  };

  const speakWord = (word) => {
    Speech.speak(word, { language: 'ku', rate: 0.8 });
  };

  const toggleFavorite = (word) => {
    setScreenState((prev) => {
      const favoriteWords = prev.favoriteWords.includes(word)
        ? prev.favoriteWords.filter((item) => item !== word)
        : [...prev.favoriteWords, word];

      return { ...prev, favoriteWords };
    });
  };

  const completeLesson = (lessonId, xpGain) => {
    setScreenState((prev) => {
      if (prev.completedLessons.includes(lessonId)) {
        return prev;
      }

      const nextXp = prev.xp + xpGain;
      return {
        ...prev,
        xp: nextXp,
        streak: prev.streak + 1,
        level: getLevel(nextXp),
        completedLessons: [...prev.completedLessons, lessonId],
      };
    });
  };

  const answerChallenge = (selectedAnswer) => {
    const correct = selectedAnswer === currentChallenge.answer;
    setChallengeSelected(selectedAnswer);

    if (correct) {
      setScreenState((prev) => {
        if (prev.completedChallenges.includes(currentChallenge.id)) {
          return prev;
        }

        const nextXp = prev.xp + 30;
        return {
          ...prev,
          xp: nextXp,
          level: getLevel(nextXp),
          completedChallenges: [...prev.completedChallenges, currentChallenge.id],
        };
      });
      setChallengeFeedback('Correct! Great job.');
    } else {
      setChallengeFeedback(`Not quite. Correct answer: ${currentChallenge.answer}`);
    }

    setTimeout(() => {
      setCurrentChallengeIndex((prev) => (prev + 1) % challengeData.length);
      setChallengeFeedback('');
      setChallengeSelected('');
    }, 1200);
  };

  const signOut = () => {
    setScreenState(DEFAULT_STATE);
    setActiveTab('home');
    setLoginName('');
    setLoginEmail('');
  };

  const renderHomeScreen = () => (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Today’s goal</Text>
        <Text style={styles.heroTitle}>Learn Kurdish with confidence</Text>
        <Text style={styles.heroText}>
          Practice daily phrases, build your vocabulary, and finish quick challenges to grow your streak.
        </Text>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue learning</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Streak" value={`${screenState.streak} days`} />
        <StatCard label="XP" value={`${screenState.xp}`} />
        <StatCard label="Level" value={screenState.level} />
      </View>

      <Text style={styles.sectionTitle}>Daily lesson</Text>
      <View style={styles.lessonPreviewCard}>
        <Text style={styles.lessonPreviewTitle}>{lessons[0].title}</Text>
        <Text style={styles.lessonPreviewText}>{lessons[0].objective}</Text>
        <Text style={styles.lessonMeta}>• {lessons[0].duration} • +{lessons[0].xp} XP</Text>
        <Pressable style={styles.secondaryButton} onPress={() => completeLesson(lessons[0].id, lessons[0].xp)}>
          <Text style={styles.secondaryButtonText}>Complete lesson</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderLessonsScreen = () => (
    <View>
      <Text style={styles.sectionTitle}>Lessons</Text>
      {lessons.map((lesson) => {
        const isDone = screenState.completedLessons.includes(lesson.id);
        return (
          <View key={lesson.id} style={styles.lessonCard}>
            <View style={styles.lessonHeaderRow}>
              <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
              {isDone ? <Text style={styles.doneBadge}>Done</Text> : null}
            </View>
            <Text style={styles.lessonCardText}>{lesson.objective}</Text>
            <Text style={styles.lessonMeta}>• {lesson.duration} • +{lesson.xp} XP</Text>
            <View style={styles.wordPillRow}>
              {lesson.words.map((word) => (
                <Text key={word} style={styles.wordPill}>{word}</Text>
              ))}
            </View>
            <Pressable style={styles.primaryButton} onPress={() => completeLesson(lesson.id, lesson.xp)}>
              <Text style={styles.primaryButtonText}>{isDone ? 'Completed' : 'Mark as done'}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );

  const renderVocabularyScreen = () => (
    <View>
      <Text style={styles.sectionTitle}>Vocabulary</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicRow}>
        {vocabularyTopics.map((topic) => (
          <Pressable
            key={topic.id}
            onPress={() => setSelectedTopic(topic.id)}
            style={[styles.topicChip, selectedTopic === topic.id && styles.topicChipActive]}
          >
            <Text style={[styles.topicChipText, selectedTopic === topic.id && styles.topicChipTextActive]}>{topic.title}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.topicContainer}>
        {selectedTopicData.words.map((word) => {
          const isFavorite = screenState.favoriteWords.includes(word.kurdish);
          return (
            <View key={word.kurdish} style={styles.vocabularyCard}>
              <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(word.kurdish)}>
                <Text style={styles.favoriteText}>{isFavorite ? '★' : '☆'}</Text>
              </Pressable>
              <View style={styles.wordHeaderRow}>
                <Text style={styles.kurdishWord}>{word.kurdish}</Text>
                <Pressable style={styles.soundButton} onPress={() => speakWord(word.kurdish)}>
                  <Text style={styles.soundButtonText}>🔊</Text>
                </Pressable>
              </View>
              <Text style={styles.transliteration}>{word.transliteration}</Text>
              <Text style={styles.wordMeaning}>{word.english}</Text>
              <Text style={styles.wordNote}>{word.note}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderChallengeScreen = () => (
    <View>
      <Text style={styles.sectionTitle}>Challenges</Text>
      <View style={styles.challengeCard}>
        <Text style={styles.challengeLabel}>Question {currentChallengeIndex + 1}</Text>
        <Text style={styles.challengePrompt}>{currentChallenge.prompt}</Text>
        {currentChallenge.options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              challengeSelected === option && option === currentChallenge.answer && styles.optionButtonCorrect,
              challengeSelected === option && option !== currentChallenge.answer && styles.optionButtonWrong,
            ]}
            onPress={() => answerChallenge(option)}
            disabled={!!challengeSelected}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
        {challengeFeedback ? <Text style={styles.challengeFeedback}>{challengeFeedback}</Text> : null}
      </View>
    </View>
  );

  const renderProfileScreen = () => (
    <View>
      <Text style={styles.sectionTitle}>Profile</Text>
      <View style={styles.profileCard}>
        <Text style={styles.profileName}>{screenState.profile.name}</Text>
        <Text style={styles.profileEmail}>{screenState.profile.email}</Text>
        <Text style={styles.profileLevel}>Level: {screenState.level}</Text>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.profileCompletion}>{completionPercent}% of lessons completed</Text>

        <View style={styles.profileStatsRow}>
          <Text style={styles.profileStatItem}>XP: {screenState.xp}</Text>
          <Text style={styles.profileStatItem}>Streak: {screenState.streak}</Text>
        </View>

        <Pressable style={styles.secondaryButton} onPress={signOut}>
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.loadingText}>Loading Kurdish Learn...</Text>
      </SafeAreaView>
    );
  }

  if (!screenState.isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Kurdish Learn</Text>
          <Text style={styles.authSubtitle}>Welcome to your language learning journey</Text>

          <TextInput
            style={styles.input}
            value={loginName}
            onChangeText={setLoginName}
            placeholder="Your name"
            placeholderTextColor="#7c8aa5"
          />
          <TextInput
            style={styles.input}
            value={loginEmail}
            onChangeText={setLoginEmail}
            placeholder="Email (optional)"
            keyboardType="email-address"
            placeholderTextColor="#7c8aa5"
          />

          <Pressable style={styles.primaryButton} onPress={loginUser}>
            <Text style={styles.primaryButtonText}>Start learning</Text>
          </Pressable>

          <Pressable style={styles.guestButton} onPress={() => setScreenState({ ...DEFAULT_STATE, isLoggedIn: true })}>
            <Text style={styles.guestButtonText}>Continue as guest</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarSubtitle}>Welcome back</Text>
          <Text style={styles.topBarTitle}>{screenState.profile.name}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{screenState.profile.name.slice(0, 2).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'lessons' && renderLessonsScreen()}
        {activeTab === 'vocabulary' && renderVocabularyScreen()}
        {activeTab === 'challenges' && renderChallengeScreen()}
        {activeTab === 'profile' && renderProfileScreen()}
      </ScrollView>

      <View style={styles.tabBar}>
        {[
          { key: 'home', label: 'Home' },
          { key: 'lessons', label: 'Lessons' },
          { key: 'vocabulary', label: 'Words' },
          { key: 'challenges', label: 'Quiz' },
          { key: 'profile', label: 'Profile' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },
  containerCentered: {
    flex: 1,
    backgroundColor: '#eef3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#eef3ff',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  authCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  authTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  authSubtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    color: '#111827',
    fontSize: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 10,
  },
  topBarSubtitle: {
    color: '#64748b',
    fontSize: 13,
  },
  topBarTitle: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: '#1d4ed8',
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22,
    marginTop: 4,
  },
  heroLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  heroText: {
    color: '#dbeafe',
    marginTop: 10,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#e0f2fe',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 15,
  },
  guestButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  guestButtonText: {
    color: '#4338ca',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  lessonPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
  },
  lessonPreviewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  lessonPreviewText: {
    marginTop: 6,
    color: '#475569',
    lineHeight: 22,
  },
  lessonMeta: {
    marginTop: 10,
    color: '#475569',
    fontWeight: '600',
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  doneBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
    fontSize: 12,
  },
  lessonCardText: {
    marginTop: 8,
    color: '#475569',
  },
  wordPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  wordPill: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 12,
  },
  topicRow: {
    marginTop: 8,
    marginBottom: 14,
  },
  topicChip: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  topicChipActive: {
    backgroundColor: '#111827',
  },
  topicChipText: {
    color: '#334155',
    fontWeight: '700',
  },
  topicChipTextActive: {
    color: '#fff',
  },
  topicContainer: {
    gap: 12,
  },
  vocabularyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 16,
    color: '#d97706',
  },
  wordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 34,
  },
  kurdishWord: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButtonText: {
    fontSize: 18,
  },
  transliteration: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 6,
  },
  wordMeaning: {
    marginTop: 10,
    fontSize: 17,
    color: '#1f2937',
    fontWeight: '700',
  },
  wordNote: {
    marginTop: 8,
    color: '#475569',
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },
  challengeLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  challengePrompt: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionButtonCorrect: {
    backgroundColor: '#bbf7d0',
  },
  optionButtonWrong: {
    backgroundColor: '#fecaca',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  challengeFeedback: {
    marginTop: 10,
    color: '#0f172a',
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  profileEmail: {
    marginTop: 6,
    color: '#64748b',
  },
  profileLevel: {
    marginTop: 12,
    fontWeight: '700',
    color: '#4338ca',
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginTop: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  profileCompletion: {
    marginTop: 10,
    color: '#475569',
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  profileStatItem: {
    fontWeight: '700',
    color: '#111827',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: '#eef2ff',
  },
  tabButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#4338ca',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
