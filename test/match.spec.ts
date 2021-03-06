import expect from 'expect'
import { Path } from '../src'

const match = obj => {
  for (let name in obj) {
    test('test match ' + name, () => {
      const path = new Path(name)
      if (Array.isArray(obj[name]) && Array.isArray(obj[name][0])) {
        obj[name].forEach(_path => {
          expect(path.match(_path)).toBeTruthy()
        })
      } else {
        expect(path.match(obj[name])).toBeTruthy()
      }
    })
  }
}

const unmatch = obj => {
  for (let name in obj) {
    test('test unmatch ' + name, () => {
      const path = new Path(name)
      if (Array.isArray(obj[name]) && Array.isArray(obj[name][0])) {
        obj[name].forEach(_path => {
          expect(path.match(_path)).toBeFalsy()
        })
      } else {
        expect(path.match(obj[name])).toBeFalsy()
      }
    })
  }
}

test('test matchGroup', () => {
  const pattern = new Path('*(aa,bb,cc)')
  expect(pattern.matchAliasGroup('aa', 'bb', 'dd')).toEqual(true)
  const excludePattern = new Path('aa.bb.*(11,22,33).*(!aa,bb,cc)')
  expect(
    excludePattern.matchAliasGroup('aa.bb.11.mm', 'aa.bb.22.bb', 'aa.bb.33.cc')
  ).toEqual(false)
  const patttern2 = Path.parse('*(array)')
  expect(
    patttern2.matchAliasGroup(['array',0],['array',0])
  ).toEqual(false)
})

test('test zero', () => {
  expect(Path.parse('t.0.value~').match(['t', 0, 'value_list'])).toEqual(true)
})

test('test expand', () => {
  expect(
    Path.parse('t.0.value~').match(['t', 0, 'value_list', 'hello'])
  ).toEqual(false)
})

test('test multi expand', () => {
  expect(Path.parse('*(aa~,bb~).*').match(['aa12323', 'asdasd'])).toEqual(true)
})

test('test group', () => {
  const node = Path.parse('*(phases.*.type,phases.*.steps.*.type)')
  expect(
    node.match(
      'phases.0.steps.1.type'
    )
  ).toBeTruthy()
})

match({
  '*': [[], ['aa'], ['aa', 'bb', 'cc'], ['aa', 'dd', 'gg']],
  '*.a.b': [['c', 'a', 'b'], ['k', 'a', 'b'], ['m', 'a', 'b']],
  'a.*.k': [['a', 'b', 'k'], ['a', 'd', 'k'], ['a', 'c', 'k']],
  'a.*(b,d,m).k': [['a', 'b', 'k'], ['a', 'd', 'k'], ['a', 'm', 'k']],
  'a.*(!b,d,m).*(!a,b)': [['a', 'o', 'k'], ['a', 'q', 'k'], ['a', 'c', 'k']],
  'a.*(b.c.d,d,m).k': [
    ['a', 'b', 'c', 'd', 'k'],
    ['a', 'd', 'k'],
    ['a', 'm', 'k']
  ],
  'a.*(b.*(c,k).d,d,m).k': [
    ['a', 'b', 'c', 'd', 'k'],
    ['a', 'b', 'k', 'd', 'k'],
    ['a', 'd', 'k'],
    ['a', 'm', 'k']
  ],
  't.0.value~': [['t', '0', 'value']],
  'a.*[10:50].*(!a,b)': [['a', 49, 's'], ['a', 10, 's'], ['a', 50, 's']],
  'a.*[:50].*(!a,b)': [['a', 49, 's'], ['a', 10, 's'], ['a', 50, 's']],
  'a.*([[a.b.c]],[[c.b.d~]])': [['a', '[[a.b.c]]'], ['a', 'c.b.d~']],
  'a.*(!k,d,m).k': [['a', 'u', 'k'], ['a', 'o', 'k'], ['a', 'p', 'k']],
  'a\\.\\*\\[1\\]': [['a.*[1]']],
  '[[\\[aa,bb\\]]]': [['[aa,bb]']],
  '[[\\[aa,bb\\]   ]]': [['[aa,bb]   ']],
  '[[   \\[aa,bb~\\]   ]]': [['   [aa,bb~]   ']],
  'aa.bb.*': [['aa', 'bb', 'ccc']],
  'a.*': [['a', 'b'], ['a', 'b', 'c']],
  'aaa.products.0.*': [['aaa', 'products', '0', 'aaa']],
  'aa~.ccc': [['aa', 'ccc'], ['aa12', 'ccc']],
  '*(aa~,bb~).*': [['aa12323', 'asdasd'], ['bb12222', 'asd']],
  '*(aa,bb,bb.aa)': [['bb', 'aa']],
  '*(!aa,bb,bb.aa)': [['xx'], ['yyy'], ['bb', 'ss']],
  '*(!aaa)': [['bbb']]
})

unmatch({
  'a.*': [['a'], ['b']],
  '*(array)': [['array','0']],
  'aa.bb.*': [['aa', 'bb']],
  'a.*.b': [['a', 'k', 'b', 'd']],
  '*(!aaa)': [['aaa']],
  a: [['c', 'b']],
  'aa~.ccc': [['a', 'ccc'], ['aa'], ['aaasdd']],
  bb: [['bb', 'cc']],
  'aa.*(cc,bb).*.aa': [['aa', 'cc', '0', 'bb']]
})
