import type { Competition, Round, Stage } from './competitions'

function roundRegistrationStages(round: Round): Stage[] {
  return round.stages.filter(s => (s.eligibilitySource ?? 'roundRegistration') === 'roundRegistration')
}

export interface SplitPlan {
  splitCount: number
  approvedCount: number
  minPerGroup: number
  perGroup: number
}

function planningStage(round: Round): Stage | undefined {
  return roundRegistrationStages(round)[0] ?? round.stages[0]
}

/**
 * 报名分组计划。approvedCount 由调用方传入（前台从 registrationRepository 取），
 * 保持本函数为纯函数、无数据层依赖。
 */
export function getSplitPlan(
  round: Round,
  approvedCount: number,
  comp?: Competition,
): SplitPlan {
  const stage = planningStage(round)
  const splitCount = Math.max(1, stage?.splits.length ?? 1)
  const minPerGroup = comp?.minSplitEntries ?? stage?.minEntries ?? 10
  const perGroup = Math.floor(approvedCount / splitCount)
  return { splitCount, approvedCount, minPerGroup, perGroup }
}

export type SplitWarning = 'tooFew' | null

export function getSplitWarning(
  round: Round,
  approvedCount: number,
  comp?: Competition,
  overrideSplitCount?: number,
): SplitWarning {
  const plan = getSplitPlan(round, approvedCount, comp)
  const splitCount = Math.max(1, overrideSplitCount ?? plan.splitCount)
  if (splitCount > 1 && Math.floor(plan.approvedCount / splitCount) < plan.minPerGroup) return 'tooFew'
  return null
}

/** 报名阶段的估算 Split 数（报名截止前用人数估算，报名截止后由后台定）。 */
export function getEstimatedSplitCount(round: Round, approvedCount: number, comp?: Competition): number {
  const plan = getSplitPlan(round, approvedCount, comp)
  if (plan.splitCount > 1) return plan.splitCount
  if (approvedCount <= 0) return 1
  return Math.max(1, Math.ceil(approvedCount / plan.minPerGroup))
}

/** Round 的报名容量上限（来自 maxRegistrations，未设则无上限）。 */
export function getRoundCapacity(round: Round): number {
  return round.maxRegistrations ?? Infinity
}
