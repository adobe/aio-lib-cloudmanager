# Contributing

Thanks for choosing to contribute!

The following are a set of guidelines to follow when contributing to this project.

## Code Of Conduct

This project adheres to the Adobe [code of conduct](../CODE_OF_CONDUCT.md). By participating,
you are expected to uphold this code. Please report unacceptable behavior to
[Grp-opensourceoffice@adobe.com](mailto:Grp-opensourceoffice@adobe.com).

## Have A Question?

Start by filing an issue. The existing committers on this project work to reach
consensus around project direction and issue solutions within issue threads
(when appropriate).

## Contributor License Agreement

All third-party contributions to this project must be accompanied by a signed contributor
license agreement. This gives Adobe permission to redistribute your contributions
as part of the project. [Sign our CLA](http://opensource.adobe.com/cla.html). You
only need to submit an Adobe CLA one time, so if you have submitted one previously,
you are good to go!

## Code Reviews

All submissions should come in the form of pull requests and need to be reviewed
by project committers. Read [GitHub's pull request documentation](https://help.github.com/articles/about-pull-requests/)
for more information on sending pull requests.

Lastly, please follow the [pull request template](PULL_REQUEST_TEMPLATE.md) when
submitting a pull request!

## From Contributor To Committer

We love contributions from our community! If you'd like to go a step beyond contributor
and become a committer with full write access and a say in the project, you must
be invited to the project. The existing committers employ an internal nomination
process that must reach lazy consensus (silence is approval) before invitations
are issued. If you feel you are qualified and want to get more deeply involved,
feel free to reach out to existing committers to have a conversation about that.

## Security Issues

Security issues shouldn't be reported on this issue tracker. Instead, [file an issue to our security experts](https://helpx.adobe.com/security/alertus.html)

## Coding Patterns and Styles

> The below is all very generalized guidance. There may be exception situations, of course.

Most of the time, contributions will be focused on adding new methods to the `CloudManagerAPI` class. Although someday this project will probably migrate to TypeScript. Until that point...

* Methods which are intended to be called from consumers of this library should be camel-cased and *not* prefixed with _ (underscore).
* Methods which are only intended for internal usage should be camel-cased and prefixed with _ (underscore).

New methods should correspond 1:1 with HTTP actions exposed through the [Cloud Manager API](https://www.adobe.io/apis/experiencecloud/cloud-manager/docs.html). Methods which make multiple, sequential HTTP calls are refactor candidates.

Unless working around a defect in the API (which should be logged and, eventually, fixed), URL/path generation should *never* be done. The only way to obtain an API path should be by navigating using HAL links, including the use of templatized links.

HTTP calls to the Cloud Manager API should be done through one of the `_get`, `_post`, `_put`, `_delete`, etc. methods. Calling `_doRequest` is fine, but the verb-specific methods aid in readability. HTTP calls to other services should use `fetch` directly.

Consumer-exposed methods should generally return a promise for some domain object (or an array of domain objects). There are two possibilities:

1. A type defined in the Cloud Manager API Swagger. This is the normal case.
2. A "custom" type which is specific to this library.

JSDoc for a _partial_ list of types defined in the Swagger file are generated (in `src/sdktypes.jsdoc.js`) using the script `tools/generate-jsdoc-types.js`. If a new generated type is needed, please update the `desiredDefinitions` array in this file. `src/sdktypes.jsdoc.js` should not be edited by hand. Custom types are defined in `src/types.jsdoc.js`.

Is is fine, but not strictly necessary, for consumer-exposed methods to return `halfred`-parsed Resource objects. This need not be documented in the JSDoc for the method. _Removing_ the halfred parser for return objects, however, should not be done. Again, someday this library will switch to TypeScript and this will be handled through intersection types.

Any Error thrown should be defined in `src/SDKErrors.js` and instantiated using `new codes.ERROR_NAME()`. When using `_doRequest` (or the verb-specific helper methods), the constructor (e.g. `codes.ERROR_NAME`) is passed and the object is constructed inside `_doRequest`.

General coding style is enforced by eslint. 

## Commits and Releasing

Commits (generally via merged pull requests) to the `main` branch of this repository will automatically generate [semantically versioned releases](https://github.com/semantic-release). To accomplish this, commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) syntax, specifically:

For bug fixes:
```
fix(scope): <description> fixes #123

[optional content]
```

For features:
```
feat(scope): <description> fixes #123

[optional content]
```

For breaking changes:
```
feat(scope): <description> fixes #123

[optional content]

BREAKING CHANGE: <description>
```

In general, the scope should be the related entity type (program, environment, pipeline), but there may be exceptions.

The `chore` type may be used for trivial changes in developer documentation (like this file), dependencies, or tests.

The `feat` and `fix` types must also contain a reference to a GitHub issue ID, e.g. `fixes #123`

[husky](https://typicode.github.io/husky/) is used to verify commit messages before committing. But please do not rely upon husky to do the right thing.