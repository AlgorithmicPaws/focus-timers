export type Technique = "pomodoro" | "flowtime" | "bolsa";
export type SessionInterval = "week" | "month" | "3months" | "year";

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

export interface FlowtimeDetails {
  id: number;
  session_id: number;
  break_model: string;
  break_ratio: number;
  break_recommended_sec: number;
  break_actual_sec: number | null;
}

export interface BolsaDetails {
  id: number;
  session_id: number;
  budget_total_sec: number;
  budget_work_sec: number;
  budget_break_sec: number;
  budget_used_sec: number;
  breaks_taken: { start: string; end: string; duration_sec: number }[] | null;
  budget_exhausted: boolean;
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
  flowtime_details: FlowtimeDetails | null;
  bolsa_details: BolsaDetails | null;
}

export interface CreateSessionPayload {
  technique: Technique;
  task_name: string | null;
  task_tags?: string[] | null;
  project?: string | null;
  started_at: string;
  ended_at: string;
  total_work_seconds: number;
  total_break_seconds: number;
  completed: boolean;
  technique_config?: Record<string, unknown>;
  day_of_week: number | null;
  hour_of_day: number | null;
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
  flowtime_details?: {
    break_model: string;
    break_ratio: number;
    break_recommended_sec: number;
    break_actual_sec?: number | null;
  };
  bolsa_details?: {
    budget_total_sec: number;
    budget_work_sec: number;
    budget_break_sec: number;
    budget_used_sec: number;
    breaks_taken?: { start: string; end: string; duration_sec: number }[] | null;
    budget_exhausted: boolean;
  };
}

export interface SessionListResponse {
  sessions: FocusSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface SessionFilter {
  technique?: Technique;
  interval?: SessionInterval;
  project?: string;
}

export interface TechniqueStats {
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  total_work_minutes: number;
  avg_work_minutes: number;
}

export interface StatsResponse {
  total_sessions: number;
  total_focus_minutes: number;
  by_technique: Record<string, TechniqueStats>;
  interval: string;
}
