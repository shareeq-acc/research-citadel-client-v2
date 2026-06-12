/** Fallback limits when the API omits aiUsage (mirrors server FREE tier). */
export const DEFAULT_DAILY_LIMIT = 10;
export const DEFAULT_WEEKLY_LIMIT = 30;

export interface AiUsageInput {
  dailyUsed?: number;
  dailyLimit?: number;
  weeklyUsed?: number;
  weeklyLimit?: number;
}

export interface AiUsagePercents {
  dailyUsed: number;
  dailyLimit: number;
  weeklyUsed: number;
  weeklyLimit: number;
  dailyPercent: number;
  weeklyPercent: number;
}

/** Single source of truth for usage % — always integer 0–100. */
export function getAiUsagePercents(usage?: AiUsageInput): AiUsagePercents {
  const dailyUsed = usage?.dailyUsed ?? 0;
  const dailyLimit = usage?.dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const weeklyUsed = usage?.weeklyUsed ?? 0;
  const weeklyLimit = usage?.weeklyLimit ?? DEFAULT_WEEKLY_LIMIT;

  const dailyPercent =
    dailyLimit > 0 ? Math.min(100, Math.round((dailyUsed / dailyLimit) * 100)) : 0;
  const weeklyPercent =
    weeklyLimit > 0 ? Math.min(100, Math.round((weeklyUsed / weeklyLimit) * 100)) : 0;

  return {
    dailyUsed,
    dailyLimit,
    weeklyUsed,
    weeklyLimit,
    dailyPercent,
    weeklyPercent,
  };
}
