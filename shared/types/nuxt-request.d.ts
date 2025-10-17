import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack'
import type { FetchError } from 'ofetch'

export type Method = 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'

export type NitroRequest = NitroFetchRequest

export type NitroOptions = NitroFetchOptions<NitroRequest, Lowercase<Method>>

export type OError<ErrorT = unknown> = FetchError<ErrorT>

export type Status = 'idle' | 'pending' | 'success' | 'error'

export type Hooks<DataT = unknown, ErrorT = unknown> = {
  onPending?: () => void | Promise<void>
  onSuccess?: (data: DataT) => void | Promise<void>
  onError?: (error: FetchError<ErrorT>) => void | Promise<void>
}

export type Options<DataT = unknown, ErrorT = unknown> = Hooks<DataT, ErrorT>
  & NitroOptions
  & { immediate?: boolean }

