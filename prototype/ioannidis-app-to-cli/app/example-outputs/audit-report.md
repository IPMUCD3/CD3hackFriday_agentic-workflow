# Independent audit report

## Publication-status check

**SUPPORTED.** PLOS records a 2022 correction under DOI
[`10.1371/journal.pmed.1004085`](https://doi.org/10.1371/journal.pmed.1004085).
It states that Table 2 omitted parentheses in the cell “Research Finding = Yes,
True Relationship = No.” The corrected cell is

`(c alpha + u c (1-alpha)) / (R+1)`.

The original typesetting can be read as

`c alpha + u c (1-alpha) / (R+1)`.

No retraction was identified on the PLOS publication record checked for this
prototype.

## Claim audit

| Companion claim | Verdict | Evidence and qualification |
|---|---|---|
| PPV depends on pre-study odds, power, alpha, and—in the extension—bias. | **SUPPORTED** | Defined in the original PDF on pp. 1-2, Tables 1-2 and the adjacent equations. |
| Figure 1 shows lower PPV as bias increases at fixed power and odds. | **SUPPORTED** | The four curves in each panel are ordered by `u`; the stated exception at very low power is discussed on p. 2. |
| Table 4 contains nine model-derived PPVs at `alpha=0.05`. | **SUPPORTED** | PDF p. 5, Table 4 and its footnote. |
| The title is an empirical measurement of all published literature. | **UNSUPPORTED** | The article is an essay using an analytic model and illustrative inputs; it does not sample all published findings. |
| Increasing bias always decreases PPV under every parameter choice. | **QUALIFIED** | The paper explicitly gives an exception when `1-beta <= alpha` (PDF p. 2, “Bias”). |
| Reproducing the equations validates the assumptions and conclusion. | **UNSUPPORTED** | Numerical reproduction tests internal calculation consistency, not whether `R`, `u`, or the binary truth model describe a field. |

## Effect of the correction

- **SUPPORTED:** The correction repairs the parenthesization of one Table 2 cell.
- **SUPPORTED:** With the correction, the two cells in the “True Relationship =
  No” column sum to the published column total `c/(R+1)`.
- **QUALIFIED:** The prose PPV equation with bias already contains the intended
  combined numerator and therefore does not require a new formula.
- **SUPPORTED:** Figure 1 and Table 4 use that prose PPV equation; their numerical
  targets are unchanged by the typesetting correction.

## Audit conclusion

The companion is suitable after adding the correction explicitly. The executable
lesson should intentionally show the original printed expression as `UNMATCHED`
and the corrected expression as `MATCH`. This reproduces a calculation and checks
an internal identity; it does not endorse the model assumptions or headline.
