"""Numerical curves and rendering for Ioannidis (2005), Figure 1."""

from collections.abc import Iterable
from pathlib import Path

import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from .model import ppv_with_bias


POWERS = (0.8, 0.5, 0.2)
BIASES = (0.05, 0.2, 0.5, 0.8)


def figure1_values(power: float, bias: float, odds: Iterable[float]) -> np.ndarray:
    """Evaluate one Figure 1 curve at the supplied pre-study odds."""
    return np.array([ppv_with_bias(power, value, bias) for value in odds])


def save_figure1(output: Path) -> None:
    """Render the scientific content of the paper's three-panel Figure 1."""
    output.parent.mkdir(parents=True, exist_ok=True)
    odds = np.linspace(0.0, 1.0, 201)
    colors = ("#2563eb", "#dc2626", "#4d7c0f", "#ea580c")
    figure, axes = plt.subplots(3, 1, figsize=(6.2, 10.0), sharex=True, sharey=True)
    for panel, (axis, power) in enumerate(zip(axes, POWERS, strict=True)):
        for bias, color in zip(BIASES, colors, strict=True):
            axis.plot(
                odds,
                100.0 * figure1_values(power, bias, odds),
                color=color,
                label=f"u={bias:.2f}",
            )
        axis.set_ylim(0.0, 100.0)
        axis.set_ylabel("Post-study probability, PPV (%)")
        axis.set_title(f"{chr(65 + panel)}   power = {power:.0%}", loc="left")
        axis.grid(alpha=0.2)
    axes[-1].set_xlabel("Pre-study odds, R")
    axes[0].legend(ncol=2, frameon=False)
    figure.suptitle("Reproduction of Ioannidis (2005), Figure 1")
    figure.tight_layout()
    figure.savefig(output, dpi=180)
    plt.close(figure)
