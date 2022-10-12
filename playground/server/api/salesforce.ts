export default defineEventHandler(async (event) => {
  const query = useQuery(event)
  const salesforce = useSalesforce()
  const token = await salesforce.fetchRefreshToken()
  salesforce.setToken(token)
  return await salesforce.fetch(query.soql)
})
