import dotenv from '@dword-design/dotenv-json-extended'
import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import fs from 'fs-extra'

dotenv.config()

export default tester(
  {
    'existing document': async () => {
      await fs.outputFile(
        'index.spec.js',
        endent`
          import firebase from 'firebase-admin'
          import { property } from '@dword-design/functions'
          import tester from '@dword-design/tester'
          import { expect } from 'expect'

          import self from '../src/index.js'

          firebase.initializeApp({
            credential: firebase.credential.cert(
              process.env.FIREBASE_ADMIN_CONFIG |> JSON.parse
            ),
          })

          export default tester([
            () => Promise.all([
              firebase
                .firestore()
                .collection('coll')
                .doc('foo')
                .set({ abc: 'def' }),
              firebase.auth().createUser({ email: 'a@b.de' }),
            ]),
            async () => {
              expect(firebase.firestore().listCollections() |> await |> property('length')).toEqual(0)
              expect(firebase.firestore().collection('coll').get() |> await |> property('docs.length')).toEqual(0)
              expect(firebase.auth().listUsers() |> await |> property('users.length')).toEqual(0)
            },
          ], [self(process.env.FIREBASE_ADMIN_CONFIG |> JSON.parse)])
        `,
      )
      await execaCommand('mocha --ui exports --require babel-register-esm index.spec.js')
    },
  },
  [testerPluginTmpDir()],
)
