import { transformFileSync } from '@babel/core'

let cache = {}

const setHash = ({ filename, id, name }) => {
  cache[id] = `${filename.split('/').slice(-2).join('/')} ${name}`
}

const plugins = [
  ['./src/babel', { setHash }],
]

const presets = [
  '@babel/preset-react',
]

describe('babel plugin with options', () => {
  let config = {}

  beforeEach(() => {
    config = {}
    cache = {}

    jest.doMock('../config', () => new Proxy(jest.requireActual('../config'), {
      get: (target, value) => (value in config ? config[value] : target[value]),
    }))
  })

  it('should cache all Elements', () => {
    transformFileSync(require.resolve('./App'), {
      plugins,
      presets,
    })

    expect(cache).toMatchSnapshot()
  })
})
