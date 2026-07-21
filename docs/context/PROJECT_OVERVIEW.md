# Project Overview

## What Cloud Novel Is
Cloud Novel is a modern, scalable web platform designed to allow users to read, write, and interact with novel content.

## Target Audience
- Readers looking for engaging stories and communities.
- Authors seeking a robust platform to publish and monetize their work.
- Administrators and moderators managing content and community standards.

## Core Philosophy
- **User-Centric:** The reader and author experience is paramount.
- **Reliability:** The platform must be stable, fast, and scalable.
- **Maintainability:** Code and documentation must be clean, modular, and well-tested.

## Major Features
- Reader interface with customizable settings.
- Author dashboard for content creation and analytics.
- Community interaction (comments, reviews, ratings).
- Content delivery and caching.

## Technology Stack
- **Frontend:** React 19, TypeScript, Vite
- **Backend:** None (Local-first architecture)
- **Database:** IndexedDB (via `idb` library)
- **Infrastructure:** Client-side web application
- **PDF Engine:** pdf.js (`pdfjs-dist`)

## Architecture Philosophy
- **Modularity:** Separation of concerns across frontend, backend, and data layers.
- **Scalability:** Designed to handle increasing loads through stateless services and caching.
- **Security-First:** Built-in protections against common web vulnerabilities.

## Product Principles
- Deliver value iteratively.
- Document all significant changes.
- Prioritize performance and accessibility.
