import FormData from 'form-data'
import qs from 'qs'
import axios from '../utils/axios'
import { getClient } from '../utils/faye'
import PlugandworkModel from '../lib/PlugandworkModel'

class Doc extends PlugandworkModel {
  static apiType = 'docs'
  static subscription
  static filters = {
    id: '',
    created_at: '',
    updated_at: '',
    title: '',
    weight: ''
  }

  content_type

  static async create(payload) {
    let url = `/api/d2/${this.apiType}`
    let body = { data: { attributes: payload } }
    const config = {}

    if (payload.file) {
      const formData = new FormData()
      formData.append('file', payload.file)
      const { file, title, ...attributes } = payload
      const name = title || file.name
      url = `/api/d2/${this.apiType}?${qs.stringify(
        { name, data: { attributes } },
        { arrayFormat: 'brackets' }
      )}`
      body = formData
    }

    const {
      data: { data }
    } = await axios.post(url, body, config)
    this.clearCache()
    this.store.dispatch({ type: 'UPSERT', payload: data })
    return new this(data)
  }

  static async sync() {
    const constructor = this
    this.subscription =
      this.subscription ||
      getClient().subscribe('/users/all', function (message) {
        if (message.action === 'refresh_all_doc_thumb' && message.did) {
          const doc = constructor.get(message.did, false)
          if (doc) {
            constructor.get(message.did, true)
          }
        }
      })

    return this.subscription
  }

  static async unsync() {
    if (!this.subscription) {
      return
    }

    this.subscription.cancel()
  }

  download() {
    const a = document.createElement('a')
    a.style.display = 'none'
    document.body.appendChild(a)
    a.href = encodeURI(`/documents/${this.id}/upload?mode=attachment`)
    a.setAttribute('download', this.title)
    a.click()
    document.body.removeChild(a)
  }
}

export default Doc
