/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { codes } = require('../src/SDKErrors')
const allowedCodes = Object.keys(codes)

const requiredArgCounts = {
  '_get' : 2,
  '_put': 3,
  '_delete' : 2,
  '_patch' : 3,
  '_post' : 3,
}

module.exports = {
  create: function (context) {
    return {
      'MemberExpression > Identifier[name="codes"]': (node) => {
        const errorCode = node.parent.property.name
        if (!allowedCodes.includes(errorCode)) {
          context.report({
            node: node.parent,
            message: "Undefined error code: {{ errorCode }}",
            data: {
              errorCode
            }
          })
        }
      },
      'CallExpression': (node) => {
        if (node.callee.property && Object.keys(requiredArgCounts).includes(node.callee.property.name)) {
          const functionName = node.callee.property.name
          const requiredCount = requiredArgCounts[functionName]
          const argumentCount = node.arguments.length
          if (argumentCount !== requiredCount) {
            context.report({
              node: node.parent,
              message: "Method {{ functionName }} requires {{ requiredCount }} but actual count was {{ argumentCount }}.",
              data: {
                functionName,
                requiredCount,
                argumentCount,
              }
            })
          }
          const lastArgument = node.arguments[argumentCount - 1]
          if (lastArgument.type !== 'MemberExpression') {
            context.report({
              node: node.parent,
              message: "The last argument to {{ functionName }} needs to be an ErrorCode object but was a {{ type }}.",
              data: {
                functionName,
                type: lastArgument.type,
              }
            })
          }
        }
      },
      'NewExpression': (node) => {
        if (node.callee.name === 'Error') {
          context.report({
            node: node,
            message: "Error constructor should not be used. ErrorCodes should be used instead.",
          })
        }
      }
    }
  },
}
