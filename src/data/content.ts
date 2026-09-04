export interface SkillGroup {
  title: string
  icon: string
  items: string[]
  note: string
}

export const skillGroups: SkillGroup[] = [
  {
    title: '擅长 · 熟练',
    icon: 'rocket', // mdiRocketLaunch
    items: ['JavaScript', 'TypeScript', 'C#', 'Lua', 'Rust', 'Vue', 'React'],
    note: '常用它们把事情做扎实、把复杂拆解成简单。',
  },
  {
    title: '了解 · 会用',
    icon: 'toolbox', // mdiToolbox
    items: ['C', 'Java', 'Spring', 'Python', 'Go', 'Svelete'],
    note: '需要时能上手,不强行炫技。',
  },
]

export interface Project {
  name: string
  org: string
  href: string
  icon: string
  desc: string
  role: string
}

export const projects: Project[] = [
  {
    name: 'Terra',
    org: 'PolyhedralDev',
    href: 'https://github.com/PolyhedralDev/Terra',
    icon: 'earth', // mdiEarth
    desc: '开源的MC世界生成平台,支持自定义地形与生物群系。',
    role: '参与者',
  },
  {
    name: 'Youer',
    org: 'MohistMC',
    href: 'https://github.com/MohistMC/Youer',
    icon: 'wrench', // mdiWrench
    desc: 'MohistMC 生态下的核心项目,以你的视角服务社区。',
    role: '参与者',
  },
  {
    name: 'qisoul · 栖所',
    org: 'Cloudery Studio',
    href: 'https://github.com/ClouderyStudio/qisoul',
    icon: 'home', // mdiHome
    desc: '温暖、安全的心理健康互助社区。支持心情记录与趋势图表。',
    role: '核心成员',
  },
  {
    name: 'psychology · 心灵驿站',
    org: 'Cloudery Studio',
    href: 'https://github.com/ClouderyStudio/psychology',
    icon: 'heart', // mdiHeart
    desc: '专业心理健康测评平台，提供 PHQ-9、GAD-7、SCL-90、MBTI 等 20+ 标准量表。隐私优先：所有数据本地存储，不上传服务器。',
    role: '核心成员',
  },
]

export const games = [
  { name: '我的世界 Minecraft', note: '最爱、也玩得最久的游戏', icon: 'minecraft', highlight: true },
  { name: '恐鬼症 Phasmophobia', note: '心理恐怖', icon: 'ghost', highlight: true },
  { name: '逃离后室 Escape the Backrooms', note: '心理恐怖(Backrooms)', icon: 'key', highlight: true },
  { name: '门 Doors', note: '心理恐怖', icon: 'door', highlight: true },
]

export const roles = [
  '在读学生',
  '云术工作室核心成员',
  '开源贡献者',
  '「竹像素」公益服主',
  '喜欢把复杂变简单的程序员',
]
