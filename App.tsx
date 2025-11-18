
import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db, createRoom, joinRoom, startGame, castVote, nextTurn } from './services/firebase';
import { GameStage, RoomState } from './types';
import { Button, Input, Card, Avatar } from './components/UI';

// Helper to get or create persistent User ID
const getUserId = () => {
  let id = localStorage.getItem('imposter_uid');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('imposter_uid', id);
  }
  return id;
};

// Sub-component for copying room code
const RoomCodeDisplay = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="w-full bg-surface border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 p-4 rounded-2xl flex flex-col items-center justify-center transition-all hover:bg-slate-50 group relative overflow-hidden"
    >
      <span className={`text-xs font-black uppercase tracking-wider mb-1 transition-colors ${copied ? 'text-green-500' : 'text-slate-400 group-hover:text-secondary'}`}>
        {copied ? 'Kopieret til Udklipsholder!' : 'Rumkode (Tryk for at kopiere)'}
      </span>
      <span className={`text-5xl font-black tracking-widest font-mono transition-colors ${copied ? 'text-green-500' : 'text-slate-700'}`}>
        {code}
      </span>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-secondary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
        </svg>
      </div>
    </button>
  );
};

// Subtle leave button component
const QuitButton = ({ onClick, light = false }: { onClick: () => void; light?: boolean }) => (
  <button
    onClick={() => {
      if (window.confirm("Er du sikker på, at du vil forlade spillet?")) {
        onClick();
      }
    }}
    className={`absolute top-6 right-6 text-xs font-black uppercase tracking-wider p-2 transition-colors z-50 ${
      light ? 'text-white/40 hover:text-white' : 'text-slate-300 hover:text-danger'
    }`}
  >
    Forlad
  </button>
);

