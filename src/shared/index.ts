/**
 * 어드민 공용 컴포넌트.
 *
 * TDS Mobile(https://tossmini-docs.toss.im/tds-mobile/)의 컴포넌트를 본떠, 이름·prop·기본값을
 * 문서에 맞추되 구현은 어드민의 토큰 계약(styles/contract.css.ts) 위에 vanilla-extract로 다시 그렸다.
 *
 * 진짜 @toss/tds-mobile을 설치하지 않은 이유:
 *   1. peer가 react ^16.8.3 || ^17 || ^18 인데 이 저장소는 React 19다 (npm이 ERESOLVE로 막는다)
 *   2. 스타일 런타임이 Emotion이라, 제로 런타임 vanilla-extract와 스타일 시스템이 둘로 갈린다
 *   3. 문서의 TDSMobileAITProvider가 있는 @toss/tds-mobile-ait는 @apps-in-toss/web-framework
 *      (토스 앱 런타임)을 peer로 요구한다 — 토스 앱 안에서 도는 미니앱 전제다
 *
 * prop을 문서와 같게 맞춘 건 나중에 진짜 패키지로 갈아탈 때 호출부를 그대로 두기 위해서다.
 * 문서에 없거나 어드민에 맞지 않아 바꾼 곳은 각 컴포넌트 주석에 이유를 적어 두었다.
 *
 * 치수는 TDS 그대로(모바일 기준)라 어드민 화면에서는 대체로 작은 size를 넘겨서 쓴다.
 */

export { Badge } from './components/Badge'
export type { BadgeColor, BadgeSize, BadgeVariant } from './components/Badge'
export { BarChart } from './components/BarChart'
export type { BarChartData, BarTheme } from './components/BarChart'
export { Button } from './components/Button'
export type { ButtonColor, ButtonDisplay, ButtonSize, ButtonVariant } from './components/Button'
export { Checkbox } from './components/Checkbox'
export type { CheckboxInputType, CheckboxProps } from './components/Checkbox'
export { ListRow } from './components/ListRow'
export type {
  ListRowAlignment,
  ListRowBorder,
  ListRowDisabledStyle,
  ListRowHorizontalPadding,
  ListRowVerticalPadding,
} from './components/ListRow'
export { Loader, LoaderBlock } from './components/Loader'
export type { LoaderSize } from './components/Loader'
export { Switch } from './components/Switch'
export type { SwitchProps } from './components/Switch'
export { Tab } from './components/Tab'
export type { TabItemProps, TabSize } from './components/Tab'
export { TextArea, TextField } from './components/TextField'
export type {
  TextAreaProps,
  TextFieldFormat,
  TextFieldLabelOption,
  TextFieldProps,
  TextFieldVariant,
} from './components/TextField'
export { TextButton } from './components/TextButton'
export type { TextButtonColor, TextButtonSize } from './components/TextButton'

export { OverlayProvider, useDialog, useToast } from './overlay/OverlayProvider'
export type {
  AlertOptions,
  AsyncConfirmOptions,
  ConfirmOptions,
  DialogControls,
  OpenToastOptions,
  ToastButton,
  ToastControls,
} from './overlay/types'

export type { ToneName } from './styles/palette.css'
