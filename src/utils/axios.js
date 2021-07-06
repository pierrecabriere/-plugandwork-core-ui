import Axios from 'axios'

const axios = Axios.create({
  baseURL: process.env.REACT_APP_PAW_HOST || ''
})

export default axios
