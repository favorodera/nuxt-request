## @favorodera/nuxt-request

Reactive wrapper around `$fetch` with lifecycle hooks and status tracking.

### Features

- Reactive state: `data`, `status`, `error`
- Lifecycle hooks: `onPending`, `onSuccess`, `onError`
- `immediate` option to auto-run on creation
- Fully typed with TypeScript

### Install

```bash
npm i @favorodera/nuxt-request
```

### Usage

```ts
const { data, status, error, execute } = nuxtRequest<{ id: number }>(
  '/api/example',
  {
    method: 'GET',
    immediate: true,
    onPending: () => console.log('loading...'),
    onSuccess: (data) => console.log('ok', data),
    onError: (error) => console.error('failed', error),
  }
)

// Later you can rerun with overrides
await execute({ query: { page: 2 } })
```

### API

```ts
type Status = 'idle' | 'pending' | 'success' | 'error'

type Hooks<DataT, ErrorT> = {
  onPending?: () => void | Promise<void>
  onSuccess?: (data: DataT) => void | Promise<void>
  onError?: (error: FetchError<ErrorT>) => void | Promise<void>
}

type Options<DataT, ErrorT> = Hooks<DataT, ErrorT> & NitroOptions & {
  immediate?: boolean
}

function nuxtRequest<DataT = unknown, ErrorT = unknown>(
  request: NitroRequest,
  options?: Options<DataT, ErrorT>
): {
  data: Ref<DataT | undefined>
  status: Ref<Status>
  error: Ref<OError<ErrorT> | undefined>
  execute: (patch?: Options<DataT, ErrorT>) => Promise<DataT>
}
```

Notes:
- `execute()` merges the initial `options` with the `patch` using a deep merge for plain objects, replaces arrays and primitives.
- When `immediate` is true, the request runs once on creation; errors are exposed via `error`.

### License

MIT © Favour Emeka

