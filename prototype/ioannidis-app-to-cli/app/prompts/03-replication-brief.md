# Write the replication brief

Read the uploaded original paper, the newly generated `audit-report.md`, and the
two supplied independent-oracle files. Their CLI paths are
`reference/published_table4.csv` and `reference/figure1_checkpoints.json`.
Produce a code-free contract for a fresh CLI agent to reproduce Figure 1, all
nine Table 4 values, and the Table 2 correction check.

Include: source provenance; inputs and symbols; the equations exactly as audited;
independent reference values, including those exact CLI paths and SHA-256 hashes
computed from the two supplied files;
plot structure; numerical tolerances; acceptance tests; required `MATCH` or
`UNMATCHED` output for every check; and a statement that reproduction does not
endorse the model assumptions or headline claim. The implementation must not
generate its own oracle.
