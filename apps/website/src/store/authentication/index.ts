import { messageOf } from '~/utils/api'
import type { Account, Credentials, Registration } from '~/types/api'

/**
 * Signs accounts in and out
 */
export const useAuthenticationStore = defineStore('authentication', () => {
  const { signIn, signOut, data, status } = useAuth()
  const api = useApi()
  const permissions = usePermissions()

  /**
   * The signed in account
   */
  const user = computed<Account | null>(() => data.value as Account | null)

  /**
   * Whether someone is signed in
   */
  const isAuthenticated = computed(() => status.value === 'authenticated')

  /**
   * Whether a request is running
   */
  const loading = ref<boolean>(false)

  /**
   * The last error
   */
  const error = ref<string | null>(null)

  /**
   * Finds where to send the account
   * @returns The path
   */
  const getRedirectPath = async (): Promise<string> => {
    if (!user.value?.id) return '/login'

    await permissions.load()

    return permissions.isModerator() ? '/dashboard/admin' : '/dashboard'
  }

  /**
   * Signs in with a username or email and a password
   * @param credentials The login and password
   */
  const authenticateWithEmailAndPassword = async (
    credentials: Credentials,
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result = await signIn(credentials, { redirect: false })
      if (result?.error) throw new Error(result.error)

      await navigateTo(await getRedirectPath())
    } catch (failure) {
      error.value = failure instanceof Error ? failure.message : String(failure)
    } finally {
      loading.value = false
    }
  }

  /**
   * Makes an account and signs it in
   * @param details The username, email and password
   */
  const createAccount = async (details: Registration): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.accounts.$post({ json: details })
      if (!response.ok) throw new Error(await messageOf(response))

      await authenticateWithEmailAndPassword({
        login: details.username,
        password: details.password,
      })
    } catch (failure) {
      error.value = failure instanceof Error ? failure.message : String(failure)
    } finally {
      loading.value = false
    }
  }

  /**
   * Signs out
   */
  const logout = async (): Promise<void> => {
    await signOut({ redirect: false })
    permissions.access.value = null
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    authenticateWithEmailAndPassword,
    createAccount,
    logout,
    getRedirectPath,
  }
})
