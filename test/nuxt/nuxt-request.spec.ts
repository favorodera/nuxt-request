import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import nuxtRequest from '../../app/composables/nuxt-request'

registerEndpoint('/success', {
  method: 'GET',
  handler: () => ({ foo: 'bar' }),
})

registerEndpoint('/success', {
  method: 'POST',
  handler: () => ({ foo: 'bar' }),
})

registerEndpoint('/error', {
  method: 'GET',
  handler: () => {
    throw new Error('Fetch failed')
  },
})

describe('nuxt-request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with undefined data/error and idle status', () => {
    const { data, error, status } = nuxtRequest<{ foo: string }>('/success')

    expect(data.value).toBeUndefined()
    expect(error.value).toBeUndefined()
    expect(status.value).toBe('idle')
  })

  it('sets pending status immediately if immediate=true', () => {
    const { status } = nuxtRequest<{ foo: string }>('/success', { immediate: true })
    expect(status.value).not.toBe('idle')
  })

  it('calls hooks and updates state on success', async () => {
    const onPending = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const { data, status, error, execute } = nuxtRequest<{ foo: string }>('/success', {
      onPending,
      onSuccess,
      onError,
    })

    await execute()

    expect(onPending).toHaveBeenCalledOnce()
    expect(onSuccess).toHaveBeenCalledWith({ foo: 'bar' })
    expect(onError).not.toHaveBeenCalled()
    expect(status.value).toBe('success')
    expect(data.value).toEqual({ foo: 'bar' })
    expect(error.value).toBeUndefined()
  })

  it('calls hooks and updates state on error', async () => {
    const onPending = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const { status, error, execute } = nuxtRequest('/error', {
      onPending,
      onSuccess,
      onError,
    })

    await expect(execute()).rejects.toThrow()

    expect(onPending).toHaveBeenCalledOnce()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledOnce()
    expect(status.value).toBe('error')
    expect(error.value).toBeInstanceOf(Error)
  })

  it('prefers override hooks on success', async () => {
    const onPendingInitial = vi.fn()
    const onSuccessInitial = vi.fn()
    const onPendingOverride = vi.fn()
    const onSuccessOverride = vi.fn()

    const { execute } = nuxtRequest<{ foo: string }>('/success', {
      onPending: onPendingInitial,
      onSuccess: onSuccessInitial,
    })

    await execute({
      onPending: onPendingOverride,
      onSuccess: onSuccessOverride,
    })

    expect(onPendingInitial).not.toHaveBeenCalled()
    expect(onSuccessInitial).not.toHaveBeenCalled()
    expect(onPendingOverride).toHaveBeenCalledOnce()
    expect(onSuccessOverride).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('prefers override hooks on error', async () => {
    const onPendingInitial = vi.fn()
    const onSuccessInitial = vi.fn()
    const onErrorInitial = vi.fn()
    const onPendingOverride = vi.fn()
    const onSuccessOverride = vi.fn()
    const onErrorOverride = vi.fn()

    const { execute } = nuxtRequest('/error', {
      onPending: onPendingInitial,
      onSuccess: onSuccessInitial,
      onError: onErrorInitial,
    })

    await expect(
      execute({
        onPending: onPendingOverride,
        onSuccess: onSuccessOverride,
        onError: onErrorOverride,
      }),
    ).rejects.toThrow()

    expect(onPendingInitial).not.toHaveBeenCalled()
    expect(onSuccessInitial).not.toHaveBeenCalled()
    expect(onErrorInitial).not.toHaveBeenCalled()
    expect(onPendingOverride).toHaveBeenCalledOnce()
    expect(onSuccessOverride).not.toHaveBeenCalled()
    expect(onErrorOverride).toHaveBeenCalledOnce()
  })

  it('merges ofetch options', async () => {

    let ofetchOptions: any

    const { execute } = nuxtRequest('/success', {
      immediate: false,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: { foo: 'bar' },
    })

    await execute({
      method: 'POST',
      headers: { 'X-Custom-Header': 'abc' },
      body: { baz: 'qux' },
      onRequest({ options }) {
        ofetchOptions = options
      },
    })

    const headers = Object.fromEntries(ofetchOptions.headers.entries())

    expect(headers).toMatchObject({
      'Content-Type': 'application/json',
      'X-Custom-Header': 'abc',
    })

    if (typeof ofetchOptions.body === 'string') {
      ofetchOptions.body = JSON.parse(ofetchOptions.body)
    }

    expect(ofetchOptions.body).toEqual({
      foo: 'bar',
      baz: 'qux',
    })
  })
})
  


