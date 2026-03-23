export type Technique = "pomodoro" | "flowtime" | "bolsa";

export interface PomodoroDetails {
  id: number;
  session_id: number;
  focus_interval_sec: number;
  short_break_sec: number;
  long_break_sec: number;
  pomodoros_target: number;
  pomodoros_completed: number;
  pomodoro_number: number;
  was_voided: boolean;
  strict_mode: boolean;
}

export interface FocusSession {
  id: number;
  user_id: number;
  technique: Technique;
  task_name: string | null;
  task_tags: string[] | null;
  project: string | null;
  started_at: string;
  ended_at: string | null;
  total_work_seconds: number;
  total_break_seconds: number;
  completed: boolean;
  interruptions: unknown[] | null;
  technique_config: Record<string, unknown> | null;
  day_of_week: number | null;
  hour_of_day: number | null;
  mood_rating: number | null;
  created_at: string;
  pomodoro_details: PomodoroDetails | null;
}

export interface CreateSessionPayload {
  technique: Technique;
  task_name?: string;
  task_tags?: string[];
  project?: string;
  started_at: string;
  ended_at?: string;
  total_work_seconds: number;
  total_break_seconds: number;
  completed: boolean;
  technique_config?: Record<string, unknown>;
  day_of_week?: number;
  hour_of_day?: number;
  pomodoro_details?: {
    focus_interval_sec: number;
    short_break_sec: number;
    long_break_sec: number;
    pomodoros_target: number;
    pomodoros_completed: number;
    pomodoro_number: number;
    was_voided: boolean;
    strict_mode: boolean;
  };
}

export interface SessionListResponse {
  sessions: FocusSession[];
  total: number;
  limit: number;
  offset: number;
}
