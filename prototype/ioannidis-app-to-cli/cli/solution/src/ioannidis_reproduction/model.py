"""Equations used in the Ioannidis (2005) reproduction."""


def ppv_with_bias(
    power: float, odds: float, bias: float, alpha: float = 0.05
) -> float:
    """Return the paper's positive predictive value in the presence of bias."""
    if not 0.0 <= power <= 1.0:
        raise ValueError("power must be between 0 and 1")
    if odds < 0.0:
        raise ValueError("odds must be non-negative")
    if not 0.0 <= bias <= 1.0:
        raise ValueError("bias must be between 0 and 1")
    if not 0.0 <= alpha <= 1.0:
        raise ValueError("alpha must be between 0 and 1")

    beta = 1.0 - power
    numerator = power * odds + bias * beta * odds
    denominator = (
        odds
        + alpha
        - beta * odds
        + bias
        - bias * alpha
        + bias * beta * odds
    )
    if denominator == 0.0:
        raise ValueError("PPV denominator is zero")
    return numerator / denominator
