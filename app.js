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

        const tempKab = {};
        for (let { prop } of this.districts) {
          tempKab[prop] = {
              prop,
              count: tempKab[prop] ? tempKab[prop].count + 1 : 1,
          };
        }
        let dataKabupatenProvinsi = Object.values(tempKab);

        // object plot dan label
        for (i = 0; i < dataKabupatenProvinsi.length; i++) {
            // Add the circle for this city to the map.
            const cityCircle = new google.maps.Circle({
              strokeColor: "blue",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "blue",
              fillOpacity: 0.35,
              map: this.map,
              center: new google.maps.LatLng(
                  this.provinces[i].lat,
                  this.provinces[i].lng
              ),
              radius: Math.sqrt(dataKabupatenProvinsi[i].count) * 12000,
            });
            cityCircle.prov = dataKabupatenProvinsi[i].namaProvinsi
            this.plots.circle.push(cityCircle)

            const labelMarker = new google.maps.Marker({
              position: new google.maps.LatLng(
                this.provinces[i].lat,
                this.provinces[i].lng
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
        console.log(this.plots)
        // for (const i in this.plots) {
        //   this.plots[i].setMap(this.map)
        // }
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