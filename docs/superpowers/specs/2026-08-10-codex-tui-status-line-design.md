# Codex TUI Status-Line Design

## Goal

Configure the native Codex CLI status line globally so every interactive project shows the active model and reasoning effort, context consumption, token counts, weekly allowance, and repository context.

## Scope

The change updates the existing `[tui]` section in `~/.codex/config.toml`. It does not add project-local configuration, install scripts, or modify the Codex executable.

Codex 0.147.0 has no native status-line item for the current account or latest Git commit. Account display is therefore out of scope. The approved `branch-changes` item replaces the requested latest-commit field and reports committed additions and deletions relative to the default branch.

## Configuration

Set `tui.status_line` to this ordered list while preserving `status_line_use_colors = true`:

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

The order establishes truncation priority because the Codex footer is a single line and truncates content on narrow terminals:

1. Model and reasoning effort.
2. Context percentage used and total window size.
3. Session total, input, and output token counts.
4. Weekly allowance remaining.
5. Working directory, Git branch, and branch-change summary.

## Runtime Behavior

Codex separates available values with ` · `. Representative output is:

```text
gpt-5.6-sol xhigh · Context 23% used · 272K window · 63K used · 60K in · 3K out · weekly 81% left · ~/project · main · +24 -7
```

The exact values are supplied by the active session. Context, token, allowance, and Git fields can be omitted temporarily when Codex has not received their data or when the current directory is not a Git repository.

## Error Handling

Only identifiers supported by the installed Codex 0.147.0 release are used. The edit must preserve the existing TOML structure and all unrelated settings. If validation fails, correct the status-line entry without replacing or reformatting unrelated configuration.

## Validation

After editing:

1. Confirm the configured array and its order in `~/.codex/config.toml`.
2. Run Codex with strict configuration parsing.
3. Run `codex doctor --json` and confirm that `config.load` remains successful.
4. Report any network-health warnings separately because they do not invalidate the local status-line configuration.

