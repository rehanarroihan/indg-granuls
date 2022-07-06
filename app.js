//use vuelidate
Vue.use(window.vuelidate.default)
const { required } = window.validators

new Vue({
  el: '#app',
  data() {
    return {
      list: [],
      isLoadingList: false,
      detail: {},
      isLoadingDetail: false,
    }
  },
  validations: {
    
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      const self = this

      self.isLoadingList = true
      
      axios.get(`https://granuls.rahardianwardana.my.id/api/listUjiCoba`)
      .then((result) => {
        self.list = result.data
      })
      .catch(err => console.log(err))
      .finally(() =>  self.isLoadingList = false)
    },    

    getDetail(item) {
      const self = this

      self.isLoadingDetail = true

      axios.get(`https://granuls.rahardianwardana.my.id/api/logs/pengecekan?id=${item.ID}`)
      .then((result) => {
        self.detail = item
        self.detail.results = result.data
      })
      .catch(err => self.detail = {})
      .finally(() =>  self.isLoadingDetail = false)
    },
  }
});