# docs/14-folder-convention.md

# Folder Convention

Version: 1.0.0

Status: Approved

Owner: Engineering

---

# Philosophy

Folders represent business domains.

Not file types.

---

# Root Structure

```text
src/

app/

components/

config/

content/

dsl/

compiler/

engine/

features/

hooks/

i18n/

lib/

services/

store/

styles/

types/

utils/
```

---

# App

Contains:

* Router
* Providers
* Global Layout
* Theme
* Entry Point

---

# Features

```
features/

home/

language/

preparation/

race/

report/

history/

settings/
```

Each feature owns itself.

---

# Engine

```
engine/

simulation/

events/

weather/

story/

timeline/

score/

validation/

random/

types/
```

Engine never imports React.

---

# Content

```
content/

races/

equipment/

events/

translations/

```

Contains only static content.

---

# Compiler

```
compiler/

lexer/

parser/

normalizer/

validator/

```

Compiler converts DSL into executable JSON.

---

# Services

Application orchestration.

```
services/

challenge/

simulation/

history/

storage/

```

---

# Store

```
store/

player/

settings/

history/

```

Only application state.

Never gameplay state.

---

# Components

```
components/

ui/

layout/

feedback/

navigation/

```

Shared only.

---

# Lib

External wrappers.

```
lib/

dayjs/

zod/

uuid/

```

---

# Types

Global shared types.

```
types/

common/

api/

engine/

```

---

# Utilities

Pure helper functions.

```
utils/

date/

math/

string/

random/

```

---

# Naming Convention

Folders

kebab-case

Files

kebab-case

Types

PascalCase

Functions

camelCase

Constants

UPPER_SNAKE_CASE

Enums

PascalCase

---

# Import Rules

Allowed

Feature

↓

Service

↓

Engine

Forbidden

Engine

↓

Feature

Forbidden

Shared UI

↓

Engine

---

# Test Structure

```
tests/

unit/

integration/

e2e/
```

Engine tests are mandatory.

---

# AI Rules

Never create duplicate folders.

Never create duplicate utilities.

Never create "helpers.ts".

Never create "common.ts".

Every file must have a single purpose.

Maximum recommended file length:

300 lines.

Maximum function length:

50 lines.

Maximum nesting depth:

3.

Cyclomatic complexity:

<10.

---

# Long-Term Vision

The project should remain understandable after 5 years of development.

Folder structure is part of the product architecture.

Changing it requires an RFC.
