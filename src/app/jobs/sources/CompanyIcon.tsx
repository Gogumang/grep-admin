'use client'

import { useState } from 'react'
import * as clubStyles from '../../clubs/clubs.css'

/**
 * 채용 수집처 회사 로고. 기술 블로그를 모으는 회사는 그 블로그 아이콘(scripts/fetch-blog-icons.py)을 그대로 쓰고,
 * 블로그 아이콘이 없거나 회사 로고가 아닌 곳만 scripts/fetch-company-icons.py 가 따로 받아 public/company-icons 에 둔다.
 * 적어 두지 않은 회사(새로 더한 곳)나 불러오기에 실패한 곳은 동아리 수집처처럼 이름 첫 글자로 대신한다.
 */
const ICON_PATH_BY_COMPANY: Record<string, string> = {
  kakao: '/blog-icons/tech-kakao-com.png',
  toss: '/blog-icons/toss-tech.png',
  daangn: '/blog-icons/medium-com-daangn.png',
  kurly: '/blog-icons/helloworld-kurly-com.png',
  musinsa: '/blog-icons/medium-com-musinsa-tech.png',
  zigbang: '/blog-icons/medium-com-zigbang.png',
  gccompany: '/blog-icons/techblog-gccompany-co-kr.png',
  gangnamunni: '/blog-icons/blog-gangnamunni-com.png',
  yanolja: '/blog-icons/medium-com-yanolja.png',
  coupang: '/blog-icons/medium-com-coupang-engineering.png',
  naver: '/company-icons/naver.png',
  woowahan: '/company-icons/woowahan.png',
  line: '/company-icons/line.png',
  kakaoent: '/company-icons/kakaoent.png',
}

export function CompanyIcon({ companyKey, name, size }: { companyKey: string; name: string; size: number }) {
  const [hasFailed, setHasFailed] = useState(false)
  const path = ICON_PATH_BY_COMPANY[companyKey]

  if (!path || hasFailed) {
    return (
      <span className={clubStyles.initial} style={{ width: size, height: size }} aria-hidden="true">
        {name.slice(0, 1)}
      </span>
    )
  }
  return (
    <img className={clubStyles.icon} src={path} alt="" width={size} height={size} onError={() => setHasFailed(true)} />
  )
}
