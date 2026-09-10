# Traffic Risk Dashboard

An interactive dashboard that visualizes traffic accident **hotspot predictions**, **severity classifications**, and **SHAP-based explanations** for the Colombo Municipal Council (CMC) area, Sri Lanka. Built as the application layer for a BSc Honours dissertation on explainable, multi-source spatiotemporal machine learning for traffic accident hotspot prediction and severity classification.

This repo is **presentation-only** — it does not train models or run inference. It reads precomputed predictions and explanations from MongoDB and renders them as an interactive map and charts.

## Architecture

Model training happens in a separate repository ([`traffic-accident-research`](#)), which trains the classifiers and writes results to MongoDB. This repo reads from those same collections.

```
        traffic-accident-research (ML repo)
                     │
        train_hotspot_classifier.py
        train_severity_classifier.py
                     │
        export_results_to_mongo.py
                     ▼
              ┌─────────────┐
              │   MongoDB   │
              │ predictions │
              │  + SHAP     │
              └──────┬──────┘
                     │  REST API
                     ▼
         traffic-risk-dashboard (this repo)
          ┌─────────────────────────┐
          │   FastAPI backend       │
          │   (reads Mongo, no ML   │
          │    libraries needed)    │
          └───────────┬─────────────┘
                       │ JSON
                       ▼
          ┌─────────────────────────┐
          │   React + Vite frontend │
          │   Map · Charts · XAI    │
          └─────────────────────────┘
```

Retraining is a manual step on the research repo's side — this dashboard just reflects whatever is currently in MongoDB.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Dashboard UI |
| Map | Leaflet + React-Leaflet | Interactive H3 cell map |
| Styling | Tailwind CSS | Dashboard layout/UI |
| Charts | Recharts | Statistics/trend visualization |
| Backend | FastAPI (Python) | REST API |
| Database | MongoDB | Read-only access to prediction/results data |
| Spatial indexing | h3-py / h3-js | H3 cell handling |
| Explainability | Precomputed SHAP output | Local & global feature attributions |
| API communication | Fetch / Axios | React → FastAPI |

## Project Structure

```
traffic-risk-dashboard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── map/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database/
│   │   └── models/
│   ├── requirements.txt
│   └── .env
│
├── README.md
├── .gitignore
└── LICENSE
```

## MongoDB Collections Consumed

This dashboard reads from the following collections (written by the research repo's export step) — it never writes to them.

| Collection | Contents |
|---|---|
| `hotspot_predictions` | Per (`h3_cell`, `year_month`): binary hotspot prediction + probability, model name, split |
| `severity_predictions` | Per (`h3_cell`, `year_month`): predicted severity class + per-class probabilities |
| `shap_local` | Per-prediction top feature contributions (`task`, `base_value`, `top_features`) for both hotspot and severity |
| `model_runs` | Training run metadata — winner model, primary split, metrics report, feature list, trained-at timestamp |

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/hotspots?month=YYYY-MM` | Hotspot predictions for all cells in a given month |
| `GET /api/severity?month=YYYY-MM` | Severity predictions for all cells in a given month |
| `GET /api/cell/{h3_id}` | All predictions + history for a single H3 cell |
| `GET /api/explanation/{h3_id}?month=YYYY-MM&task=hotspot` | Local SHAP explanation for a cell/month/task |
| `GET /api/model-runs/{task}` | Latest model performance metrics for `hotspot` or `severity` |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A MongoDB URI with access to the same database the research repo writes to

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env       # fill in MONGO_URI and MONGO_DB
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (`backend/.env`)

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/
MONGO_DB=accident_hotspot
```

## Status

Part of an active BSc Honours dissertation project. Model training and XAI integration (research repo) are complete; this dashboard is in active development.

## Acknowledgements

Built as the application-layer component of a dissertation demonstrating separation between an ML/research layer (model development and evaluation) and an application layer (consuming model outputs through an operational spatial visualization interface).

## License

See [LICENSE](./LICENSE).
