# Composition Pattern

> **核心主張**：能用組合 (composition) 解決的事，不要用 boolean props + 條件判斷。

當你發現自己在一個 component 裡加第三個 `is*` 布林值來切換內部分支時，就是該停下來改用 composition 的訊號。本文整理三層應用：

1. **Page 層** — 用 `DashboardContent.*` 這種 layout primitive 把頁面組起來
2. **Component 層** — UI 元件用 namespace export (`Dialog.Root` / `Card.Header`...) 而不是大顆 monolithic 元件
3. **State 層** — 把 state 提升到 Provider，讓 UI 與 state 實作解耦

這三層共用一套精神：**用 JSX 結構表達意圖，而不是用 props 切換分支**。

---

## 為什麼？— Monolithic Component 的問題

下面是一個常見的反例。一個「訊息輸入框」要支援頻道、Thread、編輯、轉發四種情境，於是長成這樣：

```tsx
// ❌ 巨型組件 + 一堆 boolean props
<MessageComposer
  isEditingMessage={isEditing}
  isThread={isThread}
  isForwarding={isForwarding}
  hideAttachments={isEditing || isForwarding}
  showFooterCancelButton={isEditing}
  showFooterSubmitButton
  submitLabel={isEditing ? 'Save' : 'Send'}
  renderFooter={isForwarding ? renderForwardFooter : undefined}
  onFormStateChange={handleFormStateChange}
/>
```

幾個月後這個元件會出現：

- 內部到處都是 `if (isEditing) ... else if (isForwarding) ...`
- 為了「外部按鈕也要能 submit」，被迫加 `onFormStateChange` callback 把內部狀態往外吐
- 為了「在某個情境換 footer 樣子」，被迫加 `renderFooter` render prop
- 新增情境時要回去改底層，每改一次都怕 regression
- AI agent 看到這種介面也很難對齊意圖——它不知道某個 prop 真正的語意

**根因**：把「不同情境的 UI 變體」塞進同一個 component 內部，用 props 當開關。

---

## 三個核心原則

### 1. 拆成小 module，用 JSX 組合

把巨型元件拆成 `Provider` / `Frame` / `Header` / `Input` / `Footer` / `DropZone` 等職責單一的小元件。需要哪個情境就**直接寫對應的 JSX**，不要用 `if (isEditing)` 在元件內部切換。

```tsx
// ✅ 編輯訊息：不要 DropZone、不要附件
<MessageComposer.Provider mode="edit" initialValue={message.text}>
  <MessageComposer.Frame>
    <MessageComposer.Input />
    <MessageComposer.Footer>
      <MessageComposer.CancelButton />
      <MessageComposer.SaveButton />
    </MessageComposer.Footer>
  </MessageComposer.Frame>
</MessageComposer.Provider>

// ✅ 頻道訊息：要 DropZone + 附件
<MessageComposer.Provider mode="channel" channelId={id}>
  <MessageComposer.Frame>
    <MessageComposer.DropZone />
    <MessageComposer.Input />
    <MessageComposer.Footer>
      <MessageComposer.AttachButton />
      <MessageComposer.SendButton />
    </MessageComposer.Footer>
  </MessageComposer.Frame>
</MessageComposer.Provider>
```

「編輯不能上傳附件」這件事，**用「不渲染 DropZone」來表達**，比 `hideAttachments={true}` 清楚。

### 2. 不同情境 = 不同 JSX tree，不共用一棵樹再用 props 分支

當情境差異大時，**不要去改底層共用元件**多加判斷。直接在 page / route 層寫該情境的 JSX。

```tsx
// ❌ 想在 Footer 裡面塞所有情境
<Footer
  showCancel={isEditing}
  showSubmit
  submitLabel={isEditing ? 'Save' : isForwarding ? 'Forward' : 'Send'}
  variant={isForwarding ? 'forward' : 'default'}
/>

// ✅ 三個情境三棵獨立的 JSX tree
// EditFooter / ForwardFooter / ChannelFooter
```

> 「DRY 一切」不是這層該追求的目標。每個情境保有獨立的元件樹，被改動時不會互相影響——這比少寫幾行重複的 JSX 重要太多。

### 3. State 提升到 Provider，UI 與 state 實作解耦

當「外部元件也要存取/觸發內部狀態」（最常見：footer 的 submit 按鈕被放到主框架外）時，**不要**用 `onFormStateChange` callback 把 state 往外吐，**也不要**用 `renderSubmit` render prop。

把 state 拉到 `Provider`，內部所有元件 (包含外部 footer) 都從 context 拿。

