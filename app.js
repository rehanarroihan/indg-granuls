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

      map: null,
      provinces: [],
      districts: [],
      plots: {
        label: [],
        circle: []
    },
    }
  },
  validations: {
    
  },
  async mounted() {
    this.getList();
    this.initMap()
  },
  methods: {
    async initMap() {
        //svg path
        const svgCircle = {
            path: "M 100, 100m -75, 0a 75,75 0 1,0 150,0a 75,75 0 1,0 -150,0",
            fillColor: "white",
            fillOpacity: 0,
            strokeWeight: 0,
            rotation: 0,
            scale: 0.2,
        };

        //object constructor map
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: new google.maps.LatLng(
                -1.1900672891390864,
                110.60592691266189
            ),
            zoom: 5,
            maxZoom: 20,
            minZoom: 3,
            streetViewControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM,
            },
            zoomControl: true,
        });

        // mutate data kabupaten & provinsi
        await axios.get("dummy/provinces.json").then(res => (this.provinces = res.data))
        await axios.get("dummy/districts.json").then(res => (this.districts = res.data))
        const dataList = await axios.get("https://granuls.rahardianwardana.my.id/api/listUjiCoba")

        console.log(dataList.data.filter((item) => item.IdKab !== ""))

        const tempKab = {};
        for (let { IdKab, IdProp } of dataList.data) {
          if (IdProp !== "" && IdProp !== null) {
            tempKab[IdProp] = {
              IdKab,
              IdProp,
              count: tempKab[IdProp] ? tempKab[IdProp].count + 1 : 1,
            };
          }
        }
        let dataKabupatenProvinsi = Object.values(tempKab)
        

        // object plot dan label
        for (i = 0; i < dataKabupatenProvinsi.length; i++) {
            // Add the circle for this city to the map.
            const getLat = 0.0
            const getLng = 0.0
            console.log(this.provinces.filter((item) => item.kode === dataKabupatenProvinsi[i].IdProp))
            const cityCircle = new google.maps.Circle({
              strokeColor: "blue",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "blue",
              fillOpacity: 0.35,
              map: this.map,
              center: new google.maps.LatLng(
                this.provinces.filter((item) => item.kode === dataKabupatenProvinsi[i].IdProp)[0].lat,
                this.provinces.filter((item) => item.kode === dataKabupatenProvinsi[i].IdProp)[0].lng
              ),
              radius: Math.sqrt(dataKabupatenProvinsi[i].count) * 12000,
            });
            cityCircle.prov = dataKabupatenProvinsi[i].namaProvinsi
            this.plots.circle.push(cityCircle)

            const labelMarker = new google.maps.Marker({
              position: new google.maps.LatLng(
                this.provinces.filter((item) => item.kode === dataKabupatenProvinsi[i].IdProp)[0].lat,
                this.provinces.filter((item) => item.kode === dataKabupatenProvinsi[i].IdProp)[0].lng
              ),
              icon: svgCircle,
              map: this.map,
              label: {
                text: dataKabupatenProvinsi[i].count.toString(),
                color: "white",
                fontWeight: "bold"
              },
            });

            labelMarker.prov = dataKabupatenProvinsi[i].namaProvinsi
            this.plots.label.push(labelMarker)
        }
    },

    getList() {
      const self = this

      self.isLoadingList = true
      
      axios.get(`https://granuls.rahardianwardana.my.id/api/listUjiCoba`)
      .then((result) => {
        self.list = []
        result.data.map((item) => {
          moment.locale('id')
          item.start_at = moment(item.start_at).format('DD MMMM YYYY - HH.mm')
          item.end_at = moment(item.end_at).format('DD MMMM YYYY - HH.mm')
          self.list.push(item)
        })
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

    print() {
      $("#aw").table2excel({
        exclude: ".excludeThisClass",
        name: "Worksheet Name",
        filename: "SomeFile.xls", // do include extension
        preserveColors: false // set to true if you want background colors and font colors preserved
      });
    }
  }
});