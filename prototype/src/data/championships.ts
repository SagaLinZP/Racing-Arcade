export interface Championship {
  id: string
  name_zh: string
  name_en: string
  description_zh: string
  description_en: string
  coverImage: string
  regions: Array<'CN' | 'AP' | 'AM' | 'EU'>
  eventIds: string[]
  scoringRules_zh: string
  scoringRules_en: string
  progressionRules_zh?: string
  progressionRules_en?: string
  game: string
  carClass: string
  status: 'upcoming' | 'active' | 'completed'
}

export const championships: Championship[] = [
  {
    id: 'ch1',
    name_zh: 'MOZA GT3 挑战赛 2026',
    name_en: 'MOZA GT3 Challenge 2026',
    description_zh: 'MOZA Racing 官方GT3挑战赛，横跨全球四个区域的顶级GT3赛事。共5站比赛，积分最高者获得年度总冠军。',
    description_en: 'The official MOZA Racing GT3 Challenge, a premier GT3 series across all four regions. 5 rounds, highest points scorer wins the title.',
    coverImage: '',
    regions: ['CN', 'AP', 'AM', 'EU'],
    eventIds: ['e1'],
    scoringRules_zh: '第1名25分，第2名18分，第3名15分，第4名12分，第5名10分，第6名8分，第7名6分，第8名4分，第9名2分，第10名1分',
    scoringRules_en: '1st 25pts, 2nd 18pts, 3rd 15pts, 4th 12pts, 5th 10pts, 6th 8pts, 7th 6pts, 8th 4pts, 9th 2pts, 10th 1pt',
    game: 'ACC PC',
    carClass: 'GT3',
    status: 'active',
  },
  {
    id: 'ch2',
    name_zh: '亚太区耐力系列赛',
    name_en: 'AP Endurance Series',
    description_zh: '亚太区耐力系列赛，专注于长时间耐力赛的赛事系列。',
    description_en: 'The AP Endurance Series, focusing on long-distance endurance races.',
    coverImage: '',
    regions: ['AP', 'CN'],
    eventIds: ['e2'],
    scoringRules_zh: '耐力赛积分加倍',
    scoringRules_en: 'Endurance double points',
    game: 'ACC PC',
    carClass: 'GT3',
    status: 'active',
  },
  {
    id: 'ch3',
    name_zh: '欧非区LMP2锦标赛',
    name_en: 'EU LMP2 Championship',
    description_zh: '欧非区LMP2原型车锦标赛。',
    description_en: 'EU LMP2 Prototype Championship.',
    coverImage: '',
    regions: ['EU'],
    eventIds: ['e4'],
    scoringRules_zh: '标准FIA积分系统',
    scoringRules_en: 'Standard FIA points system',
    progressionRules_zh: '积分前10名晋级总决赛',
    progressionRules_en: 'Top 10 in points advance to finals',
    game: 'LMU PC',
    carClass: 'LMP2',
    status: 'active',
  },
]
