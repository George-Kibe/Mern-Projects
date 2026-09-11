/**
 * A curated opening repertoire for training.
 *
 * Hand-written rather than pulled from a database: the point is not coverage but
 * the *ideas*, so every line carries why the moves are played, what the
 * middlegame looks like, and the mistake people actually make. Lines stop where
 * the opening stops being forced and understanding takes over.
 */
export type Opening = {
  id: string;
  name: string;
  eco: string;
  /** The side whose repertoire this is — the side you practise. */
  side: 'w' | 'b';
  family: string;
  /** Main line in SAN, from the starting position. */
  moves: string[];
  /** What the opening is trying to achieve, in one or two sentences. */
  idea: string;
  /** Notes on individual moves, keyed by ply index (0 = the first move). */
  notes: Record<number, string>;
  /** Typical middlegame plans once the opening is done. */
  plans: string[];
  /** The mistake that actually costs people games here. */
  watchOut: string;
};

export const OPENINGS: Opening[] = [
  /* ---------------- 1.e4 e5 ---------------- */
  {
    id: 'italian',
    name: 'Italian Game',
    eco: 'C50',
    side: 'w',
    family: '1.e4 e5',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O'],
    idea: 'The most natural opening in chess: occupy the centre, develop toward it, castle. The bishop on c4 eyes f7, the weakest square in Black’s camp before castling.',
    notes: {
      4: 'Bc4 takes aim at f7. Only the king defends it, which is why so many early attacks land there.',
      6: 'c3 prepares d4 — the pawn duo on d4 and e4 is what White is really after.',
      8: 'd3 is the modern, patient choice: hold the centre, finish developing, push d4 later on your own terms.',
    },
    plans: [
      'Play d4 when it gains time or opens lines, not automatically — the tension helps you.',
      'Re1, Nbd2, Nf1, Ng3 is the classic regrouping: the knight joins the kingside attack.',
      'Keep the light-squared bishop; retreat it to b3 rather than trade it for a knight.',
    ],
    watchOut: 'Do not grab material early with Ng5 and Nxf7 ideas unless the tactics genuinely work — the attack evaporates and you are left with a misplaced knight.',
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez (Spanish)',
    eco: 'C78',
    side: 'w',
    family: '1.e4 e5',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
    idea: 'Pressure the knight that defends e5, then build the ideal centre behind it. The most respected opening in chess: White gets a lasting, slow initiative.',
    notes: {
      4: 'Bb5 attacks the defender of e5 rather than e5 itself — indirect pressure is the whole point.',
      5: 'a6 asks the bishop to commit. This is the Morphy Defence, played in the overwhelming majority of games.',
      10: 'Re1 defends e4 and prepares to meet ...b5 and ...Na5 calmly.',
      14: 'c3 supports d4. White has spent the opening preparing one pawn push.',
    },
    plans: [
      'Nbd1–f1–g3 regrouping, then d4 with a strong centre.',
      'If Black plays ...Na5 to trade off your bishop, retreat to c2 and keep it.',
      'The d5 square and the half-open d-file are long-term targets.',
    ],
    watchOut: 'Bxc6 early gives up the bishop pair for very little unless you have a concrete follow-up — the Exchange Variation is a different opening with different plans.',
  },
  {
    id: 'scotch',
    name: 'Scotch Game',
    eco: 'C45',
    side: 'w',
    family: '1.e4 e5',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Nb3', 'Bb6', 'Nc3', 'Nf6', 'Qe2', 'O-O'],
    idea: 'Open the centre immediately instead of manoeuvring behind it. Fewer theoretical traps than the Ruy Lopez, and the position clarifies fast.',
    notes: {
      4: 'd4 strikes at once. Black must take, or concede the centre.',
      7: 'Bc5 hits the knight on d4 and takes the strong diagonal.',
      8: 'Nb3 sidesteps and gains time on the bishop.',
    },
    plans: [
      'Castle queenside in sharp lines and attack on the kingside.',
      'The half-open d-file suits a rook on d1 against Black’s d-pawn.',
      'Trade into an endgame if you win the structural battle — your pawns are healthier.',
    ],
    watchOut: 'After 4.Nxd4, do not leave the knight sitting on d4 for Black to hit with tempo. Retreat or support it before it costs you time.',
  },
  {
    id: 'petrov',
    name: 'Petrov (Russian) Defence',
    eco: 'C42',
    side: 'b',
    family: '1.e4 e5',
    moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6', 'Nf3', 'Nxe4', 'd4', 'd5', 'Bd3', 'Nc6', 'O-O', 'Be7'],
    idea: 'Symmetry as a weapon. Black copies White instead of defending e5, aiming for a solid, drawish position with few weaknesses.',
    notes: {
      3: 'Nf6 ignores the attack on e5 and counter-attacks e4. This is the whole idea.',
      5: 'd6 first. Taking on e4 immediately loses material to Qe2, pinning the knight.',
      9: 'd5 supports the knight on e4 — without this, the knight has nowhere to live.',
    },
    plans: [
      'Complete development and trade pieces; the symmetrical structure favours the defender.',
      'The c-pawn break ...c5 frees the position once you are castled.',
      'Watch the e-file — rooks land there fast in this opening.',
    ],
    watchOut: 'Never play 3...Nxe4 before ...d6. 4.Qe2 wins a piece or forces an awful position — this is the single most common way people lose the Petrov.',
  },

  /* ---------------- Sicilian ---------------- */
  {
    id: 'sicilian-najdorf',
    name: 'Sicilian, Najdorf',
    eco: 'B90',
    side: 'b',
    family: 'Sicilian',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6'],
    idea: 'The sharpest reply to 1.e4. Black trades a wing pawn for a centre pawn, takes the half-open c-file, and plays for a win rather than equality.',
    notes: {
      1: 'c5 fights for d4 from the side, leaving the centre unbalanced from move one.',
      9: 'a6 is the Najdorf move: it stops Nb5 and Bb5 forever, and prepares ...b5 for queenside play.',
      11: 'e5 gains space and kicks the knight, at the cost of weakening d5.',
    },
    plans: [
      'Queenside expansion with ...b5, ...Bb7, ...Nbd7 and pressure down the c-file.',
      'The d5 square is your one structural concession — cover it with ...Be6, ...Nbd7 and sometimes ...Rc8.',
      'Against a kingside pawn storm, counter in the centre or on the queenside rather than defending passively.',
    ],
    watchOut: 'This is the most analysed opening in chess. Do not enter sharp lines from general principles — one inaccuracy against a prepared opponent is fatal.',
  },
  {
    id: 'sicilian-dragon',
    name: 'Sicilian, Dragon',
    eco: 'B70',
    side: 'b',
    family: 'Sicilian',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O'],
    idea: 'Fianchetto the dark-squared bishop and aim it at the long diagonal, straight at White’s queenside. Both sides attack the enemy king; whoever is faster wins.',
    notes: {
      9: 'g6 prepares the bishop that gives the Dragon its name and its bite.',
      11: 'Bg7 points at b2 and, once the centre opens, at White’s king.',
      12: 'f3 is White announcing the Yugoslav Attack: Qd2, O-O-O, h4-h5 and a race.',
    },
    plans: [
      'The exchange sacrifice ...Rxc3 is a standard resource — it wrecks White’s queenside and frees the g7 bishop.',
      'Play ...Rc8 early; the c-file is where your counterplay lives.',
      'Trade off White’s dark-squared bishop if you can — it is the main defender of the long diagonal.',
    ],
    watchOut: 'Against the Yugoslav Attack, counting tempi matters more than material. If you spend moves on anything that is not counterplay, h5 arrives first.',
  },

  /* ---------------- Other 1.e4 defences ---------------- */
  {
    id: 'french',
    name: 'French Defence, Winawer',
    eco: 'C18',
    side: 'b',
    family: 'vs 1.e4',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7'],
    idea: 'Challenge the centre immediately with ...d5 and accept a cramped but rock-solid position. Black gives up the bishop pair to wreck White’s queenside pawns.',
    notes: {
      1: 'e6 prepares ...d5 with support. The cost is the light-squared bishop, which gets locked behind the pawn chain.',
      5: 'Bb4 pins the knight defending e4 — this is what makes the Winawer sharp rather than passive.',
      9: 'Bxc3+ doubles White’s pawns permanently. You give the bishop pair for a structural concession that lasts all game.',
    },
    plans: [
      'Attack the base of the pawn chain with ...c5 and ...Qc7, not the head of it.',
      'The doubled c-pawns are a long-term target — pile on c3 and c4.',
      'Your light-squared bishop is the problem piece. Free it with ...b6 and ...Ba6, or trade it off.',
    ],
    watchOut: 'Do not let the position close completely while your queenside is undeveloped. The French is cramped, and a cramped position with no counterplay is just bad.',
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann, Classical',
    eco: 'B18',
    side: 'b',
    family: 'vs 1.e4',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7'],
    idea: 'Everything the French offers, without trapping the light-squared bishop. Solid, low-risk, and very hard to beat.',
    notes: {
      1: 'c6 prepares ...d5 with the c-pawn, leaving the c8 bishop its diagonal.',
      7: 'Bf5 — the whole point. The bishop gets out before ...e6 shuts the door.',
      11: 'h6 gives the bishop a retreat and stops h5 trapping it. Necessary, not optional.',
    },
    plans: [
      'Finish with ...e6, ...Ngf6, ...Bd6 and castle; the structure is sound and needs no heroics.',
      'The ...c5 break frees the position when you are ready.',
      'Aim for an endgame: your pawn structure is healthier than White’s in most lines.',
    ],
    watchOut: 'After ...Bf5 and ...Bg6, White plays h4-h5 to harass the bishop. If you have not played ...h6 in time, the bishop can end up trapped.',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defence',
    eco: 'B01',
    side: 'b',
    family: 'vs 1.e4',
    moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6', 'Bc4', 'Bf5'],
    idea: 'Strike at the centre on move one and get a clear, easy-to-play structure. Very little theory to memorise — ideal while you are learning.',
    notes: {
      3: 'Qxd5 recaptures, accepting that the queen will be chased. The tempo White gains is the price of a simple position.',
      5: 'Qa5 is the main square: safe from immediate attack, eyeing the queenside.',
      9: 'c6 gives the queen a retreat and supports ...d5 ideas later. Quiet, but important.',
    },
    plans: [
      'Develop with ...Bf5 or ...Bg4, ...e6, ...Nbd7 and castle — the setup is the same in most lines.',
      'Queenside castling leads to sharp play; kingside castling keeps it simple.',
      'Your structure is symmetrical and sound; play for solidity, not early tricks.',
    ],
    watchOut: 'Keep track of your queen on a5. Nd2-b3 and Bd2 ideas gain tempo on her, and losing time with the queen is how this opening goes wrong.',
  },

  /* ---------------- 1.d4 ---------------- */
  {
    id: 'qgd',
    name: 'Queen’s Gambit Declined',
    eco: 'D37',
    side: 'b',
    family: '1.d4 d5',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'Bf4', 'O-O'],
    idea: 'The most respected answer to 1.d4. Hold the centre with ...d5, develop soundly, and accept a slightly passive but very hard to crack position.',
    notes: {
      3: 'e6 supports d5. It shuts in the c8 bishop, which is the one real drawback.',
      7: 'Be7 is modest but correct — it unpins and prepares to castle without provoking anything.',
    },
    plans: [
      'Free the position with ...c5 or ...dxc4 followed by ...c5 at the right moment.',
      'Solve the c8 bishop: ...b6 and ...Bb7, or ...Nbd7 and ...dxc4 then ...b5.',
      'If White plays for the minority attack with b4-b5, meet it with central play.',
    ],
    watchOut: 'Do not take on c4 too early without a follow-up — White simply plays e4 and gets the full centre for free.',
  },
  {
    id: 'slav',
    name: 'Slav Defence',
    eco: 'D15',
    side: 'b',
    family: '1.d4 d5',
    moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6'],
    idea: 'Defend d5 with the c-pawn instead of the e-pawn, keeping the light-squared bishop free. All the solidity of the QGD without the bad bishop.',
    notes: {
      3: 'c6 supports d5 and leaves the c8–h3 diagonal open — the difference from the QGD.',
      7: 'dxc4 grabs the pawn, planning ...b5 to hang on to it.',
      8: 'a4 stops ...b5. It costs White the b4 square, which Black can use later.',
      9: 'Bf5 develops the bishop outside the pawn chain, exactly as intended.',
    },
    plans: [
      'The ...c5 break at the right moment frees everything.',
      'Use the b4 square, weakened by a4, for a knight or bishop.',
      'Do not cling to the c4 pawn — it is a tempo-winner, not a permanent gain.',
    ],
    watchOut: 'Playing ...Bf5 before ...dxc4 allows Qb3 hitting b7 and d5 at once. Move order matters here more than in most openings.',
  },
  {
    id: 'kid',
    name: 'King’s Indian Defence',
    eco: 'E60',
    side: 'b',
    family: 'Indian defences',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'],
    idea: 'Let White build the big centre, then attack it. Black concedes space for a violent kingside attack — one of the most uncompromising ways to play for a win.',
    notes: {
      3: 'g6 prepares the fianchetto. Black does not contest the centre yet; that comes later.',
      11: 'e5 is the thematic strike. The position usually closes, and then both sides attack on opposite wings.',
    },
    plans: [
      'Once the centre closes with d5, play ...f5, ...f4, ...g5, ...h5 and storm the king.',
      'Reroute the f6 knight — ...Ne8 or ...Nd7 — so the f-pawn can advance.',
      'Ignore the queenside. White will get counterplay there; the race is the whole game.',
    ],
    watchOut: 'If you attack slowly, White’s queenside break arrives first and you have nothing. The KID punishes hesitation harder than almost any opening.',
  },
  {
    id: 'nimzo',
    name: 'Nimzo-Indian Defence',
    eco: 'E20',
    side: 'b',
    family: 'Indian defences',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5'],
    idea: 'Control the centre with pieces instead of pawns. The bishop pins the knight that guards e4, and Black often trades it to give White doubled pawns.',
    notes: {
      5: 'Bb4 pins the c3 knight and fights for e4 without committing a pawn.',
      9: 'd5 stakes a central claim now that the pin restrains White.',
      11: 'c5 hits the centre from the other side — pressure from both wings is the Nimzo method.',
    },
    plans: [
      'Trade on c3 when it doubles White’s pawns and you can blockade the c4 square.',
      'Play against the doubled pawns with ...Na5, ...b6 and ...Ba6.',
      'If White avoids the doubling, you have a comfortable game with easy development.',
    ],
    watchOut: 'Do not take on c3 automatically. It gives up the bishop pair; only do it when the structural damage is worth more than the bishop.',
  },
  {
    id: 'grunfeld',
    name: 'Grünfeld Defence',
    eco: 'D85',
    side: 'b',
    family: 'Indian defences',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7'],
    idea: 'Invite White to build an imposing pawn centre, then demolish it. A hypermodern opening for players who are comfortable defending to win.',
    notes: {
      5: 'd5 in the centre, unlike the King’s Indian — this is the defining difference.',
      9: 'Nxc3 trades off before the knight is kicked, damaging White’s structure.',
      11: 'Bg7 points straight at the big centre White has just built.',
    },
    plans: [
      'Hit d4 with ...c5 immediately; the centre is a target, not an asset for White.',
      'Pressure c3 and c4 with ...Qa5, ...Rc8 and the g7 bishop.',
      'If White’s centre survives and advances, you are worse — timing is everything.',
    ],
    watchOut: 'Passive play loses quickly. If you do not challenge d4 within a few moves, White’s centre rolls forward and the g7 bishop bites on granite.',
  },
  {
    id: 'london',
    name: 'London System',
    eco: 'D02',
    side: 'w',
    family: '1.d4',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'c5'],
    idea: 'A setup rather than a theory battle: the same few moves against almost anything. Solid, quick to learn, and genuinely good — which is why it is everywhere.',
    notes: {
      2: 'Bf4 develops the problem bishop outside the pawn chain before playing e3.',
      8: 'Bg3 preserves the bishop when Black offers a trade with ...Bd6.',
    },
    plans: [
      'Ne5 supported by f4 and Nd2 is the main attacking idea.',
      'Qe2, O-O-O and a kingside pawn storm in sharper versions.',
      'The c2–h7 diagonal with Bd3 and Qc2 is a standard mating battery.',
    ],
    watchOut: 'Playing the moves in autopilot against ...c5 and ...Qb6 hits b2 and can cost a pawn. The system still needs you to look at the board.',
  },
  {
    id: 'catalan',
    name: 'Catalan Opening',
    eco: 'E01',
    side: 'w',
    family: '1.d4',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4'],
    idea: 'The Queen’s Gambit with the bishop on g2. That bishop presses down the long diagonal for the entire game — often still doing damage forty moves later.',
    notes: {
      4: 'g3 prepares the fianchetto. White is happy to give up a pawn on c4 for lasting pressure.',
      11: 'dxc4 grabs the pawn. White usually regains it with Qc2 or Qa4, or plays on for the initiative.',
    },
    plans: [
      'Recover the c4 pawn with Qc2/Qa4 and Ne5, or leave it and play for pressure.',
      'The g2 bishop plus a rook on d1 makes ...c5 and ...b5 hard for Black to achieve.',
      'e4 at the right moment turns the pressure into a space advantage.',
    ],
    watchOut: 'Do not chase the c4 pawn at all costs. The compensation is positional, and spending four moves to win it back usually hands Black the freeing break.',
  },
  {
    id: 'english',
    name: 'English Opening',
    eco: 'A20',
    side: 'w',
    family: 'Flank openings',
    moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'Bb4', 'Bg2', 'O-O'],
    idea: 'A Sicilian with colours reversed and an extra tempo. Flexible, low-theory, and it can transpose into almost anything.',
    notes: {
      0: 'c4 controls d5 without committing a centre pawn — the flank approach.',
      6: 'g3 and Bg2 is the main setup: the bishop fights for d5 from a distance.',
    },
    plans: [
      'Play for d5 or the b4-b5 queenside expansion.',
      'Rb1 and b4 is the standard space-gaining plan on the queenside.',
      'Be ready to transpose into 1.d4 structures if Black plays ...d5.',
    ],
    watchOut: 'Flexibility is not a plan. If you shuffle without committing to a break, Black takes the centre and you end up worse from a "safe" opening.',
  },
];

export const FAMILIES = [...new Set(OPENINGS.map((o) => o.family))];

export function getOpening(id: string): Opening | undefined {
  return OPENINGS.find((o) => o.id === id);
}
