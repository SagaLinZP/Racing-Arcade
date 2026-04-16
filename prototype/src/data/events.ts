export type EventStatus = 'Draft' | 'RegistrationOpen' | 'RegistrationClosed' | 'InProgress' | 'Completed' | 'ResultsPublished' | 'Cancelled'

export interface SimEvent {
  id: string
  name_zh: string
  name_en: string
  description_zh: string
  description_en: string
  coverImage: string
  game: string
  track: string
  trackLayout?: string
  carClass: string
  championshipId?: string
  regions: Array<'CN' | 'AP' | 'AM' | 'EU'>
  weather?: string
  hasPitstop: boolean
  practiceDuration?: number
  qualifyingDuration?: number
  raceDuration: number
  raceDurationType: 'time' | 'laps'
  maxEntriesPerSplit: number
  maxSplits?: number
  enableMultiSplit: boolean
  splitAssignmentRule?: string
  minEntries?: number
  registrationCloseAt: string
  cancelRegistrationDeadline?: string
  eventStartTime: string
  status: EventStatus
  accessRequirements?: string
  rules_zh?: string
  rules_en?: string
  serverInfo?: string
  serverPassword?: string
  serverJoinLink?: string
  streamUrl?: string
  vodUrl?: string
  scoringRules_zh?: string
  scoringRules_en?: string
  resources_zh?: string
  resources_en?: string
  currentRegistrations: number
  registeredDriverIds: string[]
  results?: EventResult[]
  cancelledReason_zh?: string
  cancelledReason_en?: string
}

export interface EventResult {
  position: number
  driverId: string
  teamId?: string
  splitNumber: number
  totalTime: string
  bestLap: string
  lapsCompleted: number
  gapToLeader: string
  status: 'Finished' | 'DNF' | 'DNS' | 'DSQ'
  penalty?: string
  points: number
}

const coverColors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#2b2d42', '#1b263b', '#415a77', '#2d6a4f']

export function getCoverGradient(id: string): string {
  const idx = parseInt(id.replace(/\D/g, ''), 10) || 0
  const c1 = coverColors[idx % coverColors.length]
  const c2 = coverColors[(idx + 3) % coverColors.length]
  return `linear-gradient(135deg, ${c1}, ${c2})`
}

export const events: SimEvent[] = [
  {
    id: 'e1',
    name_zh: 'MOZA GT3 挑战赛 - 蒙扎站',
    name_en: 'MOZA GT3 Challenge - Monza',
    description_zh: 'MOZA Racing 官方GT3挑战赛第一站，在意大利蒙扎国家赛道举行。欢迎所有GT3爱好者参加！',
    description_en: 'Round 1 of the MOZA Racing Official GT3 Challenge at Monza National Circuit. All GT3 enthusiasts welcome!',
    coverImage: '',
    game: 'ACC PC',
    track: 'Monza',
    trackLayout: 'GP',
    carClass: 'GT3',
    championshipId: 'ch1',
    regions: ['CN', 'AP', 'AM', 'EU'],
    weather: 'Dynamic',
    hasPitstop: true,
    practiceDuration: 30,
    qualifyingDuration: 15,
    raceDuration: 60,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    maxSplits: 4,
    enableMultiSplit: true,
    splitAssignmentRule: 'By Skill',
    minEntries: 10,
    registrationCloseAt: '2026-04-18T12:00:00Z',
    cancelRegistrationDeadline: '2026-04-17T12:00:00Z',
    eventStartTime: '2026-04-20T12:00:00Z',
    status: 'RegistrationOpen',
    accessRequirements: 'Must read and agree to the rules',
    rules_zh: '1. 公平竞赛，禁止故意碰撞\n2. 服从管理员指示\n3. 使用真实姓名参赛',
    rules_en: '1. Fair play, no intentional contact\n2. Follow admin instructions\n3. Race under real name',
    scoringRules_zh: '第1名 25分，第2名 18分，第3名 15分，第4名 12分，第5名 10分...',
    scoringRules_en: '1st 25pts, 2nd 18pts, 3rd 15pts, 4th 12pts, 5th 10pts...',
    currentRegistrations: 87,
    registeredDriverIds: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10'],
    resources_zh: 'ACC GT3 车辆包：https://example.com/gt3-pack\n安装说明：解压至 ACC 用户目录下的 Content/Cars 文件夹',
    resources_en: 'ACC GT3 Car Pack: https://example.com/gt3-pack\nInstall: Extract to Content/Cars folder in your ACC user directory',
  },
  {
    id: 'e2',
    name_zh: '亚太区耐力系列赛 - 铃鹿',
    name_en: 'AP Endurance Series - Suzuka',
    description_zh: '亚太区耐力系列赛第二站，在日本铃鹿赛道进行2小时耐力赛。',
    description_en: 'Round 2 of the AP Endurance Series, a 2-hour endurance race at Suzuka Circuit, Japan.',
    coverImage: '',
    game: 'ACC PC',
    track: 'Suzuka',
    trackLayout: 'GP',
    carClass: 'GT3',
    championshipId: 'ch2',
    regions: ['AP', 'CN'],
    weather: 'Clear',
    hasPitstop: true,
    practiceDuration: 45,
    qualifyingDuration: 20,
    raceDuration: 120,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    maxSplits: 2,
    enableMultiSplit: true,
    splitAssignmentRule: 'By Skill',
    minEntries: 15,
    registrationCloseAt: '2026-04-22T12:00:00Z',
    eventStartTime: '2026-04-25T06:00:00Z',
    status: 'RegistrationOpen',
    currentRegistrations: 42,
    registeredDriverIds: ['d2', 'd6', 'd9'],
  },
  {
    id: 'e3',
    name_zh: '美洲区冲刺赛 - 考斯沃斯',
    name_en: 'AM Sprint Race - COTA',
    description_zh: '美洲区冲刺赛，在美国奥斯汀考斯沃斯赛道举行。',
    description_en: 'AM Sprint Race at Circuit of the Americas, Austin, Texas.',
    coverImage: '',
    game: 'iRacing PC',
    track: 'COTA',
    carClass: 'Porsche Cup',
    regions: ['AM'],
    weather: 'Clear',
    hasPitstop: false,
    practiceDuration: 20,
    qualifyingDuration: 10,
    raceDuration: 15,
    raceDurationType: 'laps',
    maxEntriesPerSplit: 25,
    enableMultiSplit: false,
    registrationCloseAt: '2026-04-19T18:00:00Z',
    eventStartTime: '2026-04-20T22:00:00Z',
    status: 'RegistrationOpen',
    currentRegistrations: 18,
    registeredDriverIds: ['d3', 'd7'],
  },
  {
    id: 'e4',
    name_zh: '欧非区LMP2锦标赛 - 斯帕',
    name_en: 'EU LMP2 Championship - Spa',
    description_zh: '欧非区LMP2锦标赛第一站，在比利时斯帕赛道举行。',
    description_en: 'Round 1 of the EU LMP2 Championship at Spa-Francorchamps, Belgium.',
    coverImage: '',
    game: 'LMU PC',
    track: 'Spa-Francorchamps',
    carClass: 'LMP2',
    championshipId: 'ch3',
    regions: ['EU'],
    weather: 'Dynamic',
    hasPitstop: true,
    practiceDuration: 30,
    qualifyingDuration: 15,
    raceDuration: 90,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    maxSplits: 2,
    enableMultiSplit: true,
    registrationCloseAt: '2026-04-14T18:00:00Z',
    eventStartTime: '2026-04-16T18:00:00Z',
    status: 'Completed',
    currentRegistrations: 45,
    registeredDriverIds: ['d4', 'd8', 'd10'],
    serverInfo: 'MOZA EU LMP2 Server 1',
    serverPassword: 'moza2026',
    results: [
      { position: 1, driverId: 'd8', splitNumber: 1, totalTime: '1:28:15.234', bestLap: '1:58.342', lapsCompleted: 45, gapToLeader: '-', status: 'Finished', points: 25 },
      { position: 2, driverId: 'd4', splitNumber: 1, totalTime: '1:28:32.891', bestLap: '1:59.102', lapsCompleted: 45, gapToLeader: '+17.657', status: 'Finished', points: 18 },
      { position: 3, driverId: 'd10', splitNumber: 1, totalTime: '1:29:01.567', bestLap: '1:59.445', lapsCompleted: 45, gapToLeader: '+46.333', status: 'Finished', points: 15 },
      { position: 4, driverId: 'd1', splitNumber: 1, totalTime: '1:30:12.123', bestLap: '2:00.678', lapsCompleted: 44, gapToLeader: '+1L', status: 'Finished', points: 12 },
      { position: 5, driverId: 'd3', splitNumber: 1, totalTime: '', bestLap: '2:01.234', lapsCompleted: 38, gapToLeader: 'DNF', status: 'DNF', points: 0 },
    ],
  },
  {
    id: 'e5',
    name_zh: '中国区GT4杯 - 上海',
    name_en: 'CN GT4 Cup - Shanghai',
    description_zh: '中国区GT4杯赛，在上海国际赛车场举行。',
    description_en: 'CN GT4 Cup at Shanghai International Circuit.',
    coverImage: '',
    game: 'ACC PC',
    track: 'Shanghai',
    carClass: 'GT4',
    regions: ['CN'],
    weather: 'Overcast',
    hasPitstop: false,
    practiceDuration: 20,
    qualifyingDuration: 10,
    raceDuration: 30,
    raceDurationType: 'time',
    maxEntriesPerSplit: 25,
    enableMultiSplit: false,
    registrationCloseAt: '2026-04-23T12:00:00Z',
    eventStartTime: '2026-04-25T12:00:00Z',
    status: 'RegistrationOpen',
    currentRegistrations: 12,
    registeredDriverIds: ['d1', 'd5'],
  },
  {
    id: 'e6',
    name_zh: '全球GT3对决 - 银石',
    name_en: 'Global GT3 Showdown - Silverstone',
    description_zh: '全球GT3对决赛，在英国银石赛道举行，面向所有区域开放。',
    description_en: 'Global GT3 Showdown at Silverstone Circuit, UK. Open to all regions.',
    coverImage: '',
    game: 'AC Evo PC',
    track: 'Silverstone',
    trackLayout: 'GP',
    carClass: 'GT3',
    regions: ['CN', 'AP', 'AM', 'EU'],
    weather: 'Dynamic',
    hasPitstop: true,
    practiceDuration: 30,
    qualifyingDuration: 15,
    raceDuration: 60,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    maxSplits: 3,
    enableMultiSplit: true,
    splitAssignmentRule: 'First Come First Served',
    registrationCloseAt: '2026-04-28T12:00:00Z',
    eventStartTime: '2026-04-30T14:00:00Z',
    status: 'RegistrationOpen',
    currentRegistrations: 0,
    registeredDriverIds: [],
  },
  {
    id: 'e7',
    name_zh: 'MOZA 独立赛 - 纽博格林',
    name_en: 'MOZA Standalone - Nürburgring',
    description_zh: 'MOZA独立赛事，在德国纽博格林赛道举行。该赛事已被取消。',
    description_en: 'MOZA Standalone event at Nürburgring, Germany. This event has been cancelled.',
    coverImage: '',
    game: 'ACC PC',
    track: 'Nürburgring',
    trackLayout: 'GP',
    carClass: 'GT3',
    regions: ['EU'],
    weather: 'Dynamic',
    hasPitstop: true,
    practiceDuration: 30,
    qualifyingDuration: 15,
    raceDuration: 60,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    enableMultiSplit: false,
    registrationCloseAt: '2026-04-08T12:00:00Z',
    eventStartTime: '2026-04-10T18:00:00Z',
    status: 'Cancelled',
    cancelledReason_zh: '由于报名人数不足，本场赛事已取消。',
    cancelledReason_en: 'This event has been cancelled due to insufficient registrations.',
    currentRegistrations: 5,
    registeredDriverIds: [],
  },
  {
    id: 'e8',
    name_zh: '亚太区Formula新手赛 - 富士',
    name_en: 'AP Formula Rookie - Fuji',
    description_zh: '亚太区Formula新手赛，在日本富士赛道举行。',
    description_en: 'AP Formula Rookie race at Fuji Speedway, Japan.',
    coverImage: '',
    game: 'iRacing PC',
    track: 'Fuji',
    carClass: 'Formula',
    regions: ['AP', 'CN'],
    weather: 'Clear',
    hasPitstop: false,
    practiceDuration: 15,
    qualifyingDuration: 10,
    raceDuration: 12,
    raceDurationType: 'laps',
    maxEntriesPerSplit: 20,
    enableMultiSplit: false,
    registrationCloseAt: '2026-04-26T12:00:00Z',
    eventStartTime: '2026-04-28T08:00:00Z',
    status: 'RegistrationOpen',
    currentRegistrations: 8,
    registeredDriverIds: ['d2', 'd9'],
  },
]
