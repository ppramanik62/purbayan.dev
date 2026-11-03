import raw from "../content/experience.json"
import { parseArray, parseObject, parseString, parseStringArray, parseUrl } from "./parse"

export interface Experience {
  company: string
  url: string
  role: string
  /** Shown in the margin. Put the line break where the dash is. */
  period: string
  summary: string
  work: readonly string[]
}

const FILE = "content/experience.json"

function parseExperience(value: unknown, where: string): Experience {
  const job = parseObject(value, where)
  return {
    company: parseString(job.company, `${where}.company`),
    url: parseUrl(job.url, `${where}.url`),
    role: parseString(job.role, `${where}.role`),
    period: parseString(job.period, `${where}.period`),
    summary: parseString(job.summary, `${where}.summary`),
    work: parseStringArray(job.work, `${where}.work`),
  }
}

/** Jobs on /experience, newest first. Edit `src/content/experience.json`. */
export const experiences: readonly Experience[] = parseArray(raw, FILE).map((job, i) =>
  parseExperience(job, `${FILE} [${i}]`),
)
