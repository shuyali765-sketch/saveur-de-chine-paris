export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function authInputClass(errorMessage) {
  const base = 'h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60'

  if (errorMessage) {
    return `${base} border-destructive`
  }

  return `${base} border-input`
}
