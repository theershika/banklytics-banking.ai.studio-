"""
Analytics Service using Pandas, NumPy, and Matplotlib
Computes financial ledger summaries, frequency statistics, Smart Insights, and Matplotlib chart images.
"""

import io
from decimal import Decimal
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server generation
import matplotlib.pyplot as plt

from app.models import Transaction, Account


def calculate_account_analytics(account_number: str) -> dict:
    """
    Computes rigorous analytical metrics using Pandas and NumPy over account ledger.
    """
    account = Account.query.filter_by(account_number=account_number).first()
    if not account:
        return {}

    transactions = (
        Transaction.query.filter_by(account_id=account.account_id)
        .order_by(Transaction.transaction_date.asc())
        .all()
    )

    if not transactions:
        return {
            "total_deposits": Decimal("0.00"),
            "total_withdrawals": Decimal("0.00"),
            "net_balance_change": Decimal("0.00"),
            "transaction_count": 0,
            "deposit_count": 0,
            "withdrawal_count": 0,
            "average_transaction": Decimal("0.00"),
            "highest_deposit": Decimal("0.00"),
            "highest_withdrawal": Decimal("0.00"),
            "monthly_trends": []
        }

    records = [{
        "transaction_id": t.transaction_id,
        "date": t.transaction_date,
        "type": t.transaction_type,
        "amount": float(t.amount),
        "balance_after": float(t.balance_after)
    } for t in transactions]

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df["month_year"] = df["date"].dt.to_period("M").astype(str)

    deposits_df = df[df["type"] == "DEPOSIT"]
    withdrawals_df = df[df["type"] == "WITHDRAWAL"]

    total_deposits = float(deposits_df["amount"].sum()) if not deposits_df.empty else 0.0
    total_withdrawals = float(withdrawals_df["amount"].sum()) if not withdrawals_df.empty else 0.0
    net_flow = total_deposits - total_withdrawals

    avg_txn = float(df["amount"].mean()) if not df.empty else 0.0
    med_txn = float(df["amount"].median()) if not df.empty else 0.0
    std_txn = float(df["amount"].std()) if len(df) > 1 else 0.0
    q75, q25 = np.percentile(df["amount"], [75, 25]) if not df.empty else (0.0, 0.0)
    iqr_val = float(q75 - q25)
    highest_dep = float(deposits_df["amount"].max()) if not deposits_df.empty else 0.0
    highest_with = float(withdrawals_df["amount"].max()) if not withdrawals_df.empty else 0.0

    monthly_groups = []
    unique_months = df["month_year"].unique()
    for m in sorted(unique_months):
        m_df = df[df["month_year"] == m]
        m_dep = float(m_df[m_df["type"] == "DEPOSIT"]["amount"].sum()) if not m_df[m_df["type"] == "DEPOSIT"].empty else 0.0
        m_with = float(m_df[m_df["type"] == "WITHDRAWAL"]["amount"].sum()) if not m_df[m_df["type"] == "WITHDRAWAL"].empty else 0.0
        closing = float(m_df.iloc[-1]["balance_after"])
        monthly_groups.append({
            "month": m,
            "deposits": round(m_dep, 2),
            "withdrawals": round(m_with, 2),
            "net_flow": round(m_dep - m_with, 2),
            "closing_balance": round(closing, 2)
        })

    return {
        "total_deposits": Decimal(str(round(total_deposits, 2))),
        "total_withdrawals": Decimal(str(round(total_withdrawals, 2))),
        "net_balance_change": Decimal(str(round(net_flow, 2))),
        "transaction_count": len(df),
        "deposit_count": len(deposits_df),
        "withdrawal_count": len(withdrawals_df),
        "average_transaction": Decimal(str(round(avg_txn, 2))),
        "median_transaction": Decimal(str(round(med_txn, 2))),
        "std_deviation": Decimal(str(round(std_txn, 2))),
        "iqr_spread": Decimal(str(round(iqr_val, 2))),
        "highest_deposit": Decimal(str(round(highest_dep, 2))),
        "highest_withdrawal": Decimal(str(round(highest_with, 2))),
        "monthly_trends": monthly_groups
    }


