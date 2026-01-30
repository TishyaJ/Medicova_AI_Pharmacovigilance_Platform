# Medicova: AI/ML Implementation Strategy

This document outlines the strategic implementation of Artificial Intelligence and Machine Learning models within the Medicova platform. Our goal is to transform from a reactive reporting tool into a proactive, intelligent pharmacovigilance ecosystem that is scalable, accessible, and life-saving.

---

## 🧠 Core AI Pillars (The Notebook Series)

We will implement the core intelligence through four specialized modules, each developed as a standalone pipeline for modularity and scalability.

### 1. Risk Triage Engine (The Core Brain)
**File**: `01_Risk_Triage_Engine.ipynb`  
**Primary Models**: BioBERT (`dmis-lab/biobert-v1.1`), ScispaCy (`en_core_sci_md`), XGBoost.

#### **Why?**
Manual triage is the biggest bottleneck in pharmacovigilance. A patient reporting "breathing trouble" must be prioritized instantly over someone reporting "mild nausea." Using a combination of medical-grade NLP and tabular data ensures we don't just understand the words, but the *context* of the patient's health.

#### **How?**
- **Layer 1 (Embeddings)**: Convert free-text input into high-dimensional vectors using **BioBERT**, which is pre-trained on millions of PubMed articles and understands clinical nuances that standard GPT models might miss.
- **Layer 2 (NER)**: Use **ScispaCy** to extract medical entities (Medicine Names, Symptoms, Dosage) to structure the unstructured text.
- **Layer 3 (Classification)**: Feed the BioBERT embeddings + structured features (Age, Gender, History) into an **XGBoost** model.
  - *Why XGBoost?* It excels at handling mixed data types (text vectors + categorical age/history) and provides higher accuracy for small-to-medium datasets compared to deep neural networks.
- **Integration**: Triggered via the `casesAPI` on every message. Outputs a Risk Level (1-5) and stores structured symptoms in the `Message` table.

---

### 2. Vision Evidence Analyzer (The Eyes)
**File**: `02_Vision_Evidence_Analyzer.ipynb`  
**Primary Models**: ResNet-50 (Fine-tuned), PaddleOCR or Tesseract.

#### **Why?**
Patients often struggle to remember Batch IDs, and skin reactions are difficult to describe accurately. Visual evidence provides objective proof that significantly improves the quality of adverse event reports.

#### **How?**
- **Task A (Medicine OCR)**: Use **PaddleOCR** to scan medicine strips. Specifically extract **Batch Number** and **Expiry Date**. This data is critical for the Signal Detection module to identify "Bad Batches."
- **Task B (Dermatological Classification)**: Fine-tune a **ResNet-50** architecture on medical datasets (like DermNet) to classify skin issues into:
  - Healthy Skin / Normal Reaction
  - Mild Rash (Level 1-2)
  - Severe Reaction/Anaphylaxis/SJS (Level 4-5)
- **Integration**: Triggered by the `evidence_upload` field in the Case Wizard. The OCR output populates the `Batch_No` field in the database automatically.

---

### 3. Signal Detection Analytics (The Admin Brain)
**File**: `03_Signal_Detection_Analytics.ipynb`  
**Primary Models**: Isolation Forest, DBSCAN.

#### **Why?**
The ultimate goal of pharmacovigilance is to detect "Signals"—patterns of adverse events that indicate a public health risk. If multiple people in the same city report the same symptom from the same batch, it's not a coincidence; it's a signal.

#### **How?**
- **Clustering (DBSCAN)**: Group reports by `Pincode` and `Medicine_ID` to find geographic clusters.
- **Anomaly Detection (Isolation Forest)**: Treat the adverse event rate as a stream. If `Batch_XYZ` suddenly deviates from the expected baseline of reports, it is flagged as an anomaly (-1).
- **Visualization**: Generates the dynamic data points for the **Admin Red-Alert Heatmap**.
- **Integration**: Runs as a nightly batch job or on-demand on the Admin Analytics dashboard.

---

### 4. Pharmacist RAG Assistant (The Assistant)
**File**: `04_Pharmacist_RAG_Bot.ipynb`  
**Primary Models**: FAISS, SentenceTransformers, Flan-T5.

#### **Why?**
Pharmacists and Patients often have complex questions about dosages and contraindications. Traditional FAQ bots are brittle. **RAG (Retrieval-Augmented Generation)** allows the bot to "read" official medical PDFs and provide factually grounded answers rather than hallucinations.

#### **How?**
- **Vector Storage**: Ingest official Dosage Guideline PDFs, chunk them, and store them in a **FAISS** vector database using `SentenceTransformers`.
- **Retrieval**: When a user asks "What is the max dose of Paracetamol for a child?", the system finds the most relevant paragraph in the PDF.
- **Generation**: Pass the retrieved text + the user's question to **Flan-T5** (an efficient, instruction-tuned LLM) to generate a natural language answer.
- **Integration**: Embedded as a side-chat component on the Pharmacist and Patient dashboards.

---

## 📈 Supplementary Intelligence for Scalability

To reach a truly professional grade, we will integrate these additional AI-enhanced features:

### 5. Multi-Drug Interaction Checker (The Guardian)
- **Why**: Many adverse events are caused by interactions between the new medicine and the patient's existing medication.
- **How**: Build a **Knowledge Graph** (using Neo4j or a simple adjacency matrix) of known interactions. When a case is registered, cross-reference the `new_medicine` with the patient's `current_medicines` stored in their profile.

### 6. Intelligent Doctor-Patient Matching
- **Why**: Complex Level 5 cases should go to experienced MDs, while Level 1 cases can be handled by pharmacists or general practitioners.
- **How**: Use a **Ranking Model** to route cases based on:
  - Case Severity (from Risk Engine)
  - Doctor Specialization (extracted from profile)
  - Historical Case Resolution Time

### 7. Sentiment & Urgency Analysis
- **Why**: A patient who is "scared" or "panicked" needs a faster response than one who is "annoyed."
- **How**: Use a simple **Transformer-based Sentiment Classifier** on the chat messages to flag high-urgency/high-distress cases for immediate human intervention.

---

## 🏗️ Technical Architecture & Workflow Summary

| Notebook File | AI Job | Models Used | Integration Point |
| :--- | :--- | :--- | :--- |
| `01_Risk_Engine.ipynb` | Text Analysis & Triage | BioBERT, ScispaCy, XGBoost | `casesAPI.createCase` |
| `02_Vision_AI.ipynb` | Image Analysis & OCR | ResNet50, PaddleOCR | `Dashboard.evidence_upload` |
| `03_Anomaly_Detection.ipynb` | Batch & Cluster Detection | Isolation Forest, DBSCAN | `AdminView.analytics` |
| `04_RAG_Assistant.ipynb` | Fact-Based Q&A Bot | FAISS, SentenceTransformers | `HelpCenter.chat` |

---

## 📅 Roadmap for Implementation

1. **Week 1**: Data Generation. Create a synthetic dataset of 5,000+ reports representing various risk levels and regional clusters.
2. **Week 2**: Core Brain. Train and export the `Risk_Engine` and `NER_Model`.
3. **Week 3**: The Eyes. Implement the vision pipeline for medicine strip OCR.
4. **Week 4**: Signal Detection. Integrate the Anomaly Detection with the Admin Heatmap.
5. **Week 5**: Assistance. Set up the RAG pipeline for the Pharmacist Guideline Bot.
