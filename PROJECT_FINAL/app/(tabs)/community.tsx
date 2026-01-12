import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { SettingsButton } from '../../components/SettingsButton';

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface Video {
  id: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: Comment[];
}

export default function CommunityScreen() {
  const { t } = useAppSettings();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadCommunityContent();
  }, []);

  const loadCommunityContent = async () => {
    // Simular carga de contenido
    setTimeout(() => {
      // Contenido de ejemplo - en producción vendría de un backend
      const mockVideos: Video[] = [
        {
          id: '1',
          title: 'Haul de 10kg - Unboxing completo',
          description: 'Mi primer haul con CNFans. Todo llegó perfecto en 12 días.',
          views: 5420,
          likes: 342,
          comments: [
            { id: '1', user: 'Usuario1', text: '¡Increíble haul! ¿Cuánto te costó el envío?', timestamp: new Date() },
            { id: '2', user: 'Usuario2', text: 'GL en todas las piezas 🔥', timestamp: new Date() },
          ],
        },
        {
          id: '2',
          title: 'Jordan 1 M Batch vs Retail',
          description: 'Comparativa detallada. La calidad es impresionante.',
          views: 8950,
          likes: 567,
          comments: [],
        },
        {
          id: '3',
          title: 'Tutorial: Primer pedido con agente',
          description: 'Guía paso a paso para principiantes usando USFans.',
          views: 12300,
          likes: 892,
          comments: [],
        },
      ];

      setVideos(mockVideos);
      setLoading(false);
    }, 1500);
  };

  const handleLike = (videoId: string) => {
    setVideos(prevVideos =>
      prevVideos.map(v =>
        v.id === videoId ? { ...v, likes: v.likes + 1 } : v
      )
    );
    Alert.alert(t.success, 'Video marcado como me gusta');
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedVideo) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'Tú',
      text: commentText,
      timestamp: new Date(),
    };

    setVideos(prevVideos =>
      prevVideos.map(v =>
        v.id === selectedVideo.id
          ? { ...v, comments: [...v.comments, newComment] }
          : v
      )
    );

    setCommentText('');
    Alert.alert(t.success, 'Comentario añadido');
  };

  const handleShare = (video: Video) => {
    Alert.alert('Compartir', `Compartir "${video.title}"`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <AnimatedBackground />

      {/* HEADER PREMIUM CON BANNER ESTANDARIZADO */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 15 }]}>
        <View>
          <Text style={styles.logo}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
        <SettingsButton />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: statusBarHeight + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.communityTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.communitySubtitle}</Text>
        </View>

        {/* LOADING STATE */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00e5b0" />
            <Text style={styles.loadingText}>{t.communityLoadingVideos}</Text>
          </View>
        ) : videos.length === 0 ? (
          // EMPTY STATE
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📹</Text>
            <Text style={styles.emptyTitle}>{t.communityNoVideos}</Text>
            <Text style={styles.emptyText}>{t.communityNoVideosText}</Text>
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={loadCommunityContent}
            >
              <Text style={styles.reloadButtonText}>{t.communityReload}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // VIDEO LIST
          <>
            {videos.map(video => (
              <View key={video.id} style={styles.videoCard}>
                {/* VIDEO THUMBNAIL (placeholder) */}
                <View style={styles.videoThumbnail}>
                  <Text style={styles.videoPlayIcon}>▶️</Text>
                  <View style={styles.videoDuration}>
                    <Text style={styles.videoDurationText}>5:24</Text>
                  </View>
                </View>

                {/* VIDEO INFO */}
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDescription}>{video.description}</Text>

                  <View style={styles.videoMeta}>
                    <View style={styles.videoMetaItem}>
                      <Text style={styles.videoMetaIcon}>👁️</Text>
                      <Text style={styles.videoMetaText}>
                        {video.views.toLocaleString()} {t.communityViews}
                      </Text>
                    </View>
                    <View style={styles.videoMetaItem}>
                      <Text style={styles.videoMetaIcon}>💬</Text>
                      <Text style={styles.videoMetaText}>
                        {video.comments.length} {t.communityComments}
                      </Text>
                    </View>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View style={styles.videoActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLike(video.id)}
                    >
                      <Text style={styles.actionButtonIcon}>❤️</Text>
                      <Text style={styles.actionButtonText}>
                        {t.communityLike} ({video.likes})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setSelectedVideo(selectedVideo?.id === video.id ? null : video)}
                    >
                      <Text style={styles.actionButtonIcon}>💬</Text>
                      <Text style={styles.actionButtonText}>
                        {t.communityComments}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleShare(video)}
                    >
                      <Text style={styles.actionButtonIcon}>📤</Text>
                      <Text style={styles.actionButtonText}>
                        {t.communityShare}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* COMMENTS SECTION */}
                  {selectedVideo?.id === video.id && (
                    <View style={styles.commentsSection}>
                      <Text style={styles.commentsTitle}>
                        {t.communityComments} ({video.comments.length})
                      </Text>

                      {video.comments.length === 0 ? (
                        <Text style={styles.noCommentsText}>
                          {t.communityFirstComment}
                        </Text>
                      ) : (
                        video.comments.map(comment => (
                          <View key={comment.id} style={styles.commentItem}>
                            <Text style={styles.commentUser}>{comment.user}</Text>
                            <Text style={styles.commentText}>{comment.text}</Text>
                            <Text style={styles.commentTime}>
                              {comment.timestamp.toLocaleDateString()}
                            </Text>
                          </View>
                        ))
                      )}

                      {/* ADD COMMENT */}
                      <View style={styles.addCommentContainer}>
                        <TextInput
                          style={styles.commentInput}
                          placeholder={t.communityWriteComment}
                          placeholderTextColor="#666"
                          value={commentText}
                          onChangeText={setCommentText}
                          multiline
                        />
                        <TouchableOpacity
                          style={styles.sendCommentButton}
                          onPress={handleAddComment}
                        >
                          <Text style={styles.sendCommentButtonText}>
                            {t.communitySend}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* FOOTER */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>{t.footerCopy}</Text>
          <Text style={styles.footerSubtitle}>{t.footerRights}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  // HEADER
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#00e5b0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: '#a0a0a0', marginTop: 2, fontWeight: '500' },

  // SCROLL
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Platform.OS === 'ios' ? 100 : 95 },

  // HERO
  heroSection: { paddingHorizontal: 20, marginBottom: 24 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 12, lineHeight: 38 },
  heroSubtitle: { fontSize: 16, color: '#a0a0a0', lineHeight: 24, fontWeight: '500' },

  // LOADING
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: '#666', marginTop: 16 },

  // EMPTY STATE
  emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  reloadButton: { backgroundColor: '#00e5b0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  reloadButtonText: { fontSize: 15, fontWeight: '800', color: '#000' },

  // VIDEO CARD
  videoCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  videoThumbnail: {
    height: 200,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlayIcon: { fontSize: 48 },
  videoDuration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoDurationText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  // VIDEO INFO
  videoInfo: { padding: 16 },
  videoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  videoDescription: { fontSize: 14, color: '#a0a0a0', lineHeight: 20, marginBottom: 12 },
  videoMeta: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  videoMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  videoMetaIcon: { fontSize: 14 },
  videoMetaText: { fontSize: 13, color: '#666', fontWeight: '600' },

  // VIDEO ACTIONS
  videoActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#111',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionButtonIcon: { fontSize: 16 },
  actionButtonText: { fontSize: 13, color: '#fff', fontWeight: '700' },

  // COMMENTS
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingTop: 16,
  },
  commentsTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 16 },
  noCommentsText: { fontSize: 14, color: '#666', textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
  commentItem: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  commentUser: { fontSize: 13, fontWeight: '800', color: '#00e5b0', marginBottom: 4 },
  commentText: { fontSize: 14, color: '#ccc', lineHeight: 20, marginBottom: 6 },
  commentTime: { fontSize: 11, color: '#666', fontWeight: '600' },
  addCommentContainer: { marginTop: 12 },
  commentInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  sendCommentButton: { backgroundColor: '#00e5b0', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  sendCommentButtonText: { fontSize: 15, fontWeight: '800', color: '#000' },

  // FOOTER
  footerSection: {
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  footerTitle: { fontSize: 14, color: '#00e5b0', fontWeight: '700', marginBottom: 4 },
  footerSubtitle: { fontSize: 12, color: '#666', fontWeight: '500' },

  bottomSpacer: { height: 20 },
});
