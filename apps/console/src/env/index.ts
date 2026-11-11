/**
 * Saves values to an env file
 * @param path The env file
 * @param values The values
 */
export const saveEnv = async (
  path: string,
  values: Readonly<Record<string, string>>,
): Promise<void> => {
  const file = Bun.file(path)
  const lines = (await file.exists()) ? (await file.text()).split('\n') : []
  const kept = lines.filter(
    (line) => !Object.keys(values).some((name) => line.startsWith(`${name}=`)),
  )
  while (kept.at(-1) === '') kept.pop()
  const added = Object.entries(values).map(
    ([name, value]) => `${name}=${value}`,
  )
  await Bun.write(path, `${[...kept, ...added].join('\n')}\n`)
}
