export interface Championship {
  id: string
  name_zh: string
  name_en: string
  description_zh: string
  description_en: string
  coverImage: string
  regions: Array<'CN' | 'AP' | 'AM' | 'EU'>
  game: string
  carClass: string
  carList?: string[]
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
  cancelRegistrationDeadlineOffset?: string
  accessRequirements?: string
  scoringRules_zh: string
  scoringRules_en: string
  progressionRules_zh?: string
  progressionRules_en?: string
  rules_zh?: string
  rules_en?: string
  resources_zh?: string
  resources_en?: string
  streamUrl?: string
  eventIds: string[]
  status: 'upcoming' | 'active' | 'completed'
}

export const championships: Championship[] = [
  {
    id: 'ch1',
    name_zh: 'MOZA GT3 挑战赛 2026',
    name_en: 'MOZA GT3 Challenge 2026',
    description_zh: 'MOZA Racing 官方GT3挑战赛，顶级GT3赛事。共5站比赛，积分最高者获得年度总冠军。',
    description_en: 'The official MOZA Racing GT3 Challenge, a premier GT3 series. 5 rounds, highest points scorer wins the title.',
    coverImage: '',
    regions: ['CN', 'AP', 'AM', 'EU'],
    game: 'ACC',
    carClass: 'GT3',
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
    cancelRegistrationDeadlineOffset: '2 hours before race start',
    accessRequirements: 'Must read and agree to the rules',
    scoringRules_zh: '第1名25分，第2名18分，第3名15分，第4名12分，第5名10分，第6名8分，第7名6分，第8名4分，第9名2分，第10名1分',
    scoringRules_en: '1st 25pts, 2nd 18pts, 3rd 15pts, 4th 12pts, 5th 10pts, 6th 8pts, 7th 6pts, 8th 4pts, 9th 2pts, 10th 1pt',
    progressionRules_zh: '5站总积分最高者获得年度总冠军，前3名晋级总决赛',
    progressionRules_en: 'Highest total points across 5 rounds wins the title. Top 3 advance to the grand final.',
    rules_zh: '1. 公平竞赛，禁止故意碰撞\n2. 服从管理员指示\n3. 使用真实姓名参赛',
    rules_en: '1. Fair play, no intentional contact\n2. Follow admin instructions\n3. Race under real name',
    resources_zh: 'ACC GT3 车辆包：https://example.com/gt3-pack\n安装说明：解压至 ACC 用户目录下的 Content/Cars 文件夹',
    resources_en: 'ACC GT3 Car Pack: https://example.com/gt3-pack\nInstall: Extract to Content/Cars folder in your ACC user directory',
    streamUrl: 'https://twitch.tv/mozaracing',
    eventIds: ['e22', 'e12', 'e9', 'e1', 'e14', 'e15', 'e23'],
    status: 'active',
  },
  {
    id: 'ch2',
    name_zh: '耐力系列赛',
    name_en: 'Endurance Series',
    description_zh: '耐力系列赛，专注于长时间耐力赛的赛事系列。共6站，考验车手的持久力和策略。',
    description_en: 'The Endurance Series, focusing on long-distance endurance races. 6 rounds testing driver stamina and strategy.',
    coverImage: '',
    regions: ['AP', 'CN'],
    game: 'ACC',
    carClass: 'GT3',
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
    cancelRegistrationDeadlineOffset: '4 hours before race start',
    accessRequirements: 'Minimum 10 ACC races completed',
    scoringRules_zh: '耐力赛积分加倍：第1名50分，第2名36分，第3名30分，第4名24分，第5名20分，第6名16分，第7名12分，第8名8分，第9名4分，第10名2分',
    scoringRules_en: 'Endurance double points: 1st 50pts, 2nd 36pts, 3rd 30pts, 4th 24pts, 5th 20pts, 6th 16pts, 7th 12pts, 8th 8pts, 9th 4pts, 10th 2pts',
    progressionRules_zh: '6站总积分最高者获得系列赛冠军',
    progressionRules_en: 'Highest total points across 6 rounds wins the series.',
    rules_zh: '1. 必须进站至少1次\n2. 进站窗口为赛程30%-70%\n3. 禁止使用TC大于3',
    rules_en: '1. Mandatory pit stop at least once\n2. Pit window is 30%-70% of race duration\n3. TC above 3 is prohibited',
    resources_zh: '耐力赛准备指南：https://example.com/endurance-guide',
    resources_en: 'Endurance Prep Guide: https://example.com/endurance-guide',
    streamUrl: 'https://twitch.tv/mozaap',
    eventIds: ['e24', 'e11', 'e2', 'e16', 'e25', 'e26'],
    status: 'active',
  },
  {
    id: 'ch3',
    name_zh: 'GT3锦标赛',
    name_en: 'GT3 Championship',
    description_zh: 'GT3锦标赛，6站激烈角逐，在经典赛道上体验GT3竞速。',
    description_en: 'GT3 Championship, 6 thrilling rounds on classic circuits.',
    coverImage: '',
    regions: ['EU'],
    game: 'LMU',
    carClass: 'GT3',
    weather: 'Dynamic',
    hasPitstop: true,
    practiceDuration: 30,
    qualifyingDuration: 15,
    raceDuration: 90,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    maxSplits: 2,
    enableMultiSplit: true,
    splitAssignmentRule: 'By Skill',
    minEntries: 10,
    cancelRegistrationDeadlineOffset: '2 hours before race start',
    accessRequirements: 'LMU license required, minimum 5 LMU races completed',
    scoringRules_zh: '标准FIA积分系统：第1名25分，第2名18分，第3名15分，第4名12分，第5名10分，第6名8分，第7名6分，第8名4分，第9名2分，第10名1分',
    scoringRules_en: 'Standard FIA points system: 1st 25pts, 2nd 18pts, 3rd 15pts, 4th 12pts, 5th 10pts, 6th 8pts, 7th 6pts, 8th 4pts, 9th 2pts, 10th 1pt',
    progressionRules_zh: '积分前10名晋级总决赛',
    progressionRules_en: 'Top 10 in points advance to finals',
    rules_zh: '1. 所有车手必须使用 GT3 车辆\n2. 需进站换人（耐力赛）\n3. 动态天气需准备雨胎策略',
    rules_en: '1. All drivers must use GT3 cars\n2. Driver change pit stop required (endurance)\n3. Prepare wet tire strategy for dynamic weather',
    resources_zh: 'GT3 入门指南：https://example.com/lmp2-guide\nLMU 设置教程：https://example.com/lmu-setup',
    resources_en: 'GT3 Beginner Guide: https://example.com/lmp2-guide\nLMU Setup Tutorial: https://example.com/lmu-setup',
    streamUrl: 'https://youtube.com/mozaracing',
    eventIds: ['e27', 'e4', 'e17', 'e18', 'e28', 'e29'],
    status: 'active',
  },
  {
    id: 'ch4',
    name_zh: '冲刺杯',
    name_en: 'Sprint Cup',
    description_zh: 'GT4冲刺杯赛，短距离高速竞速，4站比赛决出冠军。',
    description_en: 'GT4 Sprint Cup, short-distance high-speed racing. 4 rounds to crown the champion.',
    coverImage: '',
    regions: ['CN'],
    game: 'ACC',
    carClass: 'GT4',
    weather: 'Overcast',
    hasPitstop: false,
    practiceDuration: 20,
    qualifyingDuration: 10,
    raceDuration: 30,
    raceDurationType: 'time',
    maxEntriesPerSplit: 25,
    enableMultiSplit: false,
    minEntries: 8,
    cancelRegistrationDeadlineOffset: '1 hour before race start',
    accessRequirements: 'Invite only',
    scoringRules_zh: '第1名25分，第2名18分，第3名15分，第4名12分，第5名10分，第6名8分，第7名6分，第8名4分，第9名2分，第10名1分',
    scoringRules_en: '1st 25pts, 2nd 18pts, 3rd 15pts, 4th 12pts, 5th 10pts, 6th 8pts, 7th 6pts, 8th 4pts, 9th 2pts, 10th 1pt',
    rules_zh: '1. 仅限受邀车手参加\n2. 使用GT4车型\n3. 禁止TC和ABS辅助',
    rules_en: '1. Invite only drivers\n2. GT4 cars only\n3. TC and ABS assists prohibited',
    resources_zh: 'GT4 调校指南：https://example.com/gt4-setup-cn',
    resources_en: 'GT4 Setup Guide: https://example.com/gt4-setup-cn',
    eventIds: ['e30', 'e20', 'e19', 'e31'],
    status: 'active',
  },
  {
    id: 'ch5',
    name_zh: '全球Formula新手赛',
    name_en: 'Global Formula Rookie',
    description_zh: '面向新手车手的Formula赛事，5站比赛，入门级方程式赛车体验。',
    description_en: 'Formula racing for rookie drivers. 5 rounds of entry-level open-wheel racing.',
    coverImage: '',
    regions: ['CN', 'AP', 'AM', 'EU'],
    game: 'iRacing',
    carClass: 'Formula',
    weather: 'Clear',
    hasPitstop: false,
    practiceDuration: 15,
    qualifyingDuration: 10,
    raceDuration: 12,
    raceDurationType: 'laps',
    maxEntriesPerSplit: 20,
    enableMultiSplit: false,
    minEntries: 6,
    cancelRegistrationDeadlineOffset: '1 hour before race start',
    accessRequirements: 'Open to all rookie drivers (totalEntries < 20)',
    scoringRules_zh: '第1名25分，第2名18分，第3名15分，第4名12分，第5名10分，第6名8分，第7名6分，第8名4分，第9名2分，第10名1分',
    scoringRules_en: '1st 25pts, 2nd 18pts, 3rd 15pts, 4th 12pts, 5th 10pts, 6th 8pts, 7th 6pts, 8th 4pts, 9th 2pts, 10th 1pt',
    progressionRules_zh: '5站总积分最高者获得冠军',
    progressionRules_en: 'Highest total points across 5 rounds wins the championship.',
    rules_zh: '1. 仅限新手车手（参赛次数<20）\n2. 禁止使用驾驶辅助\n3. 尊重赛道界限',
    rules_en: '1. Rookie drivers only (totalEntries < 20)\n2. No driving assists allowed\n3. Respect track limits',
    streamUrl: 'https://twitch.tv/mozaformula',
    eventIds: ['e32', 'e8', 'e21', 'e33', 'e34'],
    status: 'active',
  },
]
