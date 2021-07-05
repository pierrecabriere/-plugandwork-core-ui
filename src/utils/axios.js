import Axios from 'axios'

let axios

if (typeof window == 'undefined' || !window.axios) {
  axios = Axios.create({
    baseURL: process.env.REACT_APP_PAW_HOST || ''
  })
}

if (typeof window != 'undefined') {
  axios = axios || window.axios
  window.axios = axios
}

export default axios
