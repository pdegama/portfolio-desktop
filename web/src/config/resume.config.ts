export interface ExperienceItem {
  role: string
  company: string
  period: string
  location: string
  bullets: string[]
}

export interface ProjectItem {
  name: string
  bullets: string[]
}

export interface EducationItem {
  degree: string
  school: string
  period: string
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface PortfolioConfig {
  name: string
  title: string
  portfolioGithubUrl: string
  contact: {
    phone: string
    email: string
    website: string
    websiteUrl: string
  }
  socialLinks: {
    github: string
    linkedin: string
  }
}

export const PORTFOLIO_CONFIG: PortfolioConfig = {
  name: 'Parth Degama',
  title: 'Software Engineer',
  portfolioGithubUrl: 'https://github.com/ParthDegworker/portfolio-desktop',
  contact: {
    phone: '+91 8866881066',
    email: 'hello@parthdegama.site',
    website: 'parthdegama.site',
    websiteUrl: 'https://parthdegama.site',
  },
  socialLinks: {
    github: 'https://github.com/ParthDegworker',
    linkedin: 'https://linkedin.com/in/parth-degama',
  },
}

export const SUMMARY =
  'Backend & Microservices Developer with 2.5+ years of experience designing and building scalable, high-performance backend systems and distributed architectures. Strong expertise in Go, Node.js, and event-driven systems, with hands-on experience in AWS cloud infrastructure, queue-based processing, and real-time data pipelines. Proven ability to deliver production-grade systems, optimize performance, and handle high-throughput workloads across multi-tenant environments.'

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Back-End and Micro-Services Developer',
    company: 'Empiric Infotech LLP',
    period: 'Jul 2025 – Present',
    location: 'Surat, Gujarat',
    bullets: [
      'Built a multi-tenant ATS (SaaS) platform replacing legacy systems with improved scalability.',
      'Designed tenant isolation, sharding, and Elasticsearch pipelines for large-scale data handling.',
      'Developed microservices using Node.js and Docker, deployed on AWS (ECS, SQS, SNS, EC2, Lambda).',
      'Implemented event-driven architectures for reliable async processing.',
    ],
  },
  {
    role: 'GoLang Developer',
    company: 'Stealth Startup',
    period: 'Jul 2024 – May 2025',
    location: 'Remote',
    bullets: [
      'Built SMTP server and client as independent microservices using Go.',
      'Designed scalable email delivery system with queue-based processing and spam filtering.',
      'Optimized concurrency for high-throughput email processing.',
    ],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Codeverse Weenggs',
    period: 'Mar 2024 – May 2024',
    location: 'Surat, Gujarat',
    bullets: [
      'Processed 5,000–7,000 data points/min from 3,000+ machines.',
      'Built multi-tenant backend systems with high-throughput queue processing.',
    ],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Leven Plus',
    period: 'Jun 2023 – Dec 2023',
    location: 'Surat, Gujarat',
    bullets: [
      'Developed ERP system with RFID-based attendance automation.',
      'Built CanvasLib and implemented Docker + CI/CD workflows.',
    ],
  },
]

export const SKILLS: SkillGroup[] = [
  { label: 'Languages', items: ['JavaScript', 'TypeScript', 'Go', 'Python', 'C'] },
  {
    label: 'Backend',
    items: ['Node.js', 'Microservices', 'REST APIs', 'Distributed Systems', 'RAG'],
  },
  { label: 'Frontend', items: ['React', 'Next.js'] },
  {
    label: 'Databases',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Elasticsearch', 'Chroma'],
  },
  { label: 'Messaging', items: ['RabbitMQ', 'Kafka'] },
  { label: 'Cloud', items: ['AWS — ECS, EC2, SQS, SNS, VPC, Lambda'] },
  { label: 'DevOps', items: ['Docker', 'CI/CD', 'Jenkins', 'Linux'] },
]

export const PROJECTS: ProjectItem[] = [
  {
    name: 'My Ayur — Healthcare Platform',
    bullets: [
      'Designed microservices backend with 4–5 independent services using Node.js and Docker.',
      'Implemented event-driven workflows handling 20k+ notifications/day using AWS SNS and SQS.',
      'Reduced API response time by 40–50% using Redis caching.',
      'Built CI/CD pipelines with GitHub Actions and AWS for automated deployment.',
      'Implemented secure authentication using JWT and RBAC.',
    ],
  },
  {
    name: 'Box SMTP Server & Levify Mail',
    bullets: [
      'Built a custom SMTP server and email client with real-time capabilities.',
      'Designed queue-based architecture using Go and RabbitMQ.',
      'Enabled scalable email delivery and tracking system.',
    ],
  },
  {
    name: 'Multi-Tenant ATS (SaaS)',
    bullets: [
      'Developed scalable SaaS platform with tenant isolation and sharding.',
      'Integrated Elasticsearch pipelines for fast and efficient querying.',
      'Designed system to handle large-scale multi-client workloads.',
    ],
  },
]

export const EDUCATION: EducationItem[] = [
  {
    degree: 'B.Tech in Information Technology',
    school: 'Bhagwan Mahavir University',
    period: '2023 – 2026',
  },
  {
    degree: 'Diploma in Information Technology',
    school: 'Uka Tarsadia University',
    period: '2020 – 2023',
  },
]
