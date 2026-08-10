# Power-Spectrum Multipole Covariance Notebook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and validate a Mathematica notebook that directly integrates Eq. (B.1) and prints `MATCH` or `UNMATCHED` against all six expressions in Eq. (B.2).

**Architecture:** A standalone Wolfram Language script is the verification gate and contains the exact symbolic calculation. A plain-text `Notebook[...]` artifact presents the same setup, direct integrals, Eq. (B.2) transcription, and labeled binary checks in short reviewable cells.

**Tech Stack:** Wolfram Language, Mathematica notebook expression format, `wolframscript`.

---

## File Map

- Create `paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls`: exact symbolic verifier.
- Create `paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb`: concise reviewer-facing notebook.
- Use `/Users/nguyenmn/llm_agent_skills_plugins/skills/paper-to-mathematica-nb/scripts/check_nb.wls`: existing notebook parser/evaluator; do not modify it.

### Task 1: Standalone symbolic verification gate

**Files:**
- Create: `paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls`

- [ ] **Step 1: Create the verifier**

```wl
#!/usr/bin/env wolframscript
ClearAll["Global`*"];

pg[mu_] := p0 + p2 LegendreP[2, mu] + p4 LegendreP[4, mu];
covReduced[ell1_, ell2_] := covReduced[ell1, ell2] =
  FullSimplify[(2 ell1 + 1) (2 ell2 + 1)/2 Integrate[
    LegendreP[ell1, mu] LegendreP[ell2, mu] pg[mu]^2,
    {mu, -1, 1}
  ]];

pairs = {{0, 0}, {0, 2}, {0, 4}, {2, 2}, {2, 4}, {4, 4}};
labels = {"00", "02", "04", "22", "24", "44"};

expected = <|
  "00" -> p0^2 + p2^2/5 + p4^2/9,
  "02" -> 2 p0 p2 + 2 p2^2/7 + 4 p2 p4/7 + 100 p4^2/693,
  "04" -> 18 p2^2/35 + 2 p0 p4 + 40 p2 p4/77 + 162 p4^2/1001,
  "22" -> 5 p0^2 + 20 p0 p2/7 + 20 p0 p4/7 + 15 p2^2/7 +
    120 p2 p4/77 + 8945 p4^2/9009,
  "24" -> 36 p0 p2/7 + 200 p0 p4/77 + 108 p2^2/77 +
    3578 p2 p4/1001 + 900 p4^2/1001,
  "44" -> 9 p0^2 + 360 p0 p2/77 + 2916 p0 p4/1001 +
    16101 p2^2/5005 + 3240 p2 p4/1001 + 42849 p4^2/17017
|>;

Do[
  Print["C^(" <> labels[[idx]] <> "): " <>
    If[TrueQ[FullSimplify[
      Apply[covReduced, pairs[[idx]]] == expected[labels[[idx]]]
    ]], "MATCH", "UNMATCHED"]],
  {idx, Length[pairs]}
];
```

- [ ] **Step 2: Run the mandatory verification gate**

Run:

```bash
wolframscript -file paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls
```

Expected:

```text
C^(00): MATCH
C^(02): MATCH
C^(04): MATCH
C^(22): MATCH
C^(24): MATCH
C^(44): MATCH
```

- [ ] **Step 3: Commit the verified script**

```bash
git add paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls
git commit -m "Verify power-spectrum multipole covariance"
```

### Task 2: Reviewer-facing Mathematica notebook

**Files:**
- Create: `paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb`

- [ ] **Step 1: Compose the notebook as a plain `Notebook[...]` expression**

Create title and source cells citing Chudaykin and Ivanov (2019), Eqs. (2.7)-(2.8) and (B.1)-(B.2). State only these conventions: `p0 = P0,g + 1/nbar_g`, retain multipoles 0, 2, and 4, and strip the common factor `2 delta_ij/Nk`.

Use raw-string Input cells containing the verifier's definitions in this order:

```wl
ClearAll["Global`*"];
pg[mu_] := p0 + p2 LegendreP[2, mu] + p4 LegendreP[4, mu];
pairs = {{0, 0}, {0, 2}, {0, 4}, {2, 2}, {2, 4}, {4, 4}};
labels = {"00", "02", "04", "22", "24", "44"};
```

```wl
covReduced[ell1_, ell2_] := covReduced[ell1, ell2] =
  FullSimplify[(2 ell1 + 1) (2 ell2 + 1)/2 Integrate[
    LegendreP[ell1, mu] LegendreP[ell2, mu] pg[mu]^2,
    {mu, -1, 1}
  ]];
derived = AssociationThread[labels, Apply[covReduced, #] & /@ pairs];
derived
```

```wl
expected = <|
  "00" -> p0^2 + p2^2/5 + p4^2/9,
  "02" -> 2 p0 p2 + 2 p2^2/7 + 4 p2 p4/7 + 100 p4^2/693,
  "04" -> 18 p2^2/35 + 2 p0 p4 + 40 p2 p4/77 + 162 p4^2/1001,
  "22" -> 5 p0^2 + 20 p0 p2/7 + 20 p0 p4/7 + 15 p2^2/7 +
    120 p2 p4/77 + 8945 p4^2/9009,
  "24" -> 36 p0 p2/7 + 200 p0 p4/77 + 108 p2^2/77 +
    3578 p2 p4/1001 + 900 p4^2/1001,
  "44" -> 9 p0^2 + 360 p0 p2/77 + 2916 p0 p4/1001 +
    16101 p2^2/5005 + 3240 p2 p4/1001 + 42849 p4^2/17017
|>;
expected
```

```wl
Do[
  Print["C^(" <> labels[[idx]] <> "): " <>
    If[TrueQ[FullSimplify[derived[labels[[idx]]] == expected[labels[[idx]]]]],
      "MATCH", "UNMATCHED"]],
  {idx, Length[labels]}
];
```

- [ ] **Step 2: Validate all notebook Input cells**

Run:

```bash
wolframscript -file /Users/nguyenmn/llm_agent_skills_plugins/skills/paper-to-mathematica-nb/scripts/check_nb.wls paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb
```

Expected: `Parsed OK`, four `OK: Input cell` lines, six `MATCH` lines, and `All Input cells evaluated cleanly`.

- [ ] **Step 3: Commit the validated notebook**

```bash
git add paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb
git commit -m "Add covariance cross-check notebook"
```

### Task 3: Final regression check

**Files:**
- Test: `paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls`
- Test: `paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb`

- [ ] **Step 1: Re-run both validators**

```bash
wolframscript -file paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls
wolframscript -file /Users/nguyenmn/llm_agent_skills_plugins/skills/paper-to-mathematica-nb/scripts/check_nb.wls paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb
```

Expected: both commands exit 0; the verifier and notebook each print six `MATCH` results and no `UNMATCHED` result.
