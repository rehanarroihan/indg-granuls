//use vuelidate
Vue.use(window.vuelidate.default)
const { required } = window.validators

new Vue({
  el: '#app',
  data() {
    return {
      totalEvent: 0,
    }
  },
  validations: {
    
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      console.log("list")
    },

    
  }
});