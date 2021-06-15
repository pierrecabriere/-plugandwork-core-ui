import RxjsAuth from 'rxjs-auth'
import axios from './axios'
import { getTokenFromCookie, tokenKey } from './cookies'
import User from '../models/User'

export const authmanager = RxjsAuth.create('plugandwork-frontend', {
  fetchToken: async () => {
    const token = getTokenFromCookie()
    // if (!token) {
    //   const host = process.env.REACT_APP_PAW_HOST || ''
    //   window.location.href = `${host}/users/sign_in?identity_provider=paw-front&callback_url=${window.location.origin}`
    // }
    return token
  },
  fetchUser: async () => {
    try {
      const res = await axios.get('/api/d2/users/me', {
        params: { full: true }
      })
      return new User(res.data.data)
    } catch (error) {
      console.log('Error while fetching user', error)
      return null
    }
  }
})

export const logout = async () => {
  axios
    .post('/api/logout')
    .then(() => {
      delete axios.defaults.headers.common.Authorization
      localStorage.removeItem(tokenKey)
      authmanager.logout()
      const host = process.env.REACT_APP_PAW_HOST || ''
      window.location.href = host
    })
    .catch((error) => {
      console.error('Error during logout request', error)
    })
}
