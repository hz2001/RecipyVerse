# Project Title: RecipeVerse - A Decentralized Culinary Community Platform

## Team Members:
Saiwang Xiang, Songhan Min, Jiasheng Qiu, Jiahe Zhang

---

## Abstract

RecipeVerse is a platform where users can freely share, discover, and exchange recipes, ensuring content originality, ownership, and long-term accessibility through blockchain technology. On this platform, individual users can mint and publish recipes as NFTs, forming a decentralized, user-driven global recipe knowledge base.

Additionally, the project aims to build an open and participatory platform where users benefit directly from their culinary contributions. We also designed an independent system for businesses, allowing restaurants to issue NFTs through dedicated smart contracts. These NFTs may represent diverse utilities such as coupons, memberships, and governance rights. Although these NFTs are not required to follow the recipe format, they can include recipe-related content for added context and interactivity. In this way, the platform supports the cultural dissemination of recipes for individual users and enables B2C marketing and community engagement for restaurants.

---

## Background

Most mainstream recipe-sharing platforms are centralized, lacking mechanisms for content attribution, persistence, and creator rewards. Recipes, as information-based assets, are difficult to authenticate, attribute, or incentivize. Blockchain offers a powerful solution—NFTs enable verifiable ownership, traceable distribution, and secure content storage.

We also identified a major pain point around digital coupons. Coupons often have expiration dates and go unused:
- Restaurants miss the intended traffic and promotional value.
- Users miss the chance to enjoy discounts.

Our decentralized coupon model allows users to freely trade and transfer unused NFT-based coupons, boosting redemption rates and engagement. These NFTs can be exchanged, gifted, or used for community voting, addressing the limitations of conventional coupons by enabling open utility markets.

### Related Projects and Tools
- [Zora – Creative NFT Market](https://zora.co/)
- [Mirror – Decentralized Publishing](https://mirror.xyz/)
- [Snapshot – DAO Voting Platform](https://snapshot.org/)
- [IPFS – Decentralized File Storage](https://docs.ipfs.tech/)

---

## Project Objectives

- Develop a platform that allows users to mint and showcase original recipes as NFTs.
- Design modular smart contracts for restaurants to issue utility NFTs (coupons, memberships, governance rights).
- Support the open circulation and exchange of NFTs for practical purposes like discounts or community input.
- Foster a community ecosystem driven by both creators and businesses within a Web3 culinary network.

---

## Methodology

- Implement ERC-721 and ERC-1155 standards for different NFT types.
- Build two contract systems: one for user recipe NFTs, and a second for restaurant-issued utility NFTs.
- Store off-chain media and content (e.g., text, images, videos) via IPFS.
- Use React + Web3.js to build a user interface supporting wallet connections and NFT interaction.
- Integrate off-chain governance voting using Snapshot-style mechanisms.
- Deploy and test on Ethereum Testnet or Polygon Mumbai.

---

## Scope and Deliverables

### ✅ In Scope:
- Recipe NFT creation and display interface for individual users.
- Smart contract templates for restaurant-issued NFTs.
- Simulated redemption and marketplace view of restaurant coupons.
- Frontend implementation including browsing, wallet connection, and governance interfaces.
- Technical documentation for contracts and system architecture.

### ❌ Out of Scope:
- Cross-chain NFT functionality.
- Integration with real-world POS or coupon verification systems.
- Legal validation or regulatory approval of NFT coupon models.

---

## Evaluation Criteria

### ✅ Success Indicators:
- At least 10 unique recipe NFTs and 5 restaurant-issued NFTs deployed.
- NFTs are browsable, claimable, and transferable with accurate metadata.
- Governance simulation functions based on NFT holder voting power.
- Full-stack prototype operates smoothly on a public testnet.

---

## Resources Required

- Ethereum Goerli or Polygon Mumbai testnet access.
- IPFS/Filecoin for decentralized storage.
- Development tools: Hardhat, MetaMask, React, Web3.js.
- Sample recipe content (text/images/videos).

---

## Potential Challenges and Mitigations

| Challenge | Mitigation Strategy |
|----------|---------------------|
| Utility vs. speculative NFT value | Design usage-based, time-sensitive NFT logic |
| User unfamiliarity with wallets | Provide simple onboarding guides and tutorials |
| Balancing restaurant control and community governance | Enforce clear governance rules, start with whitelisted issuers |
| Content quality assurance | Plan future community moderation and recipe rating systems |

---

## Ethics and Compliance

- Ensure clarity in NFT functionality and avoid misleading promises.
- Do not collect or store personal user data.
- Encourage proper attribution and protect intellectual contributions.
- Implement content moderation and reporting to prevent misuse.
