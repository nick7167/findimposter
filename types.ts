export enum GameStage {
  LANDING = 'LANDING',
  LOBBY = 'LOBBY',
  REVEAL = 'REVEAL',
  GAME_LOOP = 'GAME_LOOP',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS'
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  voteTargetId: string | null; // ID of player they voted for
  score: number;
}

export interface RoomState {
  code: string;
  stage: GameStage;
  players: Player[];
  roundsTotal: number;
  currentRound: number;
  category: string;
  secretWord: string;
  imposterId: string; // The ID of the imposter
  currentTurnPlayerId: string; // ID of player whose turn it is
  turnDeadline: number; // Timestamp (ms) when turn ends
  winner: 'CREW' | 'IMPOSTER' | null;
}

export const INITIAL_ROOM_STATE: RoomState = {
  code: '',
  stage: GameStage.LANDING,
  players: [],
  roundsTotal: 1,
  currentRound: 1,
  category: '',
  secretWord: '',
  imposterId: '',
  currentTurnPlayerId: '',
  turnDeadline: 0,
  winner: null,
};

export const WORD_PACKS: Record<string, string[]> = {
  'Animals': ['Lion', 'Penguin', 'Giraffe', 'Elephant', 'Shark', 'Eagle', 'Dolphin'],
  'Food': ['Pizza', 'Sushi', 'Burger', 'Tacos', 'Ice Cream', 'Salad', 'Pancakes'],
  'Places': ['School', 'Hospital', 'Beach', 'Space Station', 'Library', 'Gym', 'Cinema'],
  'Jobs': ['Doctor', 'Teacher', 'Astronaut', 'Chef', 'Firefighter', 'Artist', 'Programmer'],
  'Objects': ['Chair', 'Laptop', 'Umbrella', 'Toothbrush', 'Mug', 'Keys', 'Guitar']
};