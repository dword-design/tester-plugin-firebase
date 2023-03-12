import dotenv from '@dword-design/dotenv-json-extended'
import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import { execaCommand } from 'execa'
import fs from 'fs-extra'

dotenv.config()

export default tester({
  'existing document': async () => {
    await fs.outputFile(
      'index.spec.js',
      endent`
        import * as firebase from 'firebase-admin'
        import { property } from '@dword-design/functions'

        import self from '../src/index.js'

        firebase.initializeApp({
          credential: firebase.credential.cert(
            process.env.FIREBASE_ADMIN_CONFIG |> JSON.parse
          ),
        })

        export default tester([
          () => firebase
            .firestore()
            .collection('coll')
            .doc('foo')
            .set({ abc: 'def' }),
          () => expect(firestore.collection('coll').get() |> await |> property('docs').length).toEqual(0)
        ], [self(process.env.FIREBASE_ADMIN_CONFIG |> JSON.parse)])
      `,
    )
    await execaCommand(
      'mocha --require @dword-design/babel-register-esm index.spec.js',
    )
  },
})
