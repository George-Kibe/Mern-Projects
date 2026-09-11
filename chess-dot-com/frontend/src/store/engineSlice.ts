import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_LEVEL_ID } from '../lib/stockfish/levels';
import { DEFAULT_HOST_VOICE, type HostVoiceSettings } from '../lib/speech/serverSpeech';
import { DEFAULT_TIME_CONTROL } from '../lib/time/controls';

/**
 * Engine strength, analysis budget and voice settings.
 *
 * Strength applies only to the opponent you play against — analysis always runs
 * at full strength, otherwise the coaching would be wrong.
 */
export type EngineState = {
  levelId: number;
  playAsWhite: boolean;
  /** Show a live evaluation while playing. Off by default: it spoils the game. */
  showLiveEval: boolean;
  /** Check each of your moves and explain it when it loses material. */
  blunderAlerts: boolean;
  /** Search budget per position when analysing a game, in milliseconds. */
  analysisMovetimeMs: number;
  /** How many candidate moves to request from the engine. */
  multiPv: number;
  voiceEnabled: boolean;
  voiceRate: number;
  voiceUri: string | null;
  /** Settings for the host-side voice used when the browser has none. */
  hostVoice: HostVoiceSettings;
  /** Time control id for games against the engine. */
  timeControlId: string;
  /** Time control id for games against another person. */
  friendTimeControlId: string;
};

export const defaultEngineState: EngineState = {
  levelId: DEFAULT_LEVEL_ID,
  playAsWhite: true,
  showLiveEval: false,
  blunderAlerts: true,
  analysisMovetimeMs: 350,
  multiPv: 3,
  voiceEnabled: true,
  voiceRate: 1,
  voiceUri: null,
  hostVoice: DEFAULT_HOST_VOICE,
  timeControlId: DEFAULT_TIME_CONTROL,
  friendTimeControlId: DEFAULT_TIME_CONTROL,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const engineSlice = createSlice({
  name: 'engine',
  initialState: defaultEngineState,
  reducers: {
    setLevelId(state, action: PayloadAction<number>) {
      state.levelId = action.payload;
    },
    setPlayAsWhite(state, action: PayloadAction<boolean>) {
      state.playAsWhite = action.payload;
    },
    setShowLiveEval(state, action: PayloadAction<boolean>) {
      state.showLiveEval = action.payload;
    },
    setBlunderAlerts(state, action: PayloadAction<boolean>) {
      state.blunderAlerts = action.payload;
    },
    setAnalysisMovetimeMs(state, action: PayloadAction<number>) {
      state.analysisMovetimeMs = clamp(Math.round(action.payload), 50, 5000);
    },
    setMultiPv(state, action: PayloadAction<number>) {
      state.multiPv = clamp(Math.round(action.payload), 1, 5);
    },
    setVoiceEnabled(state, action: PayloadAction<boolean>) {
      state.voiceEnabled = action.payload;
    },
    setVoiceRate(state, action: PayloadAction<number>) {
      state.voiceRate = clamp(action.payload, 0.5, 2);
    },
    setVoiceUri(state, action: PayloadAction<string | null>) {
      state.voiceUri = action.payload;
    },
    setTimeControlId(state, action: PayloadAction<string>) {
      state.timeControlId = action.payload;
    },
    setFriendTimeControlId(state, action: PayloadAction<string>) {
      state.friendTimeControlId = action.payload;
    },
    setHostVoice(state, action: PayloadAction<Partial<HostVoiceSettings>>) {
      // Merge so older persisted state without this field still works.
      state.hostVoice = { ...DEFAULT_HOST_VOICE, ...state.hostVoice, ...action.payload };
    },
  },
});

export const {
  setLevelId,
  setPlayAsWhite,
  setShowLiveEval,
  setBlunderAlerts,
  setAnalysisMovetimeMs,
  setMultiPv,
  setVoiceEnabled,
  setVoiceRate,
  setVoiceUri,
  setHostVoice,
  setTimeControlId,
  setFriendTimeControlId,
} = engineSlice.actions;

export default engineSlice.reducer;
