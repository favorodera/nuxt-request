/**
 * Reactive wrapper around $fetch with lifecycle hooks and status tracking.
 *
 * @typeParam DataT - Successful response data type
 * @typeParam ErrorT - Error payload type when request fails
 * @param request - Request URL
 * @param options - Request options including fetch options and lifecycle hooks
 * @returns Reactive state and an `execute` function to trigger the request
 */
export default function<DataT = unknown, ErrorT = unknown>(request: NitroRequest, options: Options<DataT, ErrorT> = { immediate: false }) {

  const data = ref<DataT>()
  const status = ref<Status>('idle')
  const error = ref<OError<ErrorT>>()
  

  /**
   * Execute the request with optional override/patch of the initial options.
   *
   * Merges provided `patch` with the initial `options` using a deep merge for
   * plain objects and replacement for arrays and primitive values.
   *
   * @param patch - Optional options to override for this invocation
   * @returns The resolved data from `$fetch`
   */
  async function execute(patch?: Omit<Options<DataT, ErrorT>, 'immediate'>) {
    const optionsMerged = merge(options, patch) // Merge options
    const { onPending, onSuccess, onError, immediate, ...nitroOptions } = optionsMerged // Destructure merged options

    error.value = undefined // Clear error
    status.value = 'pending' // Set status to pending

    await onPending?.() // Call pending hook

    try {
      const response = await $fetch<DataT>(request, nitroOptions) // Make request

      data.value = response as DataT // Set data
      status.value = 'success' // Set status to success

      await onSuccess?.(response as DataT) // Call success hook
      return response // Return response

    } catch (rawError) {
      const typedError = rawError as OError<ErrorT> // Type error

      status.value = 'error' // Set status to error
      error.value = typedError // Set error

      await onError?.(typedError) // Call error hook
      throw typedError // Throw error

    }
    
  }

  // Fire immediately if requested. Errors are captured in reactive state.
  if (options.immediate) {
    execute().catch(() => {
      // Ignore errors on immediate execution since they're handled in the reactive state
    })
  }

  return {
    data,
    status,
    error,
    execute,
  }

}
