# ETL Designer UI

<p align="center">
  <img src="./ETL_Designer.png" alt="ETL Designer UI" width="1000" />
</p>

A modern UI for designing ETL workflows visually and generating PySpark code with AI-assisted support.

<p align="center">
  <a href="https://github.com/niroshan009/etl-designer-ui">GitHub</a>
  ·
  <a href="https://github.com/niroshan009/etl-designer">Backend / engine</a>
</p>

## Overview

`etl-designer-ui` lets you design ETL pipelines through a visual interface, then generate executable PySpark code. It is designed to streamline ETL authoring by combining workflow design, transformation logic, and AI-assisted code generation.

This project depends on the backend engine in [etl-designer](https://github.com/niroshan009/etl-designer).

## Features

- Visual ETL pipeline design
- Drag-and-drop workflow composition
- PySpark code generation
- AI-assisted transformation support
- Local and Kubernetes-friendly deployment options

## Architecture

Below is the system architecture for the ETL Designer platform.

![Architecture Diagram](./ETL_designer_compoenent_diagram.png)

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Optional: a local Kubernetes environment such as OrbStack k8s or Minikube
- Optional: Ollama with a model such as `qwen2.5-coder:7b`

### Install dependencies

```sh
npm install
```

### Run locally

```sh
npm run dev
```

The UI will typically run on the Vite development server and can be opened in your browser.

## Local Kubernetes deployment

The deployment manifests are configured for `OrbStack` and work with `qwen2.5-coder:7b`.

Before deploying, ensure the following are available:

1. `docker-compose.yaml` starts the required object storage / bucket services.
2. A local Kubernetes environment is available (OrbStack k8s or Minikube).
3. Ollama is installed and a model is running.
4. A Kubernetes namespace named `spark` exists.
5. A service account named `spark-sa` has the required permissions to submit Spark jobs.

### Deploy backend

```sh
kubectl apply -f deployment-backend.yaml
```

### Deploy frontend

```sh
kubectl apply -f deployment-ui.yaml
```

## Project flow

1. Design your ETL workflow in the UI.
2. Connect components and define transformation steps.
3. Generate the downstream PySpark code.
4. Run or integrate the generated workflow with the backend runtime.

## Related repository

- [etl-designer](https://github.com/niroshan009/etl-designer) — backend and workflow engine


