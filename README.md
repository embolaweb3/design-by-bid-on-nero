# 🛠️ DesignByBid

**DesignByBid** is a decentralized, gasless platform built on the **Nero chain** that connects project owners with design contractors. It enables seamless project posting, transparent bidding, milestone-based payments, and trustless dispute resolution — all without requiring users to hold native tokens for gas.

---

## 🌐 Live Deployment [app-url](https://design-by-bid-on-nero.vercel.app/)

    

---

## ⚙️ Features

### ✅ Project Posting  
Project owners can post detailed design projects, including:
- Title, description
- Budget
- Deadlines
- Milestone payment breakdowns

### 🤝 Bid Submission  
Contractors can:
- Submit bids with proposed costs and timelines
- Compete transparently with other designers

### 🏆 Bid Selection  
Project owners can:
- Select a winning bid based on their criteria
- Trigger the project execution phase

### 💸 Milestone Payments  
- Payments are tied to predefined milestones
- Released only when work is submitted and verified

### ⚖️ Dispute Resolution  
- Disputes can be raised by either party
- Resolved through on-chain voting by neutral stakeholders

---

## 🔓 Gasless Architecture

DesignByBid is **fully gasless** for end-users thanks to **Account Abstraction (AA)** and **Nero Paymaster integration**.

### 🧠 Paymaster Strategy

| Type | Description | Usage |
|------|-------------|-------|
| 0 | Developer-sponsored gas | First-time actions (project posting, dispute resolution) |
| 1 | ERC20 prepay gas | Regular actions (bids, payments) via stablecoins |

---

## 🧱 Tech Stack

- **Chain**: [Nero Chain](https://nerochain.io)
- **Smart Contracts**: Solidity (Verified + Deployed)
- **Frontend**: Next.js 
- **Wallets**: AA Smart Accounts (ERC-4337 compatible)
- **Paymaster**: Nero Paymaster API (Type 0 & Type 1)
- **Testing**: Hardhat / Ethers

---


