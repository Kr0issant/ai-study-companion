import { db } from '../firebase';
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, where, orderBy, limit, startAfter, onSnapshot, arrayUnion
} from 'firebase/firestore';

// ─── Username Resolution Cache ─────────────────────────────────────
// Maps UID → { uid, username }. Avoids repeated Firestore queries.

const usernameCache = new Map();

export async function resolveUid(uid) {
  if (usernameCache.has(uid)) return usernameCache.get(uid);

  const q = query(collection(db, 'usernames'), where('uid', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) {
    const fallback = { uid, username: 'unknown' };
    usernameCache.set(uid, fallback);
    return fallback;
  }

  const result = { uid, username: snap.docs[0].id };
  usernameCache.set(uid, result);
  return result;
}

export async function resolveUids(uids) {
  return Promise.all(uids.map(uid => resolveUid(uid)));
}

export function clearUsernameCache() {
  usernameCache.clear();
}

// ─── Username Lookup (by username → uid) ────────────────────────────

export async function lookupUserByUsername(username) {
  const usernameDoc = await getDoc(doc(db, 'usernames', username));
  if (!usernameDoc.exists()) return null;
  const { uid } = usernameDoc.data();
  return { uid, username };
}

// ─── Friend Requests ───────────────────────────────────────────────
// Stored with UIDs only. Usernames resolved client-side.

export async function sendFriendRequest(currentUid, targetUid) {
  if (targetUid === currentUid) {
    throw new Error("You can't add yourself as a friend.");
  }

  // Check if already friends
  const friendsDoc = await getDoc(doc(db, 'friends', currentUid));
  const friends = friendsDoc.exists() ? friendsDoc.data().friends || [] : [];
  if (friends.some(f => f.friendId === targetUid)) {
    throw new Error("You're already friends with this user.");
  }

  // Check for duplicate pending request (outgoing)
  const outQ = query(
    collection(db, 'friend-requests'),
    where('from', '==', currentUid),
    where('to', '==', targetUid)
  );
  const outSnap = await getDocs(outQ);
  if (!outSnap.empty) throw new Error("You already sent a request to this user.");

  // Check for existing incoming request from that user
  const inQ = query(
    collection(db, 'friend-requests'),
    where('from', '==', targetUid),
    where('to', '==', currentUid)
  );
  const inSnap = await getDocs(inQ);
  if (!inSnap.empty) throw new Error("This user already sent you a request! Check your incoming requests.");

  const requestRef = await addDoc(collection(db, 'friend-requests'), {
    from: currentUid,
    to: targetUid,
    createdAt: new Date().toISOString()
  });
  await updateDoc(requestRef, { id: requestRef.id });
}

// No userData needed anymore — everything is UIDs
export async function acceptFriendRequest(request) {
  // Create a new chat document (UIDs only)
  const chatRef = await addDoc(collection(db, 'chats'), {
    users: [request.from, request.to],
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
  await updateDoc(chatRef, { id: chatRef.id });

  // Add to both users' friends docs (friends/{uid})
  await setDoc(doc(db, 'friends', request.to), {
    friends: arrayUnion({ friendId: request.from, chatId: chatRef.id })
  }, { merge: true });

  await setDoc(doc(db, 'friends', request.from), {
    friends: arrayUnion({ friendId: request.to, chatId: chatRef.id })
  }, { merge: true });

  // Delete the request
  await deleteDoc(doc(db, 'friend-requests', request.id));
}

export async function declineFriendRequest(requestId) {
  await deleteDoc(doc(db, 'friend-requests', requestId));
}

// ─── Friend Management ─────────────────────────────────────────────

export async function removeFriend(currentUid, friendId) {
  // Read current user's friends to find the chatId
  const myDoc = await getDoc(doc(db, 'friends', currentUid));
  let chatId = null;
  if (myDoc.exists()) {
    const myFriends = myDoc.data().friends || [];
    const entry = myFriends.find(f => f.friendId === friendId);
    if (entry) chatId = entry.chatId;
    await setDoc(doc(db, 'friends', currentUid), {
      friends: myFriends.filter(f => f.friendId !== friendId)
    });
  }

  // Remove from the other user's friends doc
  const theirDoc = await getDoc(doc(db, 'friends', friendId));
  if (theirDoc.exists()) {
    const theirFriends = theirDoc.data().friends || [];
    await setDoc(doc(db, 'friends', friendId), {
      friends: theirFriends.filter(f => f.friendId !== currentUid)
    });
  }

  // Delete the chat and all its messages
  if (chatId) {
    const messagesSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
    const deletePromises = messagesSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    await deleteDoc(doc(db, 'chats', chatId));
  }
}

// ─── Real-time Subscriptions ────────────────────────────────────────

export function subscribeIncomingRequests(uid, callback) {
  const q = query(collection(db, 'friend-requests'), where('to', '==', uid));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeOutgoingRequests(uid, callback) {
  const q = query(collection(db, 'friend-requests'), where('from', '==', uid));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeFriendsArray(uid, callback) {
  return onSnapshot(doc(db, 'friends', uid), docSnap => {
    if (docSnap.exists()) {
      callback(docSnap.data().friends || []);
    } else {
      callback([]);
    }
  });
}

// ─── Chat — Messages ────────────────────────────────────────────────

export async function loadMessages(chatId, messageLimit = 20) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
}

export async function loadMoreMessages(chatId, oldestCreatedAt, messageLimit = 10) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'desc'),
    startAfter(oldestCreatedAt),
    limit(messageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
}

export function subscribeNewMessages(chatId, afterCreatedAt, callback) {
  const constraints = [orderBy('createdAt', 'asc')];
  if (afterCreatedAt) {
    constraints.push(startAfter(afterCreatedAt));
  }
  const q = query(collection(db, 'chats', chatId, 'messages'), ...constraints);
  return onSnapshot(q, snap => {
    const added = [];
    snap.docChanges().forEach(change => {
      if (change.type === 'added') {
        added.push({ id: change.doc.id, ...change.doc.data() });
      }
    });
    if (added.length > 0) callback(added);
  });
}

export async function sendMessage(chatId, senderUid, text) {
  const createdAt = new Date().toISOString();
  const msgRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderUid,
    text,
    createdAt
  });
  await updateDoc(msgRef, { id: msgRef.id });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text.length > 100 ? text.substring(0, 100) + '…' : text,
    lastMessageAt: createdAt
  });
}

// ─── Stats ──────────────────────────────────────────────────────────

export async function getFriendStats(friendUid) {
  const snap = await getDoc(doc(db, 'stats', friendUid));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateMyStats(uid, { tasks, notes, subjects }) {
  await setDoc(doc(db, 'stats', uid), {
    uid,
    completedTasks: tasks.filter(t => t.isCompleted).length,
    remainingTasks: tasks.filter(t => !t.isCompleted).length,
    totalNotes: notes.length,
    totalSubjects: subjects.length,
    lastUpdated: new Date().toISOString()
  });
}
