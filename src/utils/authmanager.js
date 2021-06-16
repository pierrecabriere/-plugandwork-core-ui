import RxjsAuth from 'rxjs-auth'
import axios from './axios'
import { getTokenFromCookie } from './cookies'
import User from '../models/User'

export const authmanager = RxjsAuth.create('plugandwork-frontend', {
  fetchToken: async () => {
    return getTokenFromCookie()
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
    .then(() => authmanager.logout())
    .catch((error) => {
      console.error('Error during logout request', error)
    })
}
