# Paper companion: *Why Most Published Research Findings Are False*

Personalization: researcher outside biomedicine; goal is to understand how
assumptions affect the reliability of published claims; background includes basic
hypothesis testing but not Bayesian statistics.

## 90-second explanation

[C01][PAPER] The paper asks a conditional question: after a study reports a
statistically significant relationship, how likely is that relationship to be
true? Its answer is the positive predictive value (PPV). PPV depends on the
pre-study odds that tested relationships are real, statistical power, the false
positive rate, and—in extensions of the model—bias and repeated testing by
multiple teams (PDF pp. 1-3, “Modeling the Framework,” Tables 1-3).

[C02][PAPER] Low prior odds, low power, and greater bias can make a nominally
significant finding more likely false than true within this model. Table 4 applies
the model to nine illustrative research settings (PDF p. 5, Table 4).

[C03][INFERENCE] The headline is best read as a warning about the joint effect of
assumptions, study design, and selection—not as an empirical count of every
published result.

[OPEN QUESTION] How well do the chosen pre-study odds and the single bias
parameter represent the participant's own field?

## Reading map

- [C04][PAPER] **First understand the base model:** PDF p. 1, “Modeling the Framework
  for False Positive Findings,” then Table 1 on p. 2.
- [C05][PAPER] **Then inspect the bias extension:** PDF p. 2, “Bias,” the PPV equation,
  and Table 2.
- [C06][PAPER] **See the sensitivity visually:** PDF p. 3, Figure 1. Compare the three
  power panels and four values of bias, `u`.
- [C07][PAPER] **Connect the model to research practice:** PDF pp. 3-5, the six
  corollaries and Table 4.
- [C08][PAPER] **Finish with remedies and limitations implicit in the discussion:**
  PDF pp. 5-6, “How Can We Improve the Situation?”

## Plain-language glossary

- [C09][PAPER] **Pre-study odds, R:** expected true relationships divided by expected
  non-true relationships among those tested; the corresponding probability is
  `R/(R+1)` (PDF p. 1, model definition).
- [C10][PAPER] **Power, 1-beta:** probability of detecting a relationship when it is
  real (PDF p. 1, model definition).
- [C11][PAPER] **Alpha:** probability of declaring a relationship when none exists;
  the paper usually takes `alpha = 0.05` (PDF pp. 1-2, Table 1 discussion).
- [C12][PAPER] **PPV:** probability that a reported positive finding is true within the
  model (PDF p. 1, equation after Table 1).
- [C13][PAPER] **Bias, u:** fraction of otherwise negative analyses presented as
  positive because of design, analysis, or reporting choices (PDF p. 2, “Bias”).

## Mathematical model and assumptions

[C14][PAPER] Without the bias extension,

`PPV = (1-beta) R / (R - beta R + alpha)`

(PDF p. 1, displayed equation beside the Table 1 discussion).

[C15][PAPER] With bias,

`PPV = ([1-beta]R + u beta R) / (R + alpha - beta R + u - u alpha + u beta R)`

(PDF p. 2, “Bias,” equation following Table 2).

- [C16][PAPER] The model treats hypotheses as true or false and assumes a common power
  for the relationships considered in a circumscribed field (PDF p. 1).
- [C17][PAPER] The bias parameter is assumed not to depend on whether a relationship is
  actually true (PDF p. 2, “Bias”).
- [C18][INFERENCE] `R` and `u` are modeling inputs, not quantities the paper estimates
  for science as a whole.
- [OPEN QUESTION] Would a continuous effect-size model or heterogeneous powers
  materially alter the conclusions for a given domain?

## Main claims and evidence

- [C19][PAPER] Smaller studies, smaller effects, less selective hypothesis searches,
  more analytical flexibility, stronger interests, and more competing teams can
  lower PPV in the proposed framework (PDF pp. 2-4, Corollaries 1-6).
- [C20][PAPER] Figure 1 shows PPV decreasing as `u` increases at fixed power and
  pre-study odds (PDF p. 3, Figure 1).
- [C21][PAPER] Table 4 reports nine PPVs obtained from the model at `alpha = 0.05`,
  ranging from `0.85` to `0.0010` for the selected examples (PDF p. 5, Table 4).
- [C22][INFERENCE] These calculations demonstrate sensitivity to assumptions; they do
  not independently establish the real-world values of `R` or `u`.

## Questions worth asking

- [OPEN QUESTION] Which inputs are empirically measurable, and which require
  expert judgment?
- [OPEN QUESTION] Does “a published finding” mean a hypothesis test, an effect
  estimate, or an entire paper in the intended application?
- [OPEN QUESTION] How sensitive are the headline conclusions to alternative
  models of publication and analytical selection?
- [OPEN QUESTION] Does the paper's current publication record contain corrections
  that affect any equation or table?

## Suggested next steps

1. [C23][INFERENCE] Audit the paper's DOI for corrections before implementing its
   equations.
2. [C24][INFERENCE] Reproduce Figure 1 and all Table 4 values from an independently
   transcribed oracle.
3. [C25][INFERENCE] Report calculation agreement separately from agreement with the
   assumptions or headline claim.
