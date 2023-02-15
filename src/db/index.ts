import { init, client } from "./connection"

export default {
  initDB: init,
  query: (text: any, params: any) => client.query(text, params)
}