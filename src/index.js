import { map, property } from '@dword-design/functions'
import * as firebase from 'firebase-admin'

export default credential => ({
  after: () => firebase.app().delete(),
  before: () => {
    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        credential: firebase.credential.cert(credential),
      })
    }
  },
  beforeEach: async () =>
    firebase.auth().listUsers()
    |> await
    |> property('users')
    |> map('uid')
    |> map(uid => firebase.auth().deleteUser(uid))
    |> Promise.all,
})
