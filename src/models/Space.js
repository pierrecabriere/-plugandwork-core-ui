import PlugandworkModel from '../lib/PlugandworkModel'
import axios from '../utils/axios'

class Space extends PlugandworkModel {
  static apiType = 'spaces'

  static filters = {
    id: '',
    created_at: '',
    updated_at: '',
    title: '',
    weight: ''
  }

  async addDocs(doc_ids) {
    await axios.post(`/api/d1/spaces/${this.id}/add_docs`, { doc_ids })
  }
}

export default Space
