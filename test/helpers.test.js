/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const halfred = require('halfred')
const { isWithinFiveMinutesOfUTCMidnight, sleep, findStepState } = require('../src/helpers')
const execution1007 = halfred.parse(require('./jest/data/execution1007.json'))
const executionWithoutPerformanceTesting = halfred.parse(require('./jest/data/execution-no-performance.json'))

afterEach(() => {
  jest.useRealTimers()
})

test('isWithinFiveMinutesOfUTCMidnight', async () => {
  const utcDate1 = new Date(Date.UTC(2019, 9, 12, 23, 55, 14))
  expect(isWithinFiveMinutesOfUTCMidnight(utcDate1)).toEqual(true)
  const utcDate2 = new Date(Date.UTC(2019, 9, 12, 23, 53, 14))
  expect(isWithinFiveMinutesOfUTCMidnight(utcDate2)).toEqual(false)
  const utcDate3 = new Date(Date.UTC(2019, 9, 12, 0, 4, 14))
  expect(isWithinFiveMinutesOfUTCMidnight(utcDate3)).toEqual(true)
  const utcDate4 = new Date(Date.UTC(2019, 9, 12, 0, 6, 0))
  expect(isWithinFiveMinutesOfUTCMidnight(utcDate4)).toEqual(false)
})

test('sleep', async () => {
  jest.useFakeTimers('legacy')

  const result = sleep(500)
  await expect(result instanceof Promise).toBeTruthy()

  expect(setTimeout).toHaveBeenCalledTimes(1)
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500)

  jest.runAllTimers()

  await expect(result).resolves.toBeUndefined()
})

test('findStepState -- security', () => {
  const result = findStepState(execution1007, 'security')
  expect(result).toBeTruthy()
})

test('findStepState -- performance', () => {
  const result = findStepState(execution1007, 'performance')
  expect(result).toBeTruthy()
})

test('findStepState -- performance not found', () => {
  const result = findStepState(executionWithoutPerformanceTesting, 'performance')
  expect(result).toBeUndefined()
})
