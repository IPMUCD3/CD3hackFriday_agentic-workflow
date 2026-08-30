# Independent audit report

## Publication-status check

**SUPPORTED.** PLOS records a 2022 correction under DOI
[`10.1371/journal.pmed.1004085`](https://doi.org/10.1371/journal.pmed.1004085).
It states that Table 2 omitted parentheses in the cell “Research Finding = Yes,
True Relationship = No.” The corrected cell is

`(c alpha + u c (1-alpha)) / (R+1)`.

The original typesetting can be read as

`c alpha + u c (1-alpha) / (R+1)`.

No retraction was listed on the [PLOS publication record](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124)
when checked on 2026-08-30.

## Claim audit

| ID | Verdict | Evidence and qualification |
|---|---|---|
| [C01] | **SUPPORTED** | PDF pp. 1-2 defines PPV from `R`, power, and `alpha`, then adds `u` in “Bias.” |
| [C02] | **SUPPORTED** | The base inequality on p. 1 and bias discussion on p. 2 show how these inputs can reduce PPV. |
| [C03] | **QUALIFIED** | This is a defensible interpretation, not a quoted result; the paper is an analytic essay with illustrative inputs. |
| [C04] | **SUPPORTED** | The base framework and Table 1 appear on PDF pp. 1-2. |
| [C05] | **SUPPORTED** | “Bias,” its PPV equation, and Table 2 appear on PDF p. 2. |
| [C06] | **SUPPORTED** | Figure 1 on PDF p. 3 has three power panels and four `u` curves. |
| [C07] | **SUPPORTED** | Corollaries 1-6 span PDF pp. 2-4; Table 4 is on p. 5. |
| [C08] | **SUPPORTED** | “How Can We Improve the Situation?” spans PDF pp. 5-6. |
| [C09] | **SUPPORTED** | PDF p. 1 defines `R` and the pre-study probability `R/(R+1)`. |
| [C10] | **SUPPORTED** | PDF p. 1 defines power as `1-beta`. |
| [C11] | **SUPPORTED** | PDF p. 1 defines `alpha` as the Type I error rate and discusses `0.05`. |
| [C12] | **SUPPORTED** | PDF p. 1 defines PPV as the post-study probability that a positive finding is true. |
| [C13] | **SUPPORTED** | PDF p. 2 defines `u` as the fraction made positive through bias. |
| [C14] | **SUPPORTED** | The displayed base PPV equation matches PDF p. 1. |
| [C15] | **SUPPORTED** | The displayed bias PPV equation matches the prose equation on PDF p. 2; the 2022 correction affects a Table 2 cell, not this equation. |
| [C16] | **SUPPORTED** | PDF p. 1 uses binary true/no relationships and a common-power simplification for circumscribed fields. |
| [C17] | **SUPPORTED** | PDF p. 2 explicitly assumes `u` does not depend on whether a true relationship exists. |
| [C18] | **QUALIFIED** | The paper treats `R` and `u` as model inputs and uses illustrative settings; it does not estimate universal values. |
| [C19] | **SUPPORTED** | Corollaries 1-6 on PDF pp. 2-4 make these conditional model claims. |
| [C20] | **SUPPORTED** | In Figure 1, all plotted powers exceed `alpha=0.05`, so PPV decreases as `u` rises; p. 2 notes the exception outside that plotted regime. |
| [C21] | **SUPPORTED** | PDF p. 5, Table 4 and its footnote give nine PPVs using `alpha=0.05`, from `0.85` to `0.0010`. |
| [C22] | **SUPPORTED** | The calculations establish conditional sensitivity; they do not measure the real-world inputs, so the stated separation is warranted. |
| [C23] | **SUPPORTED** | The 2022 correction changes the readable Table 2 identity, showing why checking the DOI record before implementation matters. |
| [C24] | **SUPPORTED** | Figure 1 and all nine Table 4 entries are precise, independently transcribable reproduction targets. |
| [C25] | **SUPPORTED** | Calculation agreement tests arithmetic consistency only, not whether the assumptions or headline apply to a field. |

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
