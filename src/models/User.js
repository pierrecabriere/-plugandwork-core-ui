import PlugandworkModel from '../lib/PlugandworkModel'

class User extends PlugandworkModel {
  static apiType = 'users'
  static d3Compatible = false
}

export default User
