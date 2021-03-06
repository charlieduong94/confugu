const test = require('ava')

const confugu = require('../index')

const NUM_VAR = 123456
const STRING_VAR = 'some environment variable'

test.beforeEach('Set environment variables', (t) => {
  process.env = {
    NUM_VAR,
    STRING_VAR
  }
})

test('should be able to load a simple config synchronously', (t) => {
  const configPath = require.resolve('./fixtures/simple-config.yml')
  const config = confugu.loadSync(configPath)

  t.deepEqual(config, {
    test: 'test value',
    testNum: 123456
  })
})

test('should add a "get" function in synchronous load', (t) => {
  const configPath = require.resolve('./fixtures/simple-config.yml')
  const config = confugu.loadSync(configPath)

  t.is(config.get('test'), 'test value')
  t.is(config.get('testNum'), 123456)
})

test('should allow "get" on deeply nested config in synchronous load', async (t) => {
  const configPath = require.resolve('./fixtures/deep-config.yml')
  const config = confugu.loadSync(configPath)

  t.is(config.get('test.deep.nested.config.name'), 'John')
  t.is(config.get('other.deep.nested.config.name'), 'Jane')
})

test('should throw an error if invalid path is given', (t) => {
  const configPath = 'some invalid path'

  try {
    confugu.loadSync(configPath)
    t.fail()
  } catch (err) {
    t.true(err.message.includes('ENOENT'))
    t.pass()
  }
})

test('should throw an error if an invalid config is given', (t) => {
  const configPath = require.resolve('./fixtures/invalid-config.yml')

  try {
    confugu.loadSync(configPath)
    t.fail()
  } catch (err) {
    t.true(err.message.includes('YAMLException'))
    t.pass()
  }
})

test('should be able to parse environment variables', (t) => {
  const configPath = require.resolve('./fixtures/environment-variables-config.yml')
  const config = confugu.loadSync(configPath)

  t.deepEqual(config, {
    numVar: NUM_VAR,
    stringVar: STRING_VAR,
    test: 'test'
  })
})

test('should delete environment variable properties that are not defined', async (t) => {
  process.env.STRING_VAR_UND = 'hello'
  const configPath = require.resolve('./fixtures/environment-variables-undefined-config.yml')
  const config = confugu.loadSync(configPath)

  t.deepEqual(config, {
    stringVarUnd: 'hello',
    sub: {},
    test: 'test'
  })
})
