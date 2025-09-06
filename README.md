![InkSink](./public/banner.png)

# Inksink

InkSink is a kitchen sink for writing content. An AI assistant that gives you lots of handy tools to help you write content.

![InkSink](./public/screenshot.png)

## Getting Started

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Set up environment variables

   ```bash
   cp .env.example .env
   ```

3. Setup Sentry https://docs.sentry.io/platforms/javascript/guides/nextjs/

4. Setup PostHog https://posthog.com/docs/libraries/next-js

5. Run the development server:

   ```bash
   yarn dev
   ```

6. For the mastra development server:

   ```bash
   yarn mastra
   ```

## AI Assistant Workflow

```mermaid
---
config:
  theme: redux
  layout: dagre
---
flowchart TD
    n1["Moderation Agent"] --> n2["Orchestration Agent"]
    n2 --> n3["Research Agent"] & n4["Writer Agent"] & n5["Assistant Agent"]
    n5 --> n6["Previous Content + Style Preferences"]
    n4 --> n6
    n3 --> n8["Search Tool"]
    n1@{ shape: rect}
    n6@{ shape: cyl}
    style n1 stroke-width:1px,stroke-dasharray: 1
    style n6 stroke-width:2px,stroke-dasharray: 2
    style n8 stroke-width:1px,stroke-dasharray: 1
    linkStyle 0 stroke:#757575,fill:none
    linkStyle 1 stroke:#757575,fill:none
    linkStyle 2 stroke:#757575,fill:none
    linkStyle 3 stroke:#757575,fill:none
    linkStyle 4 stroke:#757575,fill:none
    linkStyle 5 stroke:#757575,fill:none
    linkStyle 6 stroke:#757575
```
