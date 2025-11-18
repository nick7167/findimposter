import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
  update, 
  runTransaction 
} from 'firebase/database';
import { RoomState, Player, GameStage, WORD_PACKS } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBYoGNIuJUngfonKbNpojEmWIOvsXb7aUg",
  authDomain: "imposterdanmark.firebaseapp.com",
  databaseURL: "https://imposterdanmark-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "imposterdanmark",
  storageBucket: "imposterdanmark.firebasestorage.app",
  messagingSenderId: "22050000206",
  appId: "1:22050000206:web:d7995bd441f73ac2b9621f",
  measurementId: "G-N7P9DKCWE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

// --- Helpers ---

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createRoom = async (hostName: string, userId: string): Promise<string> => {
  const code = generateRoomCode();
  const hostPlayer: Player = {
    id: userId,
    name: hostName,
    isHost: true,
    isReady: false,
    voteTargetId: null,
    score: 0
  };

  const newRoom: RoomState = {
    code,
    stage: GameStage.LOBBY,
    players: [hostPlayer],
    roundsTotal: 1,
    currentRound: 1,
    category: '',
    secretWord: '',
    imposterId: '',
    currentTurnPlayerId: '',
    turnDeadline: 0,
    winner: null
  };

  // RTDB: set the data at 'rooms/CODE'
  await set(ref(db, 'rooms/' + code), newRoom);
  return code;
};

export const joinRoom = async (code: string, playerName: string, userId: string) => {
  const roomRef = ref(db, 'rooms/' + code);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Rummet findes ikke");
  }

  const room = snapshot.val() as RoomState;
  if (room.stage !== GameStage.LOBBY) {
    const existing = room.players?.find(p => p.id === userId);
    if (!existing) throw new Error("Spillet er allerede i gang");
    return; // Already in
  }

  // RTDB Transaction to safely add player without race conditions
  const playersRef = child(roomRef, 'players');
  await runTransaction(playersRef, (currentPlayers) => {
    if (currentPlayers === null) return currentPlayers; // Should not happen if room exists
    
    const existing = currentPlayers.find((p: Player) => p.id === userId);
    if (!existing) {
      const newPlayer: Player = {
        id: userId,
        name: playerName,
        isHost: false,
        isReady: false,
        voteTargetId: null,
        score: 0
      };
      return [...currentPlayers, newPlayer];
    }
    return currentPlayers;
  });
};

export const startGame = async (code: string, rounds: number, players: Player[]) => {
  // Pick Imposter
  const imposterIndex = Math.floor(Math.random() * players.length);
  const imposterId = players[imposterIndex].id;

  // Pick Category/Word
  const categories = Object.keys(WORD_PACKS);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const words = WORD_PACKS[category];
  const secretWord = words[Math.floor(Math.random() * words.length)];

  // Reset player states
  const resetPlayers = players.map(p => ({...p, isReady: false, voteTargetId: null}));

  await update(ref(db, 'rooms/' + code), {
    stage: GameStage.REVEAL,
    roundsTotal: rounds,
    currentRound: 1,
    category,
    secretWord,
    imposterId,
    players: resetPlayers
  });
};

export const castVote = async (code: string, userId: string, targetId: string) => {
  const roomRef = ref(db, 'rooms/' + code);
  
  await runTransaction(roomRef, (room: RoomState) => {
    if (!room) return room;

    // Update the vote for the user
    if (room.players) {
      room.players = room.players.map(p => 
        p.id === userId ? { ...p, voteTargetId: targetId } : p
      );
    }

    // Check if everyone has voted
    const allVoted = room.players.every(p => p.voteTargetId !== null);

    if (allVoted) {
      const voteCounts: Record<string, number> = {};
      room.players.forEach(p => {
        if (p.voteTargetId) voteCounts[p.voteTargetId] = (voteCounts[p.voteTargetId] || 0) + 1;
      });

      let maxVotes = 0;
      let votedOutId = '';
      let tie = false;

      Object.entries(voteCounts).forEach(([pid, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          votedOutId = pid;
          tie = false;
        } else if (count === maxVotes) {
          tie = true; // Tie means crew failed to agree
        }
      });

      // Imposter wins if:
      // 1. They were NOT the one voted out.
      // 2. OR there was a tie (Crew confusion wins it for Imposter).
      const imposterCaught = !tie && votedOutId === room.imposterId;
      
      room.winner = imposterCaught ? 'CREW' : 'IMPOSTER';
      room.stage = GameStage.RESULTS;
    }

    return room;
  });
};