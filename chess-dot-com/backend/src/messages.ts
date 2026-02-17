export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const JOIN_GAME = "join_game";
export const GAME_START = "game_start";
export const JOINED_GAME = "joined_game";

// to start a game {"type": "init_game"}
//white first move {"type": "move","payload": {"from": "e2","to": "e4"}}
//black first move {"type": "move","payload": {"from": "c7","to": "c5"}}