```tsx
// ❌ 反向資料流 + render prop
function ForwardDialog() {
  const [formState, setFormState] = useState(null)
  return (
    <Dialog>
      <MessageComposer onFormStateChange={setFormState} />
      <Dialog.Footer>
        <Button onClick={() => submit(formState)}>Forward</Button>
      </Dialog.Footer>
    </Dialog>
  )
}

// ✅ State 提升到 Provider，所有人從 context 取
function ForwardDialog() {
  return (
    <MessageComposer.Provider mode="forward">
      <Dialog>
        <MessageComposer.Frame>
          <MessageComposer.Input />
        </MessageComposer.Frame>
        <Dialog.Footer>
          {/* 這顆按鈕在 Frame 外面，但仍能讀到 composer state */}
          <MessageComposer.SubmitButton>Forward</MessageComposer.SubmitButton>
        </Dialog.Footer>
      </Dialog>
    </MessageComposer.Provider>
  )
}
```

附加好處：**情境抽換時，只換 Provider，不動子元件**。

```tsx
// 一次性的轉發 → 用本地 useState
function ForwardComposerProvider({ children }) {
  const [text, setText] = useState('')
  return (
    <Context.Provider value={{ text, setText, submit: forwardFn }}>
      {children}
    </Context.Provider>
  )
}

// 頻道訊息 → 要跨裝置同步，換成 useGlobalChannel
function ChannelComposerProvider({ children, channelId }) {
  const { text, setText, submit } = useGlobalChannel(channelId)
  return (
    <Context.Provider value={{ text, setText, submit }}>
      {children}
    </Context.Provider>
  )
}
```

兩個 Provider **介面相同、實作不同**，子元件不需要知道差異。

---

## 三層應用

### Page 層：Layout Primitive

頁面用一組固定 slot 的 layout 元件組起來。Page 主要工作是 composition，不該長條件分支。

```tsx
// src/components/dashboard-content/  (thin index pattern)
import { DashboardContent } from '@/components/dashboard-content'

export default function OrdersPage() {
  return (
    <DashboardContent.Root breadcrumbs={[{ href: '/orders', label: 'Orders' }]}>
      <DashboardContent.Content>
        <DashboardContent.Header className="border-b" asChild>
          <div className="space-y-4">
            <DashboardContent.Title>Orders</DashboardContent.Title>
            <OrderFilterBar />
          </div>
        </DashboardContent.Header>
        <DashboardContent.Main>
          <OrderContent />
        </DashboardContent.Main>
        <DashboardContent.Footer className="border-t">
          <DataTablePagination table={table} />
        </DashboardContent.Footer>
      </DashboardContent.Content>
    </DashboardContent.Root>
  )
}
```

| Part               | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `Root`             | 最外層容器，攜帶 page-level prop (麵包屑、padding...) |
| `Content`          | 內容區包裝                                            |
| `Header` / `Title` | 頁首與主標                                            |
| `Main`             | 主要內容區                                            |
| `Footer`           | 通常是 pagination / 全局 action                       |

**好處**：

- 任何 page 一打開就看得出版面結構，不需要讀內部實作
- 加 sidebar / breadcrumb 變體時，改 `Root` 一個地方，所有 page 自動受惠
- 不需要為「這個 page 沒有 footer」加 `hideFooter` prop — 不寫 `<Footer>` 就好

