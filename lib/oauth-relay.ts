/** Stores the SDK's actual local callback URL between the registration and callback steps. */
let pendingCallbackUrl: string | null = null

export function storePendingCallback(url: string) {
  pendingCallbackUrl = url
}

export function consumePendingCallback(): string | null {
  const url = pendingCallbackUrl
  pendingCallbackUrl = null
  return url
}
