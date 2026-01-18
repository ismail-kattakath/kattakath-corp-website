---
title: "Building on Google Cloud: Our AI Platform Roadmap"
meta_title: "AI Resume Builder GCP Roadmap"
description: "How we're using Google Cloud Platform services—Vertex AI, GKE, Firestore, and Identity Platform—to build the next generation of AI-powered career tools."
date: 2026-01-10T05:00:00Z
image: ""
categories: ["Product", "Cloud"]
author: "Ismail Kattakath"
tags: ["google-cloud", "vertex-ai", "gke", "roadmap", "ai"]
draft: false
---

AI Resume Builder v1.0 is a static site—all data lives in your browser, processed client-side. That's intentional. Privacy-first architecture means your resume never leaves your device.

But users are asking for features that require cloud infrastructure:
- **User accounts** with persistent storage
- **Cross-device sync** to access resumes anywhere
- **Team collaboration** for recruitment agencies
- **Enterprise API** for HR platform integrations

We're building these features on **Google Cloud Platform**. Here's why—and how.

## Why Google Cloud?

Three reasons:

1. **Vertex AI** offers the best integration for multi-agent AI workflows. Our roadmap includes specialized agents for resume writing, formatting optimization, and job matching. Vertex AI's agent building capabilities, combined with Gemini models, provide the foundation we need.

2. **Global infrastructure** matters for a career tool. Job seekers are everywhere. Cloud CDN and regional deployments ensure low latency regardless of location.

3. **Identity Platform** handles the complexity of enterprise authentication. SAML, OIDC, social login—all managed, so we can focus on product.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloud CDN                               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Cloud Load Balancing                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────────────┐                         ┌─────────────────┐
│  Cloud Run    │                         │      GKE        │
│  (API Layer)  │                         │  (AI Workloads) │
└───────────────┘                         └─────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       Firestore                              │
│              (User Data, Resume Documents)                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Vertex AI                               │
│        (Gemini, Custom Models, Agent Builder)                │
└─────────────────────────────────────────────────────────────┘
```

## Phase 2: Cloud-Native Platform (Q1 2026)

**In Progress**

### User Authentication
Google Identity Platform handles:
- OAuth 2.0 with Google, GitHub, LinkedIn
- Email/password authentication
- Enterprise SSO (SAML 2.0, OIDC)
- MFA and security policies

### Persistent Storage
Firestore provides:
- Real-time document database
- Offline support with automatic sync
- Granular security rules
- Automatic scaling

### Infrastructure
- **Cloud Run** for stateless API endpoints
- **GKE** reserved for AI inference workloads
- **Cloud Storage** for resume exports and backups
- **Cloud CDN** for global static asset delivery

## Phase 3: Multi-Agent AI Workflows (Q2 2026)

This is where it gets interesting.

### Specialized Agents

**Writing Agent**
Generates accomplishment statements with metrics. Takes raw experience descriptions and transforms them into impact-driven bullet points.

**Formatting Agent**
Optimizes layout for ATS parsing. Ensures consistent formatting, proper section ordering, and keyword density.

**Research Agent**
Analyzes job descriptions and company culture. Identifies key requirements, skills gaps, and customization opportunities.

**Review Agent**
Provides feedback and improvement suggestions. Catches inconsistencies, weak verbs, and missing context.

### Agentic Architecture on Vertex AI

Using Vertex AI Agent Builder:
- Multi-agent orchestration with defined workflows
- Human-in-the-loop approval for generated content
- Context-aware suggestions based on career history
- Long-term memory for personalized recommendations

### Google Cloud AI Services

| Capability | Service |
|------------|---------|
| LLM Generation | Gemini Pro / Gemini Ultra |
| Document Understanding | Document AI |
| Semantic Analysis | Natural Language API |
| Custom Models | Vertex AI Training |
| Agent Orchestration | Vertex AI Agent Builder |

## Phase 4: Enterprise & API (Q3 2026)

### B2B API Platform
- REST API for ATS and HR platform integration
- Webhook events for application tracking
- White-label deployment options
- Usage-based pricing tiers

### MediaPipe Integration
- AI-powered headshot enhancement
- Video resume recording
- Background removal
- Professional lighting correction

## Current Status

We're actively developing Phase 2. The infrastructure is provisioned, authentication is working in staging, and we're iterating on the Firestore data model.

The v1.0 static site continues to serve users who prioritize privacy—that won't change. The cloud platform adds capabilities for users who want persistence and collaboration.

## Join the Journey

- **Try the current version:** [ismail.kattakath.com/resume/builder](https://ismail.kattakath.com/resume/builder)
- **Watch our progress:** [github.com/ismail-kattakath/jsonresume-to-everything](https://github.com/ismail-kattakath/jsonresume-to-everything)
- **Enterprise early access:** [Contact us](/contact)

---

*Building AI products on GCP? I'd love to hear about your architecture. [Get in touch](/contact).*
