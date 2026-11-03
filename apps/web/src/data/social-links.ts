import raw from "../content/social-links.json"
import { parseObject, parseString, parseUrl } from "./parse"

export interface SocialLink {
  url: string
  label: string
  display: string
}

/** The pages link to these by name, so each one must be in the file. */
const NETWORKS = ["github", "linkedin", "x", "email"] as const

type Network = (typeof NETWORKS)[number]

const FILE = "content/social-links.json"

function parseLink(value: unknown, where: string): SocialLink {
  const link = parseObject(value, where)
  return {
    url: parseUrl(link.url, `${where}.url`),
    label: parseString(link.label, `${where}.label`),
    display: parseString(link.display, `${where}.display`),
  }
}

function parseSocial(value: unknown): Record<Network, SocialLink> {
  const links = parseObject(value, FILE)
  return Object.fromEntries(
    NETWORKS.map((name) => [name, parseLink(links[name], `${FILE} .${name}`)]),
  ) as Record<Network, SocialLink>
}

/** Edit `src/content/social-links.json`. */
export const SOCIAL: Readonly<Record<Network, Readonly<SocialLink>>> = parseSocial(raw)
