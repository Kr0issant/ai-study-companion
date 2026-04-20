import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, ArrowLeft, Send, BarChart3,
  Trash2, Check, X, Clock, MessageCircle, Loader2,
  CheckCircle2, FileText, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { containerVariants, itemVariants } from '../constants/FramerVariants';
import ConfirmationModal from '../components/ConfirmationModal';
import * as friendService from '../services/friendService';
import './Friends.css';

export default function Friends() {
  const { user } = useAuth();

  // ── View state ──
  const [view, setView] = useState('list');
  const [activeFriend, setActiveFriend] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  // ── Friends data (raw UIDs from Firestore + resolved with usernames) ──
  const [friendsArray, setFriendsArray] = useState([]);       // raw: [{ friendId, chatId }]
  const [resolvedFriends, setResolvedFriends] = useState([]); // enriched: [{ friendId, chatId, username }]

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [resolvedIncoming, setResolvedIncoming] = useState([]);

  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [resolvedOutgoing, setResolvedOutgoing] = useState([]);

  // ── Add friend ──
  const [searchUsername, setSearchUsername] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Chat ──
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Stats ──
  const [friendStats, setFriendStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Confirmation ──
  const [friendToRemove, setFriendToRemove] = useState(null);

  // ════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS & UID RESOLUTION
  // ════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!user) return;
    return friendService.subscribeFriendsArray(user.uid, setFriendsArray);
  }, [user]);

  // Resolve friend UIDs → usernames (cached in friendService)
  useEffect(() => {
    if (friendsArray.length === 0) { setResolvedFriends([]); return; }
    Promise.all(friendsArray.map(async entry => {
      const profile = await friendService.resolveUid(entry.friendId);
      return { ...entry, username: profile.username };
    })).then(setResolvedFriends);
  }, [friendsArray]);

  // Incoming requests (real-time)
  useEffect(() => {
    if (!user) return;
    return friendService.subscribeIncomingRequests(user.uid, setIncomingRequests);
  }, [user]);

  // Outgoing requests (real-time)
  useEffect(() => {
    if (!user) return;
    return friendService.subscribeOutgoingRequests(user.uid, setOutgoingRequests);
  }, [user]);

  // Resolve incoming request UIDs
  useEffect(() => {
    if (incomingRequests.length === 0) { setResolvedIncoming([]); return; }
    Promise.all(incomingRequests.map(async req => {
      const profile = await friendService.resolveUid(req.from);
      return { ...req, fromUsername: profile.username };
    })).then(setResolvedIncoming);
  }, [incomingRequests]);

  // Resolve outgoing request UIDs
  useEffect(() => {
    if (outgoingRequests.length === 0) { setResolvedOutgoing([]); return; }
    Promise.all(outgoingRequests.map(async req => {
      const profile = await friendService.resolveUid(req.to);
      return { ...req, toUsername: profile.username };
    })).then(setResolvedOutgoing);
  }, [outgoingRequests]);

  useEffect(() => {
    if (view !== 'chat' || !activeChatId) return;
    let unsubscribe;
    let cancelled = false;

    const init = async () => {
      try {
        setChatLoading(true);
        const initial = await friendService.loadMessages(activeChatId, 20);
        if (cancelled) return;
        setMessages(initial);
        setChatLoading(false);
        setHasMoreMessages(initial.length === 20);

        const newestTime = initial.length > 0
          ? initial[initial.length - 1].createdAt
          : null;

        unsubscribe = friendService.subscribeNewMessages(activeChatId, newestTime, (newMsgs) => {
          if (cancelled) return;
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const unique = newMsgs.filter(m => !existingIds.has(m.id));
            return unique.length > 0 ? [...prev, ...unique] : prev;
          });
        });
      } catch (err) {
        console.error('Chat init error:', err);
        if (!cancelled) setChatLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [view, activeChatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (view === 'chat' && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  // Load stats when opening stats view
  useEffect(() => {
    if (view !== 'stats' || !activeFriend) return;
    setStatsLoading(true);
    friendService.getFriendStats(activeFriend.friendId).then(stats => {
      setFriendStats(stats);
      setStatsLoading(false);
    });
  }, [view, activeFriend]);

  // ════════════════════════════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════════════════════════════

  const handleSendRequest = async () => {
    const username = searchUsername.trim();
    if (!username) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchSuccess('');
    try {
      const target = await friendService.lookupUserByUsername(username);
      if (!target) throw new Error('No user found with that username.');
      await friendService.sendFriendRequest(user.uid, target.uid);
      setSearchUsername('');
      setSearchSuccess(`Friend request sent to @${target.username}!`);
      setTimeout(() => setSearchSuccess(''), 4000);
    } catch (e) {
      setSearchError(e.message);
    }
    setSearchLoading(false);
  };

  const handleAcceptRequest = async (request) => {
    try { await friendService.acceptFriendRequest(request); }
    catch (e) { console.error('Accept error:', e); }
  };

  const handleDeclineRequest = async (requestId) => {
    await friendService.declineFriendRequest(requestId);
  };

  const handleCancelRequest = async (requestId) => {
    await friendService.declineFriendRequest(requestId);
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    await friendService.removeFriend(user.uid, friendToRemove.friendId);
    setFriendToRemove(null);
  };

  const openChat = (friend) => {
    setActiveFriend(friend);
    setActiveChatId(friend.chatId);
    setMessages([]);
    setHasMoreMessages(true);
    setView('chat');
  };

  const openStats = (friend) => {
    setActiveFriend(friend);
    setFriendStats(null);
    setView('stats');
  };

  const goBack = () => {
    setView('list');
  };

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !activeChatId) return;
    setMessageInput('');
    await friendService.sendMessage(activeChatId, user.uid, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadMore = async () => {
    if (!hasMoreMessages || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const oldest = messages[0].createdAt;
    const more = await friendService.loadMoreMessages(activeChatId, oldest, 10);
    setMessages(prev => [...more, ...prev]);
    setHasMoreMessages(more.length === 10);
    setLoadingMore(false);
  };

  const formatTimestamp = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
             d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="friends-container">
      {/* ═══════════════ FRIENDS LIST VIEW ═══════════════ */}
        {view === 'list' && (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Header */}
            <motion.header variants={itemVariants} className="friends-header" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h1 className="text-display-lg" style={{ marginBottom: '0.5rem' }}>Friends</h1>
                <p className="text-title-lg" style={{ color: 'var(--on-surface-muted)', fontWeight: 400 }}>
                  Connect with your study partners.
                </p>
              </div>
            </motion.header>

            {/* Add Friend */}
            <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem' }}>
              <div className="friends-section-label" style={{ marginBottom: '0.75rem' }}>
                <UserPlus size={14} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Add a Friend
              </div>
              <div className="add-friend-bar">
                <input
                  id="add-friend-input"
                  className="input-field"
                  type="text"
                  placeholder="Enter their exact username..."
                  value={searchUsername}
                  onChange={(e) => { setSearchUsername(e.target.value); setSearchError(''); setSearchSuccess(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                />
                <button
                  id="send-request-btn"
                  className="btn btn-primary"
                  onClick={handleSendRequest}
                  disabled={searchLoading || !searchUsername.trim()}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '1.25rem', whiteSpace: 'nowrap' }}
                >
                  {searchLoading
                    ? <Loader2 size={18} className="friends-spinner" />
                    : <><UserPlus size={16} /> Send Request</>
                  }
                </button>
              </div>
              {searchError && <div className="add-friend-error">{searchError}</div>}
              {searchSuccess && <div className="add-friend-success">{searchSuccess}</div>}
            </motion.div>

            {/* Incoming Requests */}
            {resolvedIncoming.length > 0 && (
              <motion.div variants={itemVariants} style={{ marginTop: '2rem' }}>
                <div className="friends-section-label">
                  Incoming Requests ({resolvedIncoming.length})
                </div>
                <div className="request-list">
                  {resolvedIncoming.map(req => (
                    <motion.div
                      key={req.id}
                      className="request-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="request-info">
                        <span className="request-display-name">@{req.fromUsername}</span>
                      </div>
                      <div className="request-actions">
                        <button
                          className="request-btn request-btn-accept"
                          title="Accept"
                          onClick={() => handleAcceptRequest(req)}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="request-btn request-btn-decline"
                          title="Decline"
                          onClick={() => handleDeclineRequest(req.id)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Outgoing Requests */}
            {resolvedOutgoing.length > 0 && (
              <motion.div variants={itemVariants} style={{ marginTop: '2rem' }}>
                <div className="friends-section-label">
                  Sent Requests ({resolvedOutgoing.length})
                </div>
                <div className="request-list">
                  {resolvedOutgoing.map(req => (
                    <div key={req.id} className="request-card">
                      <div className="request-info">
                        <span className="request-display-name">@{req.toUsername}</span>
                        <span className="request-username" style={{ fontSize: '0.75rem' }}>Pending</span>
                      </div>
                      <div className="request-actions">
                        <button
                          className="request-btn request-btn-decline"
                          title="Cancel Request"
                          onClick={() => handleCancelRequest(req.id)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Friends List */}
            <motion.div variants={itemVariants} style={{ marginTop: '2rem' }}>
              <div className="friends-section-label">
                Your Friends ({resolvedFriends.length})
              </div>

              {resolvedFriends.length === 0 ? (
                <div className="friends-empty-state">
                  <div className="friends-empty-icon">
                    <Users size={32} />
                  </div>
                  <p className="text-title-md" style={{ fontWeight: 500 }}>No friends yet</p>
                  <p style={{ fontSize: '0.9rem' }}>
                    Add friends by entering their username above.
                  </p>
                </div>
              ) : (
                <div className="friend-list">
                  {resolvedFriends.map(friend => (
                    <motion.div
                      key={friend.friendId}
                      className="friend-card"
                      onClick={() => openChat(friend)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="friend-avatar">
                        {friend.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="friend-info">
                        <div className="friend-display-name">@{friend.username}</div>
                      </div>
                      <div className="friend-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="friend-action-btn stats-btn"
                          title="View Stats"
                          onClick={() => openStats(friend)}
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          className="friend-action-btn remove-btn"
                          title="Remove Friend"
                          onClick={() => setFriendToRemove(friend)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════ CHAT VIEW ═══════════════ */}
        {view === 'chat' && activeFriend && (
          <div className="chat-panel">
            {/* Chat Header */}
            <div className="chat-header">
              <button className="friends-back-btn" onClick={goBack}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="friend-avatar" style={{ width: 38, height: 38, fontSize: '0.95rem' }}>
                  {activeFriend.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="chat-header-info">
                  <h2>@{activeFriend.username}</h2>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages-area">
              {hasMoreMessages && messages.length > 0 && (
                <div className="chat-load-more">
                  <button onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore
                      ? <Loader2 size={14} className="friends-spinner" />
                      : 'Load older messages'
                    }
                  </button>
                </div>
              )}

              {chatLoading ? (
                <div className="chat-empty-state">
                  <Loader2 size={24} className="friends-spinner" />
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <div>
                    <MessageCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No messages yet. Say hello!</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => {
                  const isSent = msg.senderUid === user.uid;
                  return (
                    <motion.div
                      key={msg.id}
                      className={`chat-bubble-row ${isSent ? 'sent' : 'received'}`}
                      initial={{ opacity: 0, scale: 0.85, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                        {msg.text}
                        <span className="chat-bubble-time">{formatTimestamp(msg.createdAt)}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="chat-input-bar">
              <input
                id="chat-message-input"
                className="input-field"
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                id="chat-send-btn"
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ STATS VIEW ═══════════════ */}
        {view === 'stats' && activeFriend && (
          <div className="stats-panel">
            {/* Stats Header */}
            <div className="friends-header">
              <button className="friends-back-btn" onClick={goBack}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-display-lg" style={{ fontSize: '2rem' }}>
                  @{activeFriend.username}
                </h1>
                <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.9rem' }}>
                  Study Statistics
                </p>
              </div>
            </div>

            {statsLoading ? (
              <div className="stats-empty">
                <Loader2 size={24} className="friends-spinner" />
              </div>
            ) : !friendStats ? (
              <div className="stats-empty">
                <p>No stats available for this user yet.</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show">
                <div className="stats-grid">
                  <motion.div variants={itemVariants} className="stat-card">
                    <div className="stat-icon completed">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="stat-value">{friendStats.completedTasks ?? 0}</div>
                    <div className="stat-label">Completed Tasks</div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="stat-card">
                    <div className="stat-icon remaining">
                      <Clock size={22} />
                    </div>
                    <div className="stat-value">{friendStats.remainingTasks ?? 0}</div>
                    <div className="stat-label">Remaining Tasks</div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="stat-card">
                    <div className="stat-icon notes">
                      <FileText size={22} />
                    </div>
                    <div className="stat-value">{friendStats.totalNotes ?? 0}</div>
                    <div className="stat-label">Notebooks</div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="stat-card">
                    <div className="stat-icon subjects">
                      <GraduationCap size={22} />
                    </div>
                    <div className="stat-value">{friendStats.totalSubjects ?? 0}</div>
                    <div className="stat-label">Subjects</div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        )}


      {/* Remove Friend Confirmation */}
      <ConfirmationModal
        isOpen={friendToRemove !== null}
        onConfirm={handleRemoveFriend}
        onClose={() => setFriendToRemove(null)}
        message={`Remove @${friendToRemove?.username} from your friends?`}
      />
    </div>
  );
}
