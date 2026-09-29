import 'server-only'

const REQUEST_TIMEOUT_MS = 5_000
/**
 * 토큰 없이 부르는 GitHub 검색 API 는 분당 10번이 한도다. 별 수는 하루 사이에 순위가 뒤집힐 만큼 바뀌지 않으니
 * 조직마다 하루 묵혀, 화면을 열 때마다 한도를 쓰지 않게 한다.
 */
const REVALIDATE_SECONDS = 86_400
/** 한 조직에서 보여 줄 저장소 수. 이름난 것만 소개하는 화면이라 끝까지 늘어놓지 않는다. */
const REPOSITORY_LIMIT = 30

export interface PopularOrganization {
  login: string
  name: string
  /** 이 조직 아래에 무엇이 있는지 한 줄로. 저장소 목록 위에 붙는다. */
  summary: string
}

/**
 * 많이 쓰는 라이브러리를 내놓는 조직. 저장소 하나씩이 아니라 조직으로 묶는다 —
 * React 를 쓰면 Jest·Relay 도 같은 곳에서 나온다는 것까지 한눈에 보인다.
 * 늘리려면 여기에 한 줄 더하면 된다(login 은 github.com/<login> 의 그 이름).
 * as const — 튜플로 굳혀야 [0] 이 "없을 수도 있는 값"이 되지 않는다(고른 조직이 없을 때 첫 조직을 연다).
 */
export const POPULAR_ORGANIZATIONS = [
  // React·React Native 는 2026년 React Foundation 으로 옮겨 facebook 이 아니라 react 조직 아래에 있다. Jest 는 jestjs 로 나갔다.
  { login: 'react', name: 'React', summary: 'React · React Native' },
  { login: 'facebook', name: 'Meta', summary: 'Docusaurus · RocksDB · Folly · Lexical · zstd' },
  { login: 'jestjs', name: 'Jest', summary: 'Jest 테스트 러너' },
  { login: 'vercel', name: 'Vercel', summary: 'Next.js · SWR · Turborepo · AI SDK' },
  { login: 'microsoft', name: 'Microsoft', summary: 'TypeScript · VS Code · Playwright' },
  { login: 'google', name: 'Google', summary: 'Guava · Gson · zx · 여러 공용 라이브러리' },
  { login: 'vuejs', name: 'Vue', summary: 'Vue · Vue Router · Pinia · VitePress' },
  { login: 'angular', name: 'Angular', summary: 'Angular · Angular CLI · Components' },
  { login: 'sveltejs', name: 'Svelte', summary: 'Svelte · SvelteKit' },
  { login: 'vitejs', name: 'Vite', summary: 'Vite 와 공식 플러그인' },
  { login: 'TanStack', name: 'TanStack', summary: 'Query · Table · Router · Virtual' },
  { login: 'reduxjs', name: 'Redux', summary: 'Redux · Redux Toolkit · React Redux' },
  { login: 'pmndrs', name: 'Poimandres', summary: 'Zustand · Jotai · react-three-fiber' },
  { login: 'tailwindlabs', name: 'Tailwind Labs', summary: 'Tailwind CSS · Headless UI · Heroicons' },
  { login: 'nodejs', name: 'Node.js', summary: 'Node.js 런타임과 undici 등 핵심 모듈' },
  { login: 'denoland', name: 'Deno', summary: 'Deno 런타임 · Fresh' },
  { login: 'oven-sh', name: 'Bun', summary: 'Bun 런타임' },
  { login: 'nestjs', name: 'NestJS', summary: 'Nest 프레임워크와 공식 모듈' },
  { login: 'prisma', name: 'Prisma', summary: 'Prisma ORM' },
  { login: 'spring-projects', name: 'Spring', summary: 'Spring Framework · Spring Boot · Spring Security' },
  { login: 'square', name: 'Square', summary: 'OkHttp · Retrofit · Okio' },
  { login: 'JetBrains', name: 'JetBrains', summary: 'Kotlin · Compose Multiplatform · Exposed' },
  { login: 'apache', name: 'Apache', summary: 'Kafka · Spark · Flink · Dubbo' },
  { login: 'golang', name: 'Go', summary: 'Go 언어와 도구' },
  { login: 'rust-lang', name: 'Rust', summary: 'Rust 언어 · Cargo · rustlings' },
  { login: 'pytorch', name: 'PyTorch', summary: 'PyTorch · torchvision' },
  { login: 'huggingface', name: 'Hugging Face', summary: 'Transformers · Diffusers · Datasets' },
  { login: 'kubernetes', name: 'Kubernetes', summary: 'Kubernetes · kubectl · minikube' },
  { login: 'docker', name: 'Docker', summary: 'Compose · Buildx · 공식 이미지' },
  { login: 'hashicorp', name: 'HashiCorp', summary: 'Terraform · Vault · Consul' },
  { login: 'grafana', name: 'Grafana Labs', summary: 'Grafana · Loki · k6' },
] as const satisfies readonly PopularOrganization[]

export interface OrganizationRepository {
  name: string
  fullName: string
  url: string
  description: string | null
  language: string | null
  topics: string[]
  stars: number
  forks: number
  isArchived: boolean
  pushedAt: string | null
}

interface GithubRepositoryResponse {
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  topics?: string[]
  stargazers_count: number
  forks_count: number
  archived: boolean
  pushed_at: string | null
}

/**
 * 조직의 공개 저장소를 별 순으로. 포크는 뺀다 — 남의 것을 가져다 둔 것이지 이 조직이 내놓은 것이 아니다.
 *
 * 조직 저장소 목록 API(/orgs/<login>/repos)가 아니라 검색 API 다. 앞의 것은 별 순 정렬이 없어 최근에 손본 100개를
 * 받아 줄 세웠더니, 저장소가 많은 조직(facebook 등)에서는 가장 이름난 것이 그 100개 밖으로 밀려났다(2026-09-29).
 *
 * GITHUB_TOKEN 이 있으면 붙인다(검색 한도가 분당 30번으로 늘어난다). 없어도 하루 캐시 덕에 한도 안에서 돈다.
 */
export async function listOrganizationRepositories(login: string): Promise<OrganizationRepository[]> {
  const token = process.env.GITHUB_TOKEN
  const query = encodeURIComponent(`org:${login} fork:false`)
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${REPOSITORY_LIMIT}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    },
  )
  if (response.status === 403 || response.status === 429) {
    throw new Error('GitHub API 호출 한도에 걸렸어요. 1분쯤 뒤에 다시 열어 주세요.')
  }
  if (!response.ok) {
    throw new Error(`GitHub 에서 ${login} 저장소를 불러오지 못했어요 (HTTP ${response.status}).`)
  }

  const { items } = (await response.json()) as { items: GithubRepositoryResponse[] }
  return items.map((repository) => ({
    name: repository.name,
    fullName: repository.full_name,
    url: repository.html_url,
    description: repository.description,
    language: repository.language,
    topics: repository.topics ?? [],
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    isArchived: repository.archived,
    pushedAt: repository.pushed_at,
  }))
}
