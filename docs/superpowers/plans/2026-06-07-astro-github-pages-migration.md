# Astro + GitHub Pages Actions Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy Jekyll blog with a static Astro site deployed by GitHub Pages Actions while preserving the custom domain, old post URLs, privacy page, and `/assets/...` paths.

**Architecture:** Astro owns routing, layouts, RSS, sitemap, and content collections. Markdown posts are migrated into `src/content/posts`, assets are served from `public/assets`, and GitHub Pages deploys the generated `dist` output through Actions.

**Tech Stack:** Astro, TypeScript, npm, GitHub Pages Actions, static CSS.

---

## Tasks

- [x] Create a feature branch for the migration.
- [x] Add Astro project config, layouts, components, pages, and global styles.
- [x] Migrate Jekyll posts into Astro content collections with legacy URL slugs.
- [x] Move static assets and privacy page under `public/`.
- [x] Add GitHub Pages Actions workflow.
- [x] Remove or isolate old Jekyll runtime files.
- [x] Install dependencies and commit `package-lock.json`.
- [x] Run local check/build and preview HTTP validation.
- [x] Audit old URLs and remaining `http://image.tingxins.cn` references.
