import { resolveBy, select } from '../'
import { getHashmapFromComment, buildComment } from '../utils'
import * as app from './App'

const TEST_ID = 'data-tid'

const resolve = resolveBy(require.resolve)

describe('runtime', () => {
  it('should resolve components with right test ids', () => {
    const exports = resolve('./App')

    Object.entries(app).forEach(([key, value]) => {
      expect(exports[key][TEST_ID]).toEqual(value[TEST_ID])
    })
  })

  it('should provide an access for unexported components', () => {
    const { UnexportComponent } = resolve('./App')

    expect(select`${UnexportComponent}`).toMatchSnapshot()
  })

  it('should throw an error for undefined component', () => {
    const { UndefinedComponent } = resolve('./App')

    expect(() => select`${UndefinedComponent}`).toThrowErrorMatchingSnapshot()
  })

  it('should get hashmap from comment', () => {
    const hashmap = { Button: { [TEST_ID]: 'button-hash' } }
    expect(getHashmapFromComment(`/*${buildComment(hashmap)}*/`)).toEqual(hashmap)
  })
})
