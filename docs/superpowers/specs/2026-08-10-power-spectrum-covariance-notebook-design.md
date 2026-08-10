# Power-Spectrum Multipole Covariance Notebook

## Scope

Create a Mathematica notebook and standalone Wolfram Language verifier for Eqs. (B.1)-(B.2) of Chudaykin and Ivanov (2019), using the multipole expansion in Eqs. (2.7)-(2.8).

## Convention

Use the shifted monopole implicit in Eq. (B.2):

`P0 = P0,g + 1/nbar_g`.

Thus the integrand spectrum is `P0 + P2 LegendreP[2, mu] + P4 LegendreP[4, mu]`.

## Derivation and Output

- Evaluate Eq. (B.1) directly with `Integrate` for `(00)`, `(02)`, `(04)`, `(22)`, `(24)`, and `(44)`.
- Transcribe the corresponding six expressions from Eq. (B.2).
- Compare each integrated result with its transcription using exact symbolic simplification.
- Print only `MATCH` or `UNMATCHED` for each labeled covariance entry.
- Keep notebook comments concise.

## Validation

The standalone verifier must report six `MATCH` results. The final notebook must parse and evaluate without Wolfram Language messages under the skill validator.
