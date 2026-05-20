"""Claim ↔ source verification via NLI + semantic similarity.

No random scores. Confidence is derived from the strength of the best
supporting/refuting source evidence."""
from __future__ import annotations

from typing import List

import numpy as np

from app.schemas.models import Claim, Source
from app.services.embeddings import cosine_matrix, embed_texts


def _nli_score(nli, premise: str, hypothesis: str) -> dict[str, float]:
    """Return {entailment, neutral, contradiction} probabilities."""
    raw = nli(f"{premise} [SEP] {hypothesis}", truncation=True)
    items = raw[0] if isinstance(raw[0], list) else raw
    out = {"entailment": 0.0, "neutral": 0.0, "contradiction": 0.0}
    for it in items:
        label = it["label"].lower()
        for k in out:
            if k in label:
                out[k] = float(it["score"])
    return out


async def verify_claims(
    embedder, nli, claims: List[str], sources: List[Source], max_per_claim: int = 4
) -> List[Claim]:
    if not claims:
        return []
    if not sources:
        return [
            Claim(text=c, verdict="insufficient_evidence", confidence=0.0, evidence=[])
            for c in claims
        ]

    source_texts = [f"{s.title}. {s.snippet}".strip() for s in sources]
    claim_vecs = await embed_texts(embedder, claims)
    src_vecs = await embed_texts(embedder, source_texts)
    sim = cosine_matrix(claim_vecs, src_vecs)  # (claims, sources)

    results: list[Claim] = []
    for i, claim in enumerate(claims):
        scored_idx = np.argsort(-sim[i])[: max_per_claim * 2]
        evidence: list[Source] = []
        ent_scores: list[float] = []
        con_scores: list[float] = []
        for j in scored_idx:
            score = float(sim[i][j])
            if score < 0.25:
                continue
            src = sources[int(j)].model_copy(update={"similarity": round(score, 4)})
            nli_out = _nli_score(nli, source_texts[int(j)][:1000], claim[:500])
            ent_scores.append(nli_out["entailment"] * score)
            con_scores.append(nli_out["contradiction"] * score)
            evidence.append(src)
            if len(evidence) >= max_per_claim:
                break

        if not evidence:
            results.append(Claim(text=claim, verdict="insufficient_evidence", confidence=0.0, evidence=[]))
            continue

        ent = max(ent_scores) if ent_scores else 0.0
        con = max(con_scores) if con_scores else 0.0
        if ent >= 0.55 and ent > con + 0.1:
            verdict = "supported"
            confidence = ent
        elif con >= 0.55 and con > ent + 0.1:
            verdict = "refuted"
            confidence = con
        else:
            verdict = "unverified"
            confidence = max(ent, con)

        results.append(Claim(
            text=claim, verdict=verdict,
            confidence=round(float(confidence), 4),
            evidence=evidence,
        ))
    return results


def overall_risk(claims: List[Claim]) -> float:
    if not claims:
        return 0.0
    weights = {"refuted": 1.0, "unverified": 0.5, "insufficient_evidence": 0.4, "supported": 0.0}
    total = sum(weights[c.verdict] * max(0.2, c.confidence or 0.2) for c in claims)
    return round(min(1.0, total / max(1, len(claims))), 4)


def aggregate_credibility(sources: List[Source]) -> float:
    if not sources:
        return 0.0
    # weight by similarity if present, otherwise uniform
    weights = [max(0.1, s.similarity or 0.2) for s in sources]
    weighted = sum(s.credibility * w for s, w in zip(sources, weights))
    return round(weighted / sum(weights), 4)
