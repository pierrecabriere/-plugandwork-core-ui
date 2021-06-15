import Faye from 'faye'

let _client

export const getClient = () => {
  if (!_client) {
    _client = new Faye.Client('https://rec.plugandwork.fr/faye')
  }

  return _client
}
