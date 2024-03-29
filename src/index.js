import { map, property } from '@dword-design/functions'
import firebase from 'firebase-admin'

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
    Promise.all([
      firebase.firestore().listCollections()
        |> await
        |> map(collection => firebase.firestore().recursiveDelete(collection))
        |> Promise.all,
      firebase.auth().listUsers()
        |> await
        |> property('users')
        |> map('uid')
        |> map(uid => firebase.auth().deleteUser(uid))
        |> Promise.all,
    ]),
})