const App: React.FC = () => {
  const [userId] = useState(getUserId());
  const [nickname, setNickname] = useState(localStorage.getItem('imposter_name') || '');
  
  // Split state: Input vs Active Connection
  const [roomCodeInput, setRoomCodeInput] = useState(''); 
  const [activeRoomCode, setActiveRoomCode] = useState(localStorage.getItem('imposter_active_room') || '');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Game State
  const [gameState, setGameState] = useState<RoomState | null>(null);

  // Timer ref for local animation
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    localStorage.setItem('imposter_name', nickname);
  }, [nickname]);

  // Persistence for Active Room
  useEffect(() => {
    if (activeRoomCode) {
        localStorage.setItem('imposter_active_room', activeRoomCode);
    } else {
        localStorage.removeItem('imposter_active_room');
    }
  }, [activeRoomCode]);

  // Subscribe to Room Updates (RTDB)
  useEffect(() => {
    // Prevent crash if DB not initialized
    if (!db) return; 
    if (!activeRoomCode) return;

    const roomRef = ref(db, 'rooms/' + activeRoomCode);
    
    // onValue listens for changes at the path
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as RoomState;
        setGameState(data);
        setError(''); // Clear errors on successful connection
      } else {
        setGameState(null);
        // Only clear code if we were expecting a valid room
        if (activeRoomCode) {
            setError("Rummet blev ikke fundet eller er lukket.");
            setActiveRoomCode('');
        }
      }
    }, (err) => {
        console.error("Firebase subscription error:", err);
        setError("Forbindelse tabt. Genopretter...");
    });

    return () => unsubscribe();
  }, [activeRoomCode]);

  // Timer Logic for Game Loop
  useEffect(() => {
    if (gameState?.stage === GameStage.GAME_LOOP && gameState.turnDeadline) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((gameState.turnDeadline - Date.now()) / 1000));
        setTimeLeft(remaining);

        // Auto-advance ONLY if I am the host. 
        // This prevents multiple players triggering the transaction simultaneously.
        if (remaining === 0) {
            const isHost = gameState.players.find(p => p.id === userId)?.isHost;
            if (isHost) {
               handleNextTurn();
            }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState?.stage, gameState?.turnDeadline, userId]); // Removed currentTurnPlayerId from dependencies to avoid frequent re-renders


  // --- Action Handlers ---

  const handleCreate = async () => {
    if (!nickname) return setError("Indtast et kaldenavn!");
    if (!db) return setError("Firebase er ikke konfigureret.");
    setLoading(true);
    try {
      const code = await createRoom(nickname, userId);
      setActiveRoomCode(code);
      setError('');
    } catch (err) {
      console.error(err);
      setError("Kunne ikke oprette rum.");
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!nickname || !roomCodeInput) return setError("Indtast navn og kode!");
    if (!db) return setError("Firebase er ikke konfigureret.");
    setLoading(true);
    try {
      const codeUpper = roomCodeInput.toUpperCase();
      await joinRoom(codeUpper, nickname, userId);
      setActiveRoomCode(codeUpper);
      setRoomCodeInput(''); // Clear input on success
      setError('');
    } catch (err: any) {
      setError(err.message || "Kunne ikke deltage.");
    }
    setLoading(false);
  };

  const handleStartGame = async (rounds: number) => {
    if (!gameState || !db) return;
    // Pass current imposter ID to avoid repeating same player twice
    await startGame(gameState.code, rounds, gameState.players, gameState.imposterId);
  };

  const handleToggleReady = async () => {
    if (!gameState || !db) return;
    const updatedPlayers = gameState.players.map(p => 
      p.id === userId ? { ...p, isReady: true } : p
    );

    const allReady = updatedPlayers.every(p => p.isReady);
    const updates: any = { players: updatedPlayers };
    
    if (allReady) {
      updates.stage = GameStage.GAME_LOOP;
      // Pick RANDOM start player
      const randomStartPlayer = updatedPlayers[Math.floor(Math.random() * updatedPlayers.length)];
      updates.currentTurnPlayerId = randomStartPlayer.id;
      updates.turnDeadline = Date.now() + 30000; 
    }

    await update(ref(db, 'rooms/' + gameState.code), updates);
  };

  const handleNextTurn = async () => {
    if (!gameState || !db) return;
    // Use transaction-based nextTurn to prevent race conditions and ensure turnCount is accurate
    await nextTurn(gameState.code, gameState.turnCount || 0);
  };

  const handleVote = async (targetId: string) => {
    if (!gameState || !db) return;
    await castVote(gameState.code, userId, targetId);
  };

  const handlePlayAgain = async () => {
    if (!gameState || !db) return;
    await update(ref(db, 'rooms/' + gameState.code), {
        stage: GameStage.LOBBY,
        players: gameState.players.map(p => ({ ...p, isReady: false, voteTargetId: null })),
        winner: null,
        category: '',
        secretWord: '',
        turnCount: 0
    });
  };

  const handleLeave = () => {
      setActiveRoomCode('');
      setGameState(null);
      setError('');
  };

  // --- CRASH PREVENTION ---
  if (!db) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl mb-6">
                <h1 className="text-2xl font-black text-danger mb-2">Konfiguration Mangler</h1>
                <p className="text-slate-600 font-bold">
                    Firebase er ikke konfigureret. Åbn <code className="bg-white px-2 py-1 rounded border border-slate-200 mx-1 text-sm">services/firebase.ts</code> og indsæt dine nøgler.
                </p>
            </div>
        </div>
    );
  }

  // --- RENDERERS ---

  // 1. LANDING SCREEN
  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-primary tracking-tight mb-2">Imposter</h1>
          <p className="text-slate-400 font-bold text-lg">Find spionen iblandt os.</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 font-bold text-center w-full">{error}</div>}

        <Card className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Kaldenavn</label>
            <Input 
                placeholder="Indtast dit navn" 
                value={nickname} 
                onChange={e => setNickname(e.target.value)} 
                maxLength={12}
            />
          </div>

          <div className="pt-4">
             <Button fullWidth onClick={handleCreate} disabled={loading}>Opret Rum</Button>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t-2 border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-300 font-black text-sm">ELLER</span>
            <div className="flex-grow border-t-2 border-slate-200"></div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Rumkode</label>
             <Input 
                 placeholder="X Y Z A" 
                 className="uppercase text-center tracking-[0.5em] font-black text-2xl h-16 placeholder-slate-300"
                 value={roomCodeInput} 
                 onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                 maxLength={4}
             />
             <Button variant="secondary" fullWidth onClick={handleJoin} disabled={loading}>Deltag</Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. LOBBY
  if (gameState.stage === GameStage.LOBBY) {
    const isHost = gameState.players.find(p => p.id === userId)?.isHost;

    // Local state for rounds selector in lobby
    const RoundsSelector = () => {
        const [rounds, setRounds] = useState(gameState.roundsTotal || 1);
        return (
            <div className="mt-6 space-y-4 bg-white p-4 rounded-t-3xl border-t-2 border-slate-100 shadow-lg">
                <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Runder</span>
                <div className="flex space-x-2">
                    {[1, 2, 3].map(r => (
                        <button 
                            key={r}
                            onClick={() => setRounds(r)}
                            className={`w-10 h-10 rounded-xl font-bold transition-colors ${rounds === r ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-400'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                </div>
                <Button 
                fullWidth 
                onClick={() => handleStartGame(rounds)}
                disabled={gameState.players.length < 3}
                >
                {gameState.players.length < 3 ? `Mangler ${3 - gameState.players.length} Mere` : 'Start Spil'}
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handleLeave} 
                    className="bg-red-100 text-red-600 border-b-4 border-red-200 hover:bg-red-200 font-extrabold text-xs uppercase tracking-wider py-3 px-5 rounded-2xl transition-all active:border-b-0 active:translate-y-1"
                >
                    Forlad
                </button>
            </div>
            
            <h2 className="text-center text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Lobby</h2>
            
            <div className="mb-8">
                <RoomCodeDisplay code={gameState.code} />
            </div>

            <div className="flex-grow space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider ml-2">Spillere ({gameState.players.length})</h3>
                {gameState.players.map(player => (
                    <div key={player.id} className="flex items-center bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm">
                        <Avatar name={player.name} size="sm" />
                        <span className="ml-3 font-bold text-slate-700">{player.name}</span>
                        {player.isHost && <span className="ml-auto text-xs font-bold bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg">VÆRT</span>}
                    </div>
                ))}
            </div>

            {isHost ? <RoundsSelector /> : (
                <div className="mt-6 py-6 text-center text-slate-400 font-bold animate-pulse">
                    Venter på de andre...
                </div>
            )}
        </div>
    );
  }

  // 3. REVEAL
  if (gameState.stage === GameStage.REVEAL) {
    const myPlayer = gameState.players.find(p => p.id === userId);
    const isImposter = gameState.imposterId === userId;
    return <RevealScreen 
                gameState={gameState} 
                isImposter={isImposter} 
                isReady={!!myPlayer?.isReady} 
                onReady={handleToggleReady} 
                onLeave={handleLeave}
           />;
  }

  // 4. GAME LOOP
  if (gameState.stage === GameStage.GAME_LOOP) {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
    const isMyTurn = gameState.currentTurnPlayerId === userId;

    return (
        <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto relative">
             <QuitButton onClick={handleLeave} />
             <div className="flex justify-between items-end mb-6 mt-8">
                <div className="bg-white border-2 border-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-400">
                    Runde {gameState.currentRound}/{gameState.roundsTotal}
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase">Kategori</div>
                    <div className="font-black text-slate-700">{gameState.category}</div>
                </div>
             </div>

             <div className="flex-grow flex flex-col items-center justify-center">
                <div className="relative mb-6">
                    <Avatar name={currentPlayer?.name || '?'} size="lg" active />
                </div>
                <h2 className="text-3xl font-black text-slate-700 mb-2">
                    {isMyTurn ? "Det er din tur!" : `${currentPlayer?.name}'s Tur`}
                </h2>
                <p className="text-slate-400 font-bold text-center max-w-[200px]">
                    {isMyTurn ? "Beskriv ordet uden at afsløre det." : "Lyt opmærksomt efter ledetråde."}
                </p>
             </div>

             <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-8">
                <div 
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-danger' : 'bg-secondary'}`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                ></div>
             </div>

             <Button 
                fullWidth 
                variant={isMyTurn ? "primary" : "ghost"}
                disabled={!isMyTurn}
                onClick={() => handleNextTurn()}
             >
                {isMyTurn ? "Færdig" : `Venter (${timeLeft}s)`}
             </Button>
        </div>
    );
  }

  // 5. VOTING
  if (gameState.stage === GameStage.VOTING) {
    const myVote = gameState.players.find(p => p.id === userId)?.voteTargetId;

    return (
        <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto relative">
             <QuitButton onClick={handleLeave} />
             <h2 className="text-3xl font-black text-slate-700 mb-2 text-center mt-12">Stem!</h2>
             <p className="text-slate-400 font-bold text-center mb-8">Hvem er Imposteren?</p>

             <div className="grid grid-cols-2 gap-4">
                {gameState.players.map(player => {
                    if (player.id === userId) return null;
                    const isSelected = myVote === player.id;
                    return (
                        <button 
                            key={player.id}
                            onClick={() => !myVote && handleVote(player.id)}
                            disabled={!!myVote}
                            className={`p-4 rounded-2xl border-b-4 font-bold text-lg transition-all ${
                                isSelected 
                                ? 'bg-danger text-white border-dangerDark translate-y-1 border-b-0' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                            }`}
                        >
                            {player.name}
                        </button>
                    )
                })}
             </div>

             {myVote && (
                 <div className="mt-8 text-center text-slate-400 font-bold animate-pulse">
                     Venter på de andre...
                 </div>
             )}
        </div>
    );
  }

  // 6. RESULTS
  if (gameState.stage === GameStage.RESULTS) {
    const isHost = gameState.players.find(p => p.id === userId)?.isHost;
    const imposterName = gameState.players.find(p => p.id === gameState.imposterId)?.name;
    const crewWon = gameState.winner === 'CREW';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative ${crewWon ? 'bg-primary' : 'bg-danger'}`}>
            <QuitButton onClick={handleLeave} light />
            <div className="text-white text-center mb-8 mt-12">
                <h1 className="text-5xl font-black mb-2">{crewWon ? 'MANDSKABET VANDT!' : 'IMPOSTEREN VANDT!'}</h1>
                <p className="font-bold text-white/80 text-xl">
                    {crewWon ? 'Imposteren blev fanget.' : 'Imposteren slap væk.'}
                </p>
            </div>

            <Card className="w-full mb-6 text-center">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Imposteren var</div>
                <div className="text-2xl font-black text-slate-800 mb-6">{imposterName}</div>
                
                <div className="w-full h-0.5 bg-slate-100 mb-6"></div>

                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ordet var</div>
                <div className="text-2xl font-black text-secondary">{gameState.secretWord}</div>
            </Card>

            {isHost ? (
                <Button variant="secondary" fullWidth className="bg-white text-secondary border-slate-200 hover:bg-slate-50" onClick={handlePlayAgain}>
                    Spil Igen
                </Button>
            ) : (
                <Button variant="ghost" fullWidth className="text-white/50 border-transparent hover:bg-black/10" onClick={handleLeave}>
                    Forlad
                </Button>
            )}
        </div>
    );
  }

  return null;
};

// Extracted to avoid hook rule issues in conditional renders
const RevealScreen: React.FC<{ 
  gameState: RoomState; 
  isImposter: boolean; 
  isReady: boolean; 
  onReady: () => void;
  onLeave: () => void;
}> = ({ gameState, isImposter, isReady, onReady, onLeave }) => {
    const [revealed, setRevealed] = useState(false);
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-slate-800 relative">
             <QuitButton onClick={onLeave} light />
             <h2 className="text-white font-black text-3xl mb-8">Din Rolle</h2>
             
             <div 
                onClick={() => !isReady && setRevealed(!revealed)}
                className="w-full aspect-[3/4] bg-white rounded-3xl p-2 cursor-pointer perspective-1000 transition-transform active:scale-95 duration-200 relative"
             >
                <div className={`w-full h-full rounded-2xl border-4 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 ${revealed ? (isImposter ? 'bg-danger border-dangerDark' : 'bg-primary border-primaryDark') : 'bg-slate-200 border-slate-300'}`}>
                    {!revealed ? (
                        <div className="text-slate-400 font-black text-xl uppercase">Tryk for at se</div>
                    ) : (
                        <>
                            <div className="text-white/80 font-black text-sm uppercase tracking-widest mb-4">
                                Kategori: {gameState.category}
                            </div>
                            <div className="text-white font-black text-4xl mb-4">
                                {isImposter ? 'IMPOSTER' : gameState.secretWord}
                            </div>
                            <div className="text-white/90 font-bold text-sm">
                                {isImposter ? 'Fald i ét med mængden. Bliv ikke fanget.' : 'Find imposteren.'}
                            </div>
                        </>
                    )}
                </div>
             </div>

             <div className="w-full mt-8">
                {isReady ? (
                    <div className="text-center text-white/50 font-bold">Venter på de andre...</div>
                ) : (
                    <Button 
                        fullWidth 
                        variant={revealed ? "primary" : "ghost"} 
                        onClick={onReady}
                        disabled={!revealed}
                        className={revealed ? "bg-white text-slate-800 border-slate-300 hover:bg-slate-100" : "text-white hover:bg-white/10"}
                    >
                        Jeg er Klar
                    </Button>
                )}
             </div>
        </div>
    );
};

export default App;
