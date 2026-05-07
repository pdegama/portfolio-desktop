import { FaGithub } from 'react-icons/fa6'
import { ABOUT_CONFIG } from '@/config/about.config'

export function AboutApp() {
  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-2xl font-semibold">{ABOUT_CONFIG.name}</h3>
      <p className="text-muted-foreground">
        {ABOUT_CONFIG.description}
      </p>
      <div className="space-y-1 text-muted-foreground">
        <p>Version {ABOUT_CONFIG.version}</p>
        <p>Made by {ABOUT_CONFIG.author}</p>
      </div>
      <a
        href={ABOUT_CONFIG.githubUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <FaGithub className="size-3.5" />
        View Source on GitHub
      </a>
    </div>
  )
}
