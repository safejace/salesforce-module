export async function useFetchAccounts () {
  const query = soql`SELECT name FROM Account`
  const qs = query.replace(/\s+/g, '+')
  const {
    data: {
      value: { records: accounts },
    },
  } = await useFetch(`/api/salesforce?soql=${qs}`)

  return accounts
}
