<!--
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

[![Version](https://img.shields.io/npm/v/@.svg)](https://npmjs.org/package/@adobe/aio-lib-cloudmanager)
[![Downloads/week](https://img.shields.io/npm/dw/@.svg)](https://npmjs.org/package/@adobe/aio-lib-cloudmanager)
[![Build Status](https://travis-ci.com/.svg?branch=master)](https://travis-ci.com/@adobe/aio-lib-cloudmanager)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/@adobe/aio-lib-cloudmanager/master.svg?style=flat-square)](https://codecov.io/gh/@adobe/aio-lib-cloudmanager/)

# Adobe I/O Cloud Manager Library

JavaScript SDK wrapping the [Adobe Cloud Manager API](https://www.adobe.io/apis/experiencecloud/cloud-manager/docs.html).

### Installing

```bash
$ npm install @adobe/aio-lib-cloudmanager
```

### Usage
1) Initialize the SDK

```javascript
const sdk = require('@adobe/aio-lib-cloudmanager')

async function sdkTest() {
  //initialize sdk
  const client = await sdk.init('<orgId>', 'x-api-key', '<valid auth token>')
}
```

2) Call methods using the initialized SDK

```javascript
const sdk = require('@adobe/aio-lib-cloudmanager')

async function sdkTest() {
  // initialize sdk
  const client = await sdk.init('<orgId>', 'x-api-key', '<valid auth token>')

  // call methods
  try {
    // get... something
    const result = await client.getSomething({})
    console.log(result)

  } catch (e) {
    console.error(e)
  }
}
```

## Classes

<dl>
<dt><a href="#CloudManagerAPI">CloudManagerAPI</a></dt>
<dd><p>This class provides methods to call your Cloud Manager APIs.
Before calling any method initialize the instance by calling the <code>init</code> method on it
with valid values for tenantId, apiKey and accessToken</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#init">init(orgId, apiKey, accessToken, baseUrl)</a> ⇒ <code><a href="#CloudManagerAPI">Promise.&lt;CloudManagerAPI&gt;</a></code></dt>
<dd><p>Returns a Promise that resolves with a new CloudManagerAPI object.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ListProgramOptions">ListProgramOptions</a> : <code>object</code></dt>
<dd><p>Options to the listPipeline function</p>
</dd>
<dt><a href="#EmbeddedProgram">EmbeddedProgram</a> : <code>object</code></dt>
<dd><p>Describes an <strong>Embedded Program</strong></p>
</dd>
<dt><a href="#Pipeline">Pipeline</a> : <code>object</code></dt>
<dd><p>Describes a <strong>CI/CD Pipeline</strong></p>
</dd>
<dt><a href="#PipelinePhase">PipelinePhase</a> : <code>object</code></dt>
<dd><p>Describes a phase of a pipeline</p>
</dd>
</dl>

<a name="CloudManagerAPI"></a>

## CloudManagerAPI
This class provides methods to call your Cloud Manager APIs.
Before calling any method initialize the instance by calling the `init` method on it
with valid values for tenantId, apiKey and accessToken

**Kind**: global class  

* [CloudManagerAPI](#CloudManagerAPI)
    * [.orgId](#CloudManagerAPI+orgId) : <code>string</code>
    * [.apiKey](#CloudManagerAPI+apiKey) : <code>string</code>
    * [.accessToken](#CloudManagerAPI+accessToken) : <code>string</code>
    * [.baseUrl](#CloudManagerAPI+baseUrl) : <code>string</code>
    * [.init(orgId, apiKey, accessToken, baseUrl)](#CloudManagerAPI+init) ⇒ [<code>Promise.&lt;CloudManagerAPI&gt;</code>](#CloudManagerAPI)
    * [.listPrograms()](#CloudManagerAPI+listPrograms) ⇒ <code>Promise.&lt;Array.&lt;EmbeddedProgram&gt;&gt;</code>
    * [.listPipelines(programId, options)](#CloudManagerAPI+listPipelines) ⇒ <code>Promise.&lt;Array.&lt;Pipeline&gt;&gt;</code>

<a name="CloudManagerAPI+orgId"></a>

### cloudManagerAPI.orgId : <code>string</code>
The organization id

**Kind**: instance property of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
<a name="CloudManagerAPI+apiKey"></a>

### cloudManagerAPI.apiKey : <code>string</code>
The api key from your integration

**Kind**: instance property of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
<a name="CloudManagerAPI+accessToken"></a>

### cloudManagerAPI.accessToken : <code>string</code>
The access token from your integration

**Kind**: instance property of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
<a name="CloudManagerAPI+baseUrl"></a>

### cloudManagerAPI.baseUrl : <code>string</code>
The base URL for the API endpoint

**Kind**: instance property of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
<a name="CloudManagerAPI+init"></a>

### cloudManagerAPI.init(orgId, apiKey, accessToken, baseUrl) ⇒ [<code>Promise.&lt;CloudManagerAPI&gt;</code>](#CloudManagerAPI)
Initializes a CloudManagerAPI object and returns it.

**Kind**: instance method of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
**Returns**: [<code>Promise.&lt;CloudManagerAPI&gt;</code>](#CloudManagerAPI) - a CloudManagerAPI object  

| Param | Type | Description |
| --- | --- | --- |
| orgId | <code>string</code> | the organization id |
| apiKey | <code>string</code> | the API key for your integration |
| accessToken | <code>string</code> | the access token for your integration |
| baseUrl | <code>string</code> | the base URL to access the API (defaults to https://cloudmanager.adobe.io) |

<a name="CloudManagerAPI+listPrograms"></a>

### cloudManagerAPI.listPrograms() ⇒ <code>Promise.&lt;Array.&lt;EmbeddedProgram&gt;&gt;</code>
Obtain a list of programs for the target organization.

**Kind**: instance method of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
**Returns**: <code>Promise.&lt;Array.&lt;EmbeddedProgram&gt;&gt;</code> - an array of Programs  
<a name="CloudManagerAPI+listPipelines"></a>

### cloudManagerAPI.listPipelines(programId, options) ⇒ <code>Promise.&lt;Array.&lt;Pipeline&gt;&gt;</code>
Obtain a list of pipelines for the target program.

**Kind**: instance method of [<code>CloudManagerAPI</code>](#CloudManagerAPI)  
**Returns**: <code>Promise.&lt;Array.&lt;Pipeline&gt;&gt;</code> - an array of Pipelines  

| Param | Type | Description |
| --- | --- | --- |
| programId | <code>string</code> | the program id |
| options | [<code>ListProgramOptions</code>](#ListProgramOptions) | options |

<a name="init"></a>

## init(orgId, apiKey, accessToken, baseUrl) ⇒ [<code>Promise.&lt;CloudManagerAPI&gt;</code>](#CloudManagerAPI)
Returns a Promise that resolves with a new CloudManagerAPI object.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;CloudManagerAPI&gt;</code>](#CloudManagerAPI) - a Promise with a CloudManagerAPI object  

| Param | Type | Description |
| --- | --- | --- |
| orgId | <code>string</code> | the organization id |
| apiKey | <code>string</code> | the API key for your integration |
| accessToken | <code>string</code> | the access token for your integration |
| baseUrl | <code>string</code> | the base URL to access the API (defaults to https://cloudmanager.adobe.io) |

<a name="ListProgramOptions"></a>

## ListProgramOptions : <code>object</code>
Options to the listPipeline function

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| busy | <code>boolean</code> | if true, only busy pipelines will be returned |

<a name="EmbeddedProgram"></a>

## EmbeddedProgram : <code>object</code>
Describes an __Embedded Program__

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Identifier of the program. Unique within the space. |
| name | <code>string</code> | Name of the program |
| enabled | <code>boolean</code> | Whether this Program has been enabled for Cloud Manager usage |
| tenantId | <code>string</code> | Tenant Id |

<a name="Pipeline"></a>

## Pipeline : <code>object</code>
Describes a __CI/CD Pipeline__

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Identifier of the pipeline. Unique within the program. |
| programId | <code>string</code> | Identifier of the program. Unique within the space. |
| name | <code>string</code> | Name of the pipeline |
| trigger | <code>string</code> | How should the execution be triggered. ON_COMMIT: each time a PR is available and the Pipeline is idle then a execution is triggered. MANUAL: triggerd through UI or API. SCHEDULE: recurring schedule (not yet implemented} |
| status | <code>string</code> | Pipeline status |
| createdAt | <code>string</code> | Create date |
| updatedAt | <code>string</code> | Update date |
| lastStartedAt | <code>string</code> | Last pipeline execution start |
| lastFinishedAt | <code>string</code> | Last pipeline execution end |
| phases | [<code>Array.&lt;PipelinePhase&gt;</code>](#PipelinePhase) | Pipeline phases in execution order |

<a name="PipelinePhase"></a>

## PipelinePhase : <code>object</code>
Describes a phase of a pipeline

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the phase |
| type | <code>string</code> | Type of the phase |
| repositoryId | <code>string</code> | Identifier of the source repository. The code from this repository will be build at the start of this phase.  Mandatory if type=BUILD |
| branch | <code>string</code> | Name of the tracked branch or a fully qualified git tag (e.g. refs/tags/v1).   Assumed to be `master` if missing. |
| environmentId | <code>string</code> | Identifier of the target environment. Mandatory if type=DEPLOY |

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
