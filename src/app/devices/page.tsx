import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { DeviceManager } from './DeviceManager'

export const dynamic = 'force-dynamic'

export default async function DevicesPage() {
  await requireAdmin()

  try {
    const { devices, enrollmentRequests } = await collector.listDevices()
    return (
      <>
        <h1 className={console.pageTitle}>
          기기 {devices.length}대{enrollmentRequests.length > 0 && ` · 승인 대기 ${enrollmentRequests.length}건`}
        </h1>
        <DeviceManager devices={devices} enrollmentRequests={enrollmentRequests} />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>기기</h1>
        <p className={styles.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
