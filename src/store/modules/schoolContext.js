const useSchoolContextStore = defineStore(
  'schoolContext',
  {
    state: () => ({
      schoolId: null,
      schoolName: '',
      schoolLogo: '',
      schoolType: '',
      schoolCode: '',
      resolved: false
    }),
    actions: {
      setSchoolInfo(data) {
        this.schoolId = data.id
        this.schoolName = data.schoolName
        this.schoolLogo = data.logo
        this.schoolType = data.schoolType
        this.schoolCode = data.schoolCode
        this.resolved = true
      },
      clear() {
        this.schoolId = null
        this.schoolName = ''
        this.schoolLogo = ''
        this.schoolType = ''
        this.schoolCode = ''
        this.resolved = false
      }
    }
  })

export default useSchoolContextStore
