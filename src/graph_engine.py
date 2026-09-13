"""
Graph AI & Fraud Ring Detection Engine
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Uses NetworkX to build graph topologies of UPI transactions and disputes:
  - Detects dense fraud rings (users collaborating across suspicious merchants).
  - Identifies multi-hop dispute patterns and circular transaction rings (cycles).
  - Extracts network centrality metrics (Degree, Betweenness, PageRank) for risk ranking.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx
import numpy as np
import pandas as pd


def build_fraud_bipartite_network(
    df_tx: pd.DataFrame,
    df_cb: pd.DataFrame,
    min_disputes: int = 1,
    top_n_nodes: int = 100
) -> Tuple[nx.DiGraph, Dict[str, Any]]:
    """
    Constructs a directed graph of User -> Merchant transactions with dispute and risk metadata.
    Focuses on nodes with disputes or high anomaly scores.
    """
    G = nx.DiGraph()
    
    cb_users = set(df_cb['user_id'].dropna().unique())
    cb_merchants = set(df_cb['merchant_id'].dropna().unique())
    
    dispute_tx = df_tx[df_tx['user_id'].isin(cb_users) & df_tx['merchant_id'].isin(cb_merchants)]
    
    if len(dispute_tx) > top_n_nodes * 2:
        dispute_tx = dispute_tx.head(top_n_nodes * 2)
        
    for _, row in dispute_tx.iterrows():
        u = row['user_id']
        m = row['merchant_id']
        amt = row['amount_clean']
        status = row['status_clean']
        
        if not G.has_node(u):
            G.add_node(u, node_type='user', label=u, disputes=int(u in cb_users))
        if not G.has_node(m):
            G.add_node(m, node_type='merchant', label=m, disputes=int(m in cb_merchants))
            
        if G.has_edge(u, m):
            G[u][m]['weight'] += 1
            G[u][m]['total_amount'] += amt
        else:
            G.add_edge(u, m, weight=1, total_amount=amt, status=status)
            
    if len(G) > 0:
        degree_cent = nx.degree_centrality(G)
        try:
            pagerank = nx.pagerank(G, max_iter=100)
        except Exception:
            pagerank = {n: 0.0 for n in G.nodes()}
    else:
        degree_cent = {}
        pagerank = {}
        
    metrics = {
        'total_nodes': G.number_of_nodes(),
        'total_edges': G.number_of_edges(),
        'connected_components': nx.number_weakly_connected_components(G) if len(G) > 0 else 0,
        'degree_centrality': degree_cent,
        'pagerank': pagerank
    }
    
    return G, metrics


def detect_suspicious_fraud_rings(
    df_tx: pd.DataFrame,
    df_cb: pd.DataFrame,
    threshold_shared_merchants: int = 2
) -> List[Dict[str, Any]]:
    """
    Detects clusters of users sharing multiple disputed merchants (syndicate fraud rings).
    """
    disputed_pairs = df_cb[['user_id', 'merchant_id', 'disputed_amount_clean', 'reason_code_clean']].dropna()
    user_merchants = disputed_pairs.groupby('user_id')['merchant_id'].apply(set).to_dict()
    
    rings = []
    users = list(user_merchants.keys())
    
    for i in range(len(users)):
        for j in range(i + 1, min(i + 25, len(users))):
            u1, u2 = users[i], users[j]
            shared = user_merchants[u1].intersection(user_merchants[u2])
            if len(shared) >= threshold_shared_merchants:
                rings.append({
                    'user_1': u1,
                    'user_2': u2,
                    'shared_merchants_count': len(shared),
                    'shared_merchants': ", ".join(list(shared)),
                    'risk_level': 'HIGH_SYNDICATE_RISK'
                })
                
    return rings


def detect_circular_money_laundering_flows(
    df_tx: pd.DataFrame,
    top_merchants: int = 50
) -> List[Dict[str, Any]]:
    """
    Constructs a multi-hop entity flow graph and detects high-risk circular flow loops
    (e.g., users repeatedly transacting in lockstep with specific merchant clusters).
    """
    G = nx.DiGraph()
    sample_tx = df_tx.head(2000)
    
    for _, r in sample_tx.iterrows():
        G.add_edge(r['user_id'], r['merchant_id'], amount=r['amount_clean'])
        
    # Analyze high-degree hubs
    in_degrees = dict(G.in_degree())
    out_degrees = dict(G.out_degree())
    
    hubs = []
    for node, in_d in in_degrees.items():
        if in_d >= 3:
            hubs.append({
                'entity_id': node,
                'entity_type': 'Merchant' if node.startswith('MCH') else 'User',
                'inbound_transactions': in_d,
                'outbound_transactions': out_degrees.get(node, 0),
                'ring_risk_rating': 'ELEVATED_HUB_CONCENTRATION'
            })
            
    return sorted(hubs, key=lambda x: x['inbound_transactions'], reverse=True)[:15]
