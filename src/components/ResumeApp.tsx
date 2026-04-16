import { Mail, Phone, Globe, MapPin } from 'lucide-react'

interface ExperienceItem {
  role: string
  company: string
  period: string
  location: string
  bullets: string[]
}

interface ProjectItem {
  name: string
  bullets: string[]
}

interface EducationItem {
  degree: string
  school: string
  period: string
}

interface SkillGroup {
  label: string
  items: string[]
}

const SUMMARY =
  'Backend & Microservices Developer with 2.5+ years of experience designing and building scalable, high-performance backend systems and distributed architectures. Strong expertise in Go, Node.js, and event-driven systems, with hands-on experience in AWS cloud infrastructure, queue-based processing, and real-time data pipelines. Proven ability to deliver production-grade systems, optimize performance, and handle high-throughput workloads across multi-tenant environments.'

const EXPERIENCE: ExperienceItem[] = [
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
    company: 'Pretestar OPC.',
    period: 'Jul 2024 – May 2025',
    location: 'India',
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

const SKILLS: SkillGroup[] = [
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

const PROJECTS: ProjectItem[] = [
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

const EDUCATION: EducationItem[] = [
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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {children}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export function ResumeApp() {
  return (
    <div className="max-w-3xl space-y-7 p-4 text-sm leading-relaxed">
      {/* Header — title left aligned */}
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold italic leading-none tracking-tight text-primary pb-1">
          Parth Degama
        </h1>
        <p className=" text-sm font-medium text-foreground">
          Software Engineer
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Phone className="size-3 text-primary" />
            +91 8866881066
          </li>
          <li className="flex items-center gap-1.5">
            <Mail className="size-3 text-primary" />
            <a
              href="mailto:hello@parthdegama.site"
              className="hover:text-foreground"
            >
              hello@parthdegama.site
            </a>
          </li>
          <li className="flex items-center gap-1.5">
            <Globe className="size-3 text-primary" />
            <a
              href="https://parthdegama.site"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              parthdegama.site
            </a>
          </li>
          <li className="flex items-center gap-1.5">
            {/* <Github className="size-3 text-primary" /> */}
            github.com
          </li>
          <li className="flex items-center gap-1.5">
            {/* <Linkedin className="size-3 text-primary" /> */}
            linkedin.com
          </li>
        </ul>
      </header>

      {/* Summary */}
      <section>
        <SectionHeader>Professional Summary</SectionHeader>
        <p className="text-muted-foreground">{SUMMARY}</p>
      </section>

      {/* Experience */}
      <section>
        <SectionHeader>Work Experience</SectionHeader>
        <div className="space-y-5">
          {EXPERIENCE.map((exp) => (
            <article key={exp.role + exp.company} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{exp.role}</h3>
                  <p className="text-xs italic text-primary">{exp.company}</p>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  <div>{exp.period}</div>
                  <div className="flex items-center justify-end gap-1">
                    <MapPin className="size-3" />
                    {exp.location}
                  </div>
                </div>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground marker:text-primary">
                {exp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <SectionHeader>Technical Skills</SectionHeader>
        <div className="space-y-2">
          {SKILLS.map((group) => (
            <div key={group.label} className="flex flex-wrap items-center gap-2">
              <span className="min-w-22 text-xs font-semibold text-primary">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <SectionHeader>Key Projects</SectionHeader>
        <div className="space-y-4">
          {PROJECTS.map((p) => (
            <article key={p.name} className="space-y-1.5">
              <h3 className="font-semibold text-primary">{p.name}</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground marker:text-primary">
                {p.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <SectionHeader>Education</SectionHeader>
        <div className="space-y-3">
          {EDUCATION.map((ed) => (
            <div
              key={ed.degree}
              className="flex flex-wrap items-baseline justify-between gap-2"
            >
              <div>
                <h3 className="font-semibold text-foreground">{ed.degree}</h3>
                <p className="text-xs italic text-primary">{ed.school}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {ed.period}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