def generate_smart_insights(account_number: str) -> dict:
    """
    Generates descriptive financial insights using Pandas and NumPy time-series differences.
    """
    stats = calculate_account_analytics(account_number)
    trends = stats.get("monthly_trends", [])

    tot_dep = float(stats["total_deposits"])
    tot_with = float(stats["total_withdrawals"])
    net_flow = float(stats["net_balance_change"])

    spending_velocity = round(tot_with / 30.0, 2)
    deposit_velocity = round(tot_dep / 30.0, 2)
    savings_rate = round((net_flow / tot_dep * 100.0), 1) if tot_dep > 0 else 0.0
    cash_flow_health = "SURPLUS" if net_flow > 0 else ("DEFICIT" if net_flow < 0 else "NEUTRAL")

    # Day of week and category findings
    account = Account.query.filter_by(account_number=account_number).first()
    transactions = Transaction.query.filter_by(account_id=account.account_id).all() if account else []
    
    peak_spending_day = "Saturday"
    top_outflow_category = "General Utilities"
    top_inflow_source = "Direct Deposit"

    if transactions:
        df = pd.DataFrame([{
            "type": t.transaction_type,
            "amount": float(t.amount),
            "desc": t.description or "",
            "day": t.transaction_date.strftime("%A")
        } for t in transactions])
        with_df = df[df["type"] == "WITHDRAWAL"]
        dep_df = df[df["type"] == "DEPOSIT"]
        if not with_df.empty:
            peak_spending_day = str(with_df.groupby("day")["amount"].sum().idxmax())
            top_outflow_category = str(with_df["desc"].mode().iloc[0]) if not with_df["desc"].empty else "General Debit"
        if not dep_df.empty:
            top_inflow_source = str(dep_df["desc"].mode().iloc[0]) if not dep_df["desc"].empty else "Direct Credit"

    insights = []
    deposit_change = None
    withdrawal_change = None
    highest_month = None

    if len(trends) >= 2:
        curr = trends[-1]
        prev = trends[-2]

        dep_diff = curr["deposits"] - prev["deposits"]
        dep_pct = (dep_diff / prev["deposits"] * 100) if prev["deposits"] > 0 else 100.0
        deposit_change = {
            "diff_amount": abs(round(dep_diff, 2)),
            "diff_pct": abs(round(dep_pct, 1)),
            "increased": dep_diff >= 0,
            "text": f"Deposits {'increased' if dep_diff >= 0 else 'decreased'} by {abs(round(dep_pct, 1))}% compared with {prev['month']}."
        }
        insights.append({
            "title": "Inflow Momentum",
            "description": deposit_change["text"],
            "type": "positive" if dep_diff >= 0 else "neutral"
        })

        with_diff = curr["withdrawals"] - prev["withdrawals"]
        with_pct = (with_diff / prev["withdrawals"] * 100) if prev["withdrawals"] > 0 else (100.0 if with_diff > 0 else 0.0)
        withdrawal_change = {
            "diff_amount": abs(round(with_diff, 2)),
            "diff_pct": abs(round(with_pct, 1)),
            "increased": with_diff > 0,
            "text": f"Outflows {'increased' if with_diff > 0 else 'decreased'} by {abs(round(with_pct, 1))}% compared with {prev['month']}."
        }
        insights.append({
            "title": "Expense Pattern",
            "description": withdrawal_change["text"],
            "type": "warning" if with_diff > 0 else "positive"
        })

    if trends:
        max_m = max(trends, key=lambda m: m["deposits"] + m["withdrawals"])
        vol = max_m["deposits"] + max_m["withdrawals"]
        highest_month = {
            "month": max_m["month"],
            "volume": vol
        }
        insights.append({
            "title": "Peak Activity Period",
            "description": f"{max_m['month']} registered the highest cumulative financial throughput of ₹{vol:,.2f}.",
            "type": "neutral"
        })

    if stats["transaction_count"] > 0:
        insights.append({
            "title": "Average Ticket Size",
            "description": f"Across {stats['transaction_count']} ledger transactions, the mean operation size is ₹{stats['average_transaction']:,.2f}.",
            "type": "neutral"
        })

    recommendations = [
        {
            "title": "Maintain Inflow Reserve",
            "description": f"Target maintaining at least ₹{round(spending_velocity * 15, 2):,.2f} (15 days of burn) as a liquid safety buffer."
        },
        {
            "title": "Optimized Savings Allocation",
            "description": f"Your current net retention rate is {savings_rate}%. Retaining above 20% indicates healthy financial sustainability."
        }
    ]

    return {
        "spending_velocity": spending_velocity,
        "deposit_velocity": deposit_velocity,
        "savings_rate": savings_rate,
        "cash_flow_health": cash_flow_health,
        "peak_spending_day": peak_spending_day,
        "top_outflow_category": top_outflow_category,
        "top_inflow_source": top_inflow_source,
        "recommendations": recommendations,
        "deposit_change": deposit_change,
        "withdrawal_change": withdrawal_change,
        "highest_month": highest_month,
        "insights_list": insights
    }


def generate_matplotlib_chart_image(account_number: str) -> io.BytesIO:
    """
    Renders a multi-panel Matplotlib figure representing monthly trends and returns BytesIO buffer.
    """
    stats = calculate_account_analytics(account_number)
    monthly_trends = stats.get("monthly_trends", [])

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    fig.patch.set_facecolor("#0F172A")

    for ax in (ax1, ax2):
        ax.set_facecolor("#1E293B")
        ax.tick_params(colors="#94A3B8")
        ax.xaxis.label.set_color("#CBD5E1")
        ax.yaxis.label.set_color("#CBD5E1")
        ax.title.set_color("#FFFFFF")
        for spine in ax.spines.values():
            spine.set_color("#334155")

    if monthly_trends:
        months = [m["month"] for m in monthly_trends]
        deposits = [m["deposits"] for m in monthly_trends]
        withdrawals = [m["withdrawals"] for m in monthly_trends]

        x = np.arange(len(months))
        width = 0.35

        ax1.bar(x - width/2, deposits, width, label="Inflows", color="#10B981")
        ax1.bar(x + width/2, withdrawals, width, label="Outflows", color="#F43F5E")
        ax1.set_title("Banklytics: Monthly Deposits vs Withdrawals", fontsize=12, fontweight="bold")
        ax1.set_xticks(x)
        ax1.set_xticklabels(months, rotation=30)
        ax1.legend(facecolor="#0F172A", edgecolor="#334155", labelcolor="#E2E8F0")

        net_flows = [m["net_flow"] for m in monthly_trends]
        colors = ["#06B6D4" if v >= 0 else "#EF4444" for v in net_flows]
        ax2.bar(months, net_flows, color=colors)
        ax2.axhline(0, color="#64748B", linestyle="--", linewidth=1)
        ax2.set_title("Banklytics: Monthly Net Cash Flow", fontsize=12, fontweight="bold")
        ax2.set_xticklabels(months, rotation=30)
    else:
        ax1.text(0.5, 0.5, "No Transaction History", ha="center", va="center", color="#94A3B8")
        ax2.text(0.5, 0.5, "No Transaction History", ha="center", va="center", color="#94A3B8")

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, facecolor=fig.get_facecolor(), edgecolor="none")
    buf.seek(0)
    plt.close(fig)
    return buf
