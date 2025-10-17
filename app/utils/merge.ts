export default function merge<T extends object>(base: T = {} as T, patch: Partial<T> = {} as Partial<T>) {
  const output = { ...base }
  
  for (const key in patch) {
    const patchValue = patch[key]
    if (patchValue === undefined) continue
    
    const baseValue = output[key]

    if (Array.isArray(patchValue)) {
      output[key] = patchValue as T[Extract<keyof T, string>]
    } else if (
      baseValue
      && typeof baseValue === 'object'
      && patchValue
      && typeof patchValue === 'object'
      && !Array.isArray(baseValue)
    ) {
      // Deep merge objects (but not arrays)
      output[key] = merge(baseValue, patchValue) as T[Extract<keyof T, string>]
    } else {
      // Primitive values overwrite
      output[key] = patchValue as T[Extract<keyof T, string>]
    }
  }
  
  return output
}
