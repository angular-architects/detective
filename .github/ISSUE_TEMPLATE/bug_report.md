---
name: Issue
about: Report an issue
title: ''
labels:
assignees:
---

# Issue

Please describe the steps necessary to reproduce the error.

If it is an error with parsing your git log, please also add a link to your gitlog. You can find it in

```
.detective/log
```

To prevent disclosing sensitive information, you can obfuscate it. For instance, this commend replaces each letter with an `x`:

```bash
necessarysed 's/[a-zA-Z]/x/g' .detective/log > masked-log.txt
```
