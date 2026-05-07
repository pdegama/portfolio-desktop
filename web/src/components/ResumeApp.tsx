import { LuMail, LuPhone, LuGlobe, LuMapPin } from 'react-icons/lu'
import { FaGithub, FaLinkedin } from 'react-icons/fa6'
import {
  PORTFOLIO_CONFIG,
  SUMMARY,
  EXPERIENCE,
  SKILLS,
  PROJECTS,
  EDUCATION,
} from '@/config/resume.config'

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
        {children}
      </h2>
      <div className="h-0.5 flex-1 bg-primary" />
    </div>
  )
}

export function ResumeApp() {
  return (
    <div className="max-w-3xl space-y-7 p-4 text-sm leading-relaxed">
      {/* Header — title left aligned */}
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold italic leading-none tracking-tight text-primary pb-1">
          {PORTFOLIO_CONFIG.name}
        </h1>
        <p className=" text-sm font-medium text-foreground">
          {PORTFOLIO_CONFIG.title}
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <LuPhone className="size-3 text-primary" />
            {PORTFOLIO_CONFIG.contact.phone}
          </li>
          <li className="flex items-center gap-1.5">
            <LuMail className="size-3 text-primary" />
            <a
              href={`mailto:${PORTFOLIO_CONFIG.contact.email}`}
              className="hover:text-foreground"
            >
              {PORTFOLIO_CONFIG.contact.email}
            </a>
          </li>
          <li className="flex items-center gap-1.5">
            <LuGlobe className="size-3 text-primary" />
            <a
              href={PORTFOLIO_CONFIG.contact.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              {PORTFOLIO_CONFIG.contact.website}
            </a>
          </li>
          <li className="flex items-center gap-1.5">
            <FaGithub className="size-3 text-primary" />
            <a
              href={PORTFOLIO_CONFIG.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              github.com
            </a>
          </li>
          <li className="flex items-center gap-1.5">
            <FaLinkedin className="size-3 text-primary" />
            <a
              href={PORTFOLIO_CONFIG.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              linkedin.com
            </a>
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
                    <LuMapPin className="size-3" />
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
                    className="border-t border-x border-primary/25 border-b-[3px] border-b-primary rounded bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground"
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
