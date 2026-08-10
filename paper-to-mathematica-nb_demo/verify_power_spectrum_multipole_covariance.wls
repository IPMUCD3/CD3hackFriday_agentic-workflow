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

matches = Table[
  TrueQ[FullSimplify[
    Apply[covReduced, pairs[[idx]]] == expected[labels[[idx]]]
  ]],
  {idx, Length[pairs]}
];

Do[
  Print["C^(" <> labels[[idx]] <> "): " <>
    If[matches[[idx]], "MATCH", "UNMATCHED"]],
  {idx, Length[pairs]}
];

If[! And @@ matches, Exit[1]];
