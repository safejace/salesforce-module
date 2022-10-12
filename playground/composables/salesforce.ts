export async function useWebinars () {
  const query = soql`SELECT Id, Name, Status, Description, StartDate, EndDate, IsActive, Class_Language__c, GoToWebinar_URL__c, Class_Duration__c, Class_End_Time__c, Class_Start_Time__c, Presenter__c, Trainer__c, Time_Zone__c, Class_Location__c, CertLocation__c, TrainingOverview__c, LearningObjectives__c, Prerequisites__c, WebinarEnd__c, WebinarStart__c, GoToWebinarType__c, WebinarName__c FROM Campaign WHERE Type = 'Webinar'`
  const qs = query.replace(/\s+/g, '+')
  const {
    data: {
      value: { records: webinars },
    },
  } = await useFetch(`/api/salesforce?soql=${qs}`)

  return webinars
}