> 實作上每個 slot 都用 [Radix Slot](https://www.radix-ui.com/primitives/docs/utilities/slot) (`asChild`) 讓使用端能彈性插入自己的容器，又能繼承 layout 的 className。

### Component 層：Namespace Compound Components

UI primitive 採 namespace 匯出。同一個 component 不再是「一顆吃 20 個 props 的怪物」，而是「一組職責清楚的 sub-component」。

```tsx
// ✅ 命名空間模式
import { Dialog } from '@/components/ui/dialog'

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

// ❌ 平鋪匯出 + monolithic 元件
import { Dialog, DialogTitle, DialogContent } from '@/components/ui/dialog'

<Dialog title="Title" description="..." showFooter onConfirm={...}>
  ...
</Dialog>
```

**為什麼用 namespace 而不是平鋪 export**：

- 一眼看出歸屬：`Card.Header` 一看就是 Card 的一部分；`CardHeader` 要靠檔名才知道
- 自動補全友善：打 `Dialog.` IDE 直接列出所有 sub-component
- AI / 人類閱讀對齊：JSX 巢狀結構就是元件樹的真實結構
- 沒有命名衝突問題：兩個 library 都有 `Header` 也沒差

**結構慣例** (對應 [`03-file-structure/thin-index-pattern.md`](../03-file-structure/thin-index-pattern.md))：

```
src/components/ui/dialog/
  index.ts          ← namespace 組裝後對外 export 的 thin entry
  root.tsx
  trigger.tsx
  content.tsx
  header.tsx
  title.tsx
  description.tsx
  footer.tsx
```

```ts
// index.ts
import { Root } from './root'
import { Trigger } from './trigger'
import { Content } from './content'
import { Header } from './header'
import { Title } from './title'
import { Description } from './description'
import { Footer } from './footer'

export const Dialog = {
  Root,
  Trigger,
  Content,
  Header,
  Title,
  Description,
  Footer,
}
```

> 這是 [barrel-export.md](../03-file-structure/barrel-export.md) 規則的合法例外：namespace export 不是「無腦 re-export 一切」，而是**有意義的對外 API 表面**。

### State 層：Provider + Context

當一個元件群有共享 state，且：

- 外部元件需要存取 / 觸發內部狀態
- 不同情境需要抽換 state 實作 (local state / global sync / remote query)

就把 state 拉到 Provider。

```tsx
// src/components/message-composer/context.ts
type MessageComposerContextValue = {
  text: string
  setText: (v: string) => void
  submit: () => Promise<void>
  isSubmitting: boolean
}
const MessageComposerContext =
  createContext<MessageComposerContextValue | null>(null)

export function useMessageComposer() {
  const ctx = useContext(MessageComposerContext)
  if (!ctx)
    throw new Error(
      'useMessageComposer must be used inside MessageComposer.Provider'
    )
  return ctx
}
```

```tsx
// 子元件不關心 state 從哪來，只用 context
function SubmitButton({ children }: { children: ReactNode }) {
  const { submit, isSubmitting } = useMessageComposer()
  return (
    <Button onClick={submit} disabled={isSubmitting}>
      {children}
    </Button>
  )
}
```

```tsx
// 情境一：本地 state Provider
function LocalProvider({ children, onSubmit }: ...) {
  const [text, setText] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const submit = async () => { setSubmitting(true); await onSubmit(text); setSubmitting(false) }
  return <MessageComposerContext.Provider value={{ text, setText, submit, isSubmitting }}>{children}</MessageComposerContext.Provider>
}

// 情境二：頻道同步 Provider — 介面相同、實作不同
function ChannelProvider({ children, channelId }: ...) {
  const { draft, setDraft, send, sending } = useGlobalChannel(channelId)
  return <MessageComposerContext.Provider value={{ text: draft, setText: setDraft, submit: send, isSubmitting: sending }}>{children}</MessageComposerContext.Provider>
}
```

子元件 (`Input` / `SubmitButton` / `DropZone`) 完全不需要知道目前是哪一種 Provider。

---

## 何時用 Composition，何時不用

| 情境                                                     | 做法                                              |
| -------------------------------------------------------- | ------------------------------------------------- |
| Component 出現第 3 個 `is*` boolean prop                 | 開始拆 sub-component                              |
| 要用 `renderXxx` render prop 解決「我想自訂某一塊」      | 改用 namespace + 把那塊抽成 sub-component         |
| 外部元件要存取內部表單狀態 (跨 portal、跨 dialog footer) | State 提升到 Provider                             |
| 同一個 UI 要在不同情境換 state 實作                      | Provider 介面化、實作可抽換                       |
| 元件只有 1 種用法、props 不到 5 個、沒有跨層 state       | **不要過度設計**，留著 monolithic 就好            |
| Sub-component 之間沒有共用 state 也沒有彼此依賴          | Namespace 化 helps readability，但不需要 Provider |

> 過早拆分跟過晚拆分一樣糟。看到第二個 boolean prop 不一定要拆，看到「為了第三個情境我得加判斷」時才拆。

---

## 最佳實踐 Checklist

設計新元件 / 重構舊元件時：

- [ ] 不用 `is*` / `show*` / `hide*` boolean prop 切換 UI 變體 — 改用 JSX 不渲染
- [ ] 不同情境用獨立 JSX tree，不在共用元件內部寫情境分支
- [ ] 不用 `renderXxx` render prop 把客製化往外推 — 改 namespace + sub-component
- [ ] 不用 `onFormStateChange` 把內部 state 往外吐 — 改 Provider
- [ ] UI primitive 用 namespace export (`Component.Part`)
- [ ] Layout primitive (page-level) 也走同樣模式 (`DashboardContent.*`)
- [ ] 跨層共享 state 走 Provider + Context，Provider 介面化讓實作可抽換
- [ ] 元件樹結構即意圖：讀 JSX 就能看出版面與資料流向
