import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  TextInput,
} from 'react-native';

const vocabularySets = [
  {
    id: 'greetings',
    title: 'Greetings',
    accent: '#7c3aed',
    words: [
      { kurdish: 'سڵاو', transliteration: 'Salaam', english: 'Hello' },
      { kurdish: 'چۆنی؟', transliteration: 'Choní?', english: 'How are you?' },
      { kurdish: 'باشم', transliteration: 'Basham', english: 'I am fine' },
      { kurdish: 'بەخێربێیت', transliteration: 'Bexêr bêt', english: 'Welcome' },
    ],
  },
  {
    id: 'food',
    title: 'Food',
    accent: '#f97316',
    words: [
      { kurdish: 'نانی', transliteration: 'Nani', english: 'Bread' },
      { kurdish: 'ئاو', transliteration: 'Aw', english: 'Water' },
      { kurdish: 'چای', transliteration: 'Chay', english: 'Tea' },
      { kurdish: 'خواردن', transliteration: 'Xwardn', english: 'Food' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel',
    accent: '#0ea5e9',
    words: [
      { kurdish: 'گواستنەوە', transliteration: 'Guwastnêwê', english: 'Travel' },
      { kurdish: 'پێویستە', transliteration: 'Pêwîstê', english: 'It is necessary' },
      { kurdish: 'بەرامبەر', transliteration: 'Beramber', english: 'Opposite' },
      { kurdish: 'زەوی', transliteration: 'Zewî', english: 'Earth / land' },
    ],
  },
];

const phrases = [
  { kurdish: 'من ناوم ...ە', transliteration: 'Min navim ... e', english: 'My name is ...' },
  { kurdish: 'دڵنیام', transliteration: 'Dilnîyam', english: 'I am sure' },
  { kurdish: 'چادەکەن؟', transliteration: 'Cadekên?', english: 'What do you want?' },
  { kurdish: 'کاتژمێر چەندە؟', transliteration: 'Katerjmir chande?', english: 'What time is it?' },
];

const quizQuestions = [
  { prompt: 'What does “سڵاو” mean?', answer: 'Hello', hint: 'A common greeting' },
  { prompt: 'What is “ئاو” in English?', answer: 'Water', hint: 'Used for drinking' },
  { prompt: 'What does “چۆنی؟” mean?', answer: 'How are you?', hint: 'Ask about someone’s well-being' },
  { prompt: 'Which word means “tea”?', answer: 'چای', hint: 'Hot drink' },
];

const stats = [
  { label: 'Streak', value: '12 days' },
  { label: 'XP', value: '880' },
  { label: 'Lessons', value: '18' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSetId, setSelectedSetId] = useState(vocabularySets[0].id);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState('');

  const selectedSet = useMemo(
    () => vocabularySets.find((set) => set.id === selectedSetId) || vocabularySets[0],
    [selectedSetId]
  );

  const totalQuestions = quizQuestions.length;
  const currentQuiz = quizQuestions[currentQuestion];

  const handleSubmitAnswer = () => {
    const normalizedUserAnswer = answer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuiz.answer.trim().toLowerCase();

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setScore((prev) => prev + 1);
      setLastResult('Correct! Great work.');
    } else {
      setLastResult(`Not quite. Correct answer: ${currentQuiz.answer}`);
    }

    setAnswer('');
    setCurrentQuestion((prev) => (prev + 1) % totalQuestions);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Welcome back</Text>
          <Text style={styles.appTitle}>Kurdish Learn</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KL</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Today’s focus</Text>
              <Text style={styles.heroTitle}>Basic greetings</Text>
              <Text style={styles.heroText}>
                Learn useful Kurdish words and start short conversations with confidence.
              </Text>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Continue lesson</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              {stats.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular phrases</Text>
              <Text style={styles.linkText}>See all</Text>
            </View>

            <View style={styles.phraseList}>
              {phrases.map((phrase, index) => (
                <View key={index} style={styles.phraseCard}>
                  <Text style={styles.kurdishText}>{phrase.kurdish}</Text>
                  <Text style={styles.transliterationText}>{phrase.transliteration}</Text>
                  <Text style={styles.englishText}>{phrase.english}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'vocab' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vocabulary</Text>
              <Text style={styles.linkText}>+ Add</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
              {vocabularySets.map((set) => (
                <Pressable
                  key={set.id}
                  onPress={() => setSelectedSetId(set.id)}
                  style={[
                    styles.categoryChip,
                    selectedSetId === set.id && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedSetId === set.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {set.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.selectedCard, { borderColor: selectedSet.accent }]}>
              {selectedSet.words.map((word, index) => (
                <View key={index} style={styles.wordRow}>
                  <View>
                    <Text style={styles.kurdishWord}>{word.kurdish}</Text>
                    <Text style={styles.wordPronunciation}>{word.transliteration}</Text>
                  </View>
                  <Text style={styles.wordEnglish}>{word.english}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'practice' && (
          <>
            <View style={styles.quizCard}>
              <Text style={styles.quizLabel}>Quick quiz</Text>
              <Text style={styles.quizPrompt}>{currentQuiz.prompt}</Text>
              <Text style={styles.quizHint}>Hint: {currentQuiz.hint}</Text>

              <TextInput
                style={styles.input}
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your answer"
                placeholderTextColor="#7c8aa5"
              />

              <Pressable style={styles.primaryButton} onPress={handleSubmitAnswer}>
                <Text style={styles.primaryButtonText}>Check answer</Text>
              </Pressable>

              <Text style={styles.resultText}>{lastResult || 'Score: ' + score}</Text>
            </View>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <View style={styles.profileCard}>
              <Text style={styles.profileTitle}>Your progress</Text>
              <Text style={styles.profileText}>Level 2 • Intermediate</Text>
              <Text style={styles.profileText}>Completed 68% of the beginner path</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {[
          { key: 'home', label: 'Home' },
          { key: 'vocab', label: 'Words' },
          { key: 'practice', label: 'Practice' },
          { key: 'profile', label: 'Profile' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22,
    marginTop: 6,
  },
  heroLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
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
    marginTop: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  phraseList: {
    gap: 12,
  },
  phraseCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  kurdishText: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '700',
  },
  transliterationText: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 13,
  },
  englishText: {
    color: '#374151',
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  tabRow: {
    marginVertical: 12,
  },
  categoryChip: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#111827',
  },
  categoryChipText: {
    fontWeight: '600',
    color: '#334155',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  selectedCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 2,
    padding: 18,
    marginTop: 8,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  kurdishWord: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  wordPronunciation: {
    color: '#64748b',
    marginTop: 4,
  },
  wordEnglish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
  },
  quizLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quizPrompt: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
  },
  quizHint: {
    color: '#7c8aa5',
    marginTop: 8,
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  resultText: {
    marginTop: 18,
    color: '#0f172a',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  profileText: {
    fontSize: 15,
    color: '#475569',
    marginTop: 10,
  },
  progressBar: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginTop: 18,
  },
  progressFill: {
    width: '68%',
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
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
});
