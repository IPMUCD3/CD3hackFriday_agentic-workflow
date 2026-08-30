# Replication brief

## Objective

Reproduce the scientific content of Ioannidis (2005) Figure 1, all nine Table 4
PPVs, and the Table 2 correction identity. Emit `MATCH` or `UNMATCHED` for every
check. Reproduction does not endorse the model assumptions or headline claim.

## Source provenance

- Original: DOI `10.1371/journal.pmed.0020124`, local PDF SHA-256
  `ffc1005680cb620eec4c913437dfabbf311b535cfe16cbaeb2faec1f92afc362`.
- Correction: DOI `10.1371/journal.pmed.1004085`, local PDF SHA-256
  `3cf06b98e2f61177d80c53ada12cd91949400dfdd114fefe9e2b47b87948c65e`.

## Inputs and symbols

- `R >= 0`: pre-study odds of true to non-true relationships.
- `power = 1-beta`, constrained to `[0,1]`.
- `alpha`: false-positive rate; use `0.05` for all published targets.
- `u`: bias parameter, constrained to `[0,1]`.
- `c`: number of relationships considered; set `c=1000` for the Table 2
  identity because the choice cancels from the comparison.

## Equations

With `beta = 1-power`, calculate

`PPV = (power R + u beta R) / (R + alpha - beta R + u - u alpha + u beta R)`.

For the corrected Table 2 false-positive cell, calculate

`(c alpha + u c (1-alpha)) / (R+1)`.

For the original printed expression under normal operator precedence, calculate

`c alpha + u c (1-alpha) / (R+1)`.

The companion cell for a negative finding when no relationship exists is

`(1-u)c(1-alpha)/(R+1)`,

and the required column total is `c/(R+1)`.

## Independent reference values

The implementation must read these values rather than generate its own oracle.

| power | R | u | published PPV |
|---:|---:|---:|---:|
| 0.80 | 1 | 0.10 | 0.85 |
| 0.95 | 2 | 0.30 | 0.85 |
| 0.80 | 1/3 | 0.40 | 0.41 |
| 0.20 | 1/5 | 0.20 | 0.23 |
| 0.20 | 1/5 | 0.80 | 0.17 |
| 0.80 | 1/10 | 0.30 | 0.20 |
| 0.20 | 1/10 | 0.30 | 0.12 |
| 0.20 | 1/1000 | 0.80 | 0.0010 |
| 0.20 | 1/1000 | 0.20 | 0.0015 |

The supplied immutable oracle files are relative to `cli/starter/`:

- `reference/published_table4.csv` contains the nine rows above; SHA-256
  `a55c621c928f043bb4f7f7fbe36c0d81de3ff9fe980ca795e4e3fba9073e35f4`.
- `reference/figure1_checkpoints.json` contains 36 checkpoints: every
  combination of powers `(0.8, 0.5, 0.2)` and biases
  `(0.05, 0.2, 0.5, 0.8)` at `R=(0.1, 0.5, 1.0)`; SHA-256
  `8eaa83bdd8cad9b8ece9e10e005b9cccdd28c9fb5a89a37ee4f2e1f8b5c20cf4`.

Treat these files as read-only. The implementation must consume them and must
not derive, overwrite, or replace its own oracle.

## Figure 1 target

- Three vertically arranged panels: powers 80%, 50%, and 20%.
- Four curves per panel: `u=0.05`, `0.20`, `0.50`, and `0.80`.
- Horizontal axis: pre-study odds `R` from 0 to 1.
- Vertical axis: PPV from 0% to 100%.
- Verify numerical curve data; do not require pixel-identical rendering.

## Acceptance tests

1. **Table 4:** format each calculated PPV to the precision printed in the paper;
   all nine lines must be `MATCH`.
2. **Table 2 printed expression:** with `c=1000`, `R=0.1`, and `u=0.3`, the
   two relevant cells must fail to equal `c/(R+1)`; print `UNMATCHED`.
3. **Table 2 corrected expression:** the same column sum must equal `c/(R+1)`;
   print `MATCH`.
4. **Figure 1:** all 12 curves must match their three independent checkpoints
   with absolute tolerance `1e-12`; print one status per curve.
5. Save a readable PNG containing all three panels.
6. Print final `OVERALL: MATCH` only when all expected outcomes occur, including
   the deliberate `UNMATCHED` status for the original printed expression.
