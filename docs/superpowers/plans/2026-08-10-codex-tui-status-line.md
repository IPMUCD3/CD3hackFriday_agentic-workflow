# Codex TUI Status Line Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the global Codex CLI footer to show model and effort, context usage and capacity, session token counts, weekly allowance remaining, working directory, Git branch, and branch-change statistics.

**Architecture:** Use Codex 0.147.0's native `tui.status_line` array in the existing user-level TOML configuration. Preserve all unrelated settings and validate both TOML loading and the persisted item order with the installed CLI.

**Tech Stack:** Codex CLI 0.147.0, TOML, shell validation commands

---

## File Structure

- Modify: `/Users/nguyenmn/.codex/config.toml` — global Codex settings; replace only the empty native status-line array.
- Preserve: `/Users/nguyenmn/.codex/config.toml` `[tui].status_line_use_colors` — retain theme-aware status-line colors.

No application source or test files are needed because this is a declarative user-configuration change. The acceptance checks exercise the installed Codex parser and inspect the exact persisted configuration.

### Task 1: Configure and Validate the Native Status Line

**Files:**
- Modify: `/Users/nguyenmn/.codex/config.toml:195`
- Test: `/Users/nguyenmn/.codex/config.toml` through Codex strict parsing and doctor diagnostics

- [ ] **Step 1: Run the acceptance check before editing**

Run:

```bash
! rg -q '^status_line = \[\]$' /Users/nguyenmn/.codex/config.toml
```

Expected: FAIL with exit status 1 because the current status-line array is empty.

- [ ] **Step 2: Replace the empty status-line array**

Apply this focused patch:

```diff
 [tui]
-status_line = []
+status_line = [
+  "model-with-reasoning",
+  "context-used",
+  "context-window-size",
+  "used-tokens",
+  "total-input-tokens",
+  "total-output-tokens",
+  "weekly-limit",
+  "current-dir",
+  "git-branch",
+  "branch-changes",
+]
 status_line_use_colors = true
```

- [ ] **Step 3: Re-run the acceptance check**

Run:

```bash
! rg -q '^status_line = \[\]$' /Users/nguyenmn/.codex/config.toml
```

Expected: PASS with exit status 0.

- [ ] **Step 4: Confirm the exact persisted order**

Run:

```bash
sed -n '195,209p' /Users/nguyenmn/.codex/config.toml
```

Expected:

```toml
[tui]
status_line = [
  "model-with-reasoning",
  "context-used",
  "context-window-size",
  "used-tokens",
  "total-input-tokens",
  "total-output-tokens",
  "weekly-limit",
  "current-dir",
  "git-branch",
  "branch-changes",
]
status_line_use_colors = true
```

- [ ] **Step 5: Validate strict Codex configuration parsing**

Run:

```bash
codex --strict-config --version
```

Expected: exit status 0 and output containing `codex-cli 0.147.0`.

- [ ] **Step 6: Validate Codex doctor configuration health**

Run:

```bash
codex --strict-config doctor --json | jq -e '.checks["config.load"].status == "ok"'
```

Expected: `true` and exit status 0. Provider reachability may remain failed in the sandbox; that is independent of local config loading.

- [ ] **Step 7: Record completion**

Do not create a Git commit for `/Users/nguyenmn/.codex/config.toml` because it is outside the repository. Report the exact configured fields, parser result, doctor `config.load` result, and the independent network-health warning if it remains present.

