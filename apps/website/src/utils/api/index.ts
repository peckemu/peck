import type { ApiError, JsonResponse } from '~/types/api'

/**
 * Reads an error the API sent
 * @param response The response
 * @returns The message
 */
export const messageOf = async (response: JsonResponse): Promise<string> => {
  const body = (await response.json().catch(() => null)) as ApiError | null

  return body?.error?.message ?? 'Something went wrong'
}
