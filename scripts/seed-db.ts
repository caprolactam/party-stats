import { $ } from 'execa'
import fg from 'fast-glob'

const cwd = process.cwd()

async function main() {
  const filePaths = await fg('./drizzle/*.sql', { cwd }).then((files) =>
    files.sort(),
  )

  for (const filePath of filePaths) {
    await $`npx wrangler d1 execute party-stats-db --local --file=${filePath}`
    console.log(`Executed ${filePath} ✅`)
  }
}

main()
  .then(() => console.log('Done ✅'))
  .catch(console.error)
