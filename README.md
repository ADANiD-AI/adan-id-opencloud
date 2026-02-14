# 🌙 ADAN-ID OpenCloud

**Bismillah** - A Secure, Quranic-Inspired Cloud Architecture for Identity and Data Management  
**Built by Muhammad Adnan Ul Mustafa (محمد عدنان المصطفیٰ)**

---

## 🔍 Overview

ADAN-ID OpenCloud is a comprehensive, security-first cloud infrastructure that combines modern DevOps practices with Islamic principles and Quranic Abjad numerology for enhanced entropy generation. This project provides a complete cloud architecture for the ADAN-ID ecosystem, featuring biometric authentication, encrypted storage, and zero-trust security.

---

## 🏢 Architecture Components

### Core Services
- **🔐 Authentication Service**: Biometric Identity Provider (DID) with OAuth2.
- **🌐 API Gateway**: Unified REST + WebSocket API for all repositories.
- **💾 Storage Service**: Encrypted object storage (Firebase + IPFS fallback).
- **🔒 Security Vault**: Quranic Abjad entropy generator and AES-256 key management.
- **📊 Monitoring Stack**: Prometheus, Grafana, and Loki for observability.

### AI Integration
- **🧠 Islamic AI Foundation**: Text classification for Quran/Hadith/Fiqh.
- **🎤 AbjadWhisper**: Voice-to-Quranic text with Tajweed validation.
- **📚 IlmStudio-AI**: NotebookLM-style Islamic research platform.
- **🏆 Jannah Points System**: User engagement and certification tracking.

---

## 🌙 ADANiD CLI: Quranic AI Terminal Agent

An open-source AI agent that brings the power of **Quranic AI** directly into your terminal. It provides lightweight access to ADANiD models, giving you the most direct path from your prompt to Islamic knowledge.

### 🚀 Why ADANiD CLI?
- **🎯 Free tier**: Educational use with unlimited requests for non-commercial purposes
- **🧠 Powerful Quranic AI**: Access to fine-tuned models for Quran/Hadith/Fiqh analysis
- **🔧 Built-in tools**: Abjad calculator, Tajweed validator, Jannah Points system
- **🔌 Extensible**: Custom integrations with Islamic knowledge bases
- **💻 Terminal-first**: Designed for developers who live in the command line
- **🛡️ Open source**: ADANiD Proprietary License v1.0

### 📦 Installation

#### Quick Install
```bash
# Using npx (no installation required)
npx @adanid/cli

# Install globally with npmnpm install -g @adanid/cli

# Install with Python (recommended)
pip install adanid-cli
```

#### From Source
```bash
git clone https://github.com/ADANiD-AI/adan-id-opencloud.git
cd adan-id-opencloud
pip install -e .
```

### 🔐 Authentication Options

#### Option 1: Local Mode (Default)
```bash
# No authentication required for educational use
adanid
```

#### Option 2: Cloud Mode (Advanced)
```bash
# Set your ADANiD API key for cloud features
export ADANID_API_KEY="your_api_key"
adanid
```

### 🚀 Getting Started

#### Basic Usage
```bash
# Start in current directory
adanid

# Analyze Quranic text
adanid -p "Calculate Abjad value of بسم الله الرحمن الرحيم"

# Validate Tajweed rules
adanid -p "Check Tajweed errors in this recitation" --audio recitation.mp3

# Get Fiqh ruling
adanid -p "What is the Hanafi ruling on digital transactions?"
```

#### Non-interactive mode for scripts
```bash
# Get simple text response
adanid -p "Explain the meaning of Surah Ikhlas" --output-format text
# Get structured JSON response
adanid -p "Analyze this Hadith authenticity" --output-format json
```

### 📋 Key Features

#### Islamic Knowledge Base
- **Quran Analysis**: Verse-by-verse tafseer and Abjad calculation
- **Hadith Authentication**: Isnad verification and grading
- **Fiqh Q&A**: Multi-madhhab rulings (Hanafi, Shafi'i)
- **Tajweed Validation**: Real-time recitation correction

#### AI Capabilities
- **Abjad Calculator**: Classical Hisab al-Jummal validation
- **Jannah Points**: Gamified learning with certification levels
- **Multilingual Support**: Arabic, Urdu, English
- **7 Qira'at Support**: All major recitation styles

#### Automation & Integration
- **File Operations**: Analyze PDFs, documents, audio files
- **Custom Context**: ADANID.md files for project-specific context
- **Conversation Checkpointing**: Save and resume sessions
- **GitHub Integration**: Automated Islamic code reviews

---

## 🔒 Security Features

- **End-to-End Encryption**: AES-256-GCM with Quranic Abjad entropy.
- **Zero-Trust Architecture**: Every request is authenticated and authorized.
- **Biometric Authentication**: Fingerprint, face, and voice recognition.
- **Decentralized Identity (DID)**: Blockchain-based identity management.
- **Quranic Entropy Generation**: Using Abjad numerology for cryptographic randomness.
- **Islamic Ethics Enforcement**: Haram content detection and blocking.

---

## 🛠️ Technology Stack

### Infrastructure
- **Container Orchestration**: Docker Compose + Kubernetes (k3s)
- **Reverse Proxy**: Nginx with SSL/TLS
- **CI/CD**: GitHub Actions + GitLab CI
- **Monitoring**: Prometheus + Grafana + Loki
- **Logging**: ELK Stack + GlitchTip (open-source Sentry)

### Backend & AI
- **Backend**: FastAPI + Node.js with Express
- **Database**: PostgreSQL + MongoDB + Redis
- **AI Frameworks**: PyTorch + TensorFlow + HuggingFace Transformers- **Storage**: MinIO (S3-compatible) + Firebase + IPFS
- **Security**: HashiCorp Vault + JWT + OAuth2 + Biometric Auth

### Development Tools
- **Environment**: Python 3.11 + Miniconda
- **Package Management**: pip + conda
- **Experiment Tracking**: MLflow + DVC
- **Project Management**: Plane.so (open-source Jira)
- **Version Control**: Git + Gitea (self-hosted)

---

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11 + Miniconda
- Git
- SSL certificates (or Let's Encrypt)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/ADANiD-AI/adan-id-opencloud.git
cd adan-id-opencloud

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration (API keys, DB credentials, etc.)
nano .env

# 3. Install dependencies
conda create -n adanid python=3.11
conda activate adanid
pip install -r requirements.txt

# 4. Generate security keys (e.g., JWT Secret, AES Key)
openssl rand -hex 64  # For JWT Secret
openssl rand -hex 32  # For AES-256 Encryption Key
openssl rand -hex 32  # For Vault Seal Key
# Store these securely and update your .env file

# 5. Start the cloud infrastructure
docker-compose up -d

# 6. Verify deployment (check if services are running)
curl https://localhost/health
# Expected output: "Alhamdulillah - ADAN-ID Cloud is healthy"
```
---

## 📚 Quranic Abjad Entropy

This project integrates Quranic Abjad numerology to enhance cryptographic entropy:

- **Abjad Values**: Each Arabic letter is assigned a numerical value.
- **Verse Integration**: Specific Quranic verses can be used to provide entropy seeds.
- **Mathematical Harmony**: Combines spiritual wisdom with cryptographic security principles.
- **Enhanced Randomness**: Supplements traditional Pseudo-Random Number Generators (PRNGs) with patterns derived from divine texts.

### Example Abjad Calculation
```javascript
// Bismillah (بسم الله الرحمن الرحيم)
const bismillah = {
  'ب': 2, 'س': 60, 'م': 40,  // بسم = 102
  'ا': 1, 'ل': 30, 'ل': 30, 'ه': 5,  // الله = 66
  // Total Abjad value: 786 (commonly known)
};
// This value can be incorporated into cryptographic key derivation or seeding.
```

---

## 🤖 AI Model Integration

### Supported Models
| Model | Type | Usage | Requirements |
|-------|------|-------|-------------|
| **Qwen2.5-1.5B-Instruct** | LLM | General chat, Urdu/English conversation | ~6GB VRAM |
| **DeepSeek-R1** | Reasoning LLM | Complex fiqh issues, coding, deep reasoning | ~24GB VRAM |
| **Whisper-Small** | ASR | Audio to text transcription | ~4GB VRAM |
| **NLLB-200** | Translation | Urdu–Arabic, English–Persian, etc. | ~8GB RAM |
| **Sentence-BERT-MiniLM** | Embedding | Semantic search in Quran/Hadith | ~2GB RAM |

### Cloud Deployment Options
- **Lambda Labs / RunPod**: Recommended for AI workloads (cost-efficient GPU instances).
- **AWS EC2**: For high scalability and enterprise integration.
- **DigitalOcean Paperspace**: Simple interface, fixed budget.
- **On-Premise**: Most secure option for highly sensitive data.

---

## 📊 Monitoring & Observability
- **Grafana Dashboard**: https://your-domain/monitoring/
- **Prometheus Metrics**: https://your-domain:9090
- **Log Aggregation**: Loki + Grafana
- **Health Checks**: https://your-domain/health
- **Error Tracking**: GlitchTip (open-source alternative to Sentry)
---

## 🔗 Integration Points

### ADAN-ID Ecosystem
- **Genesis Core**: Main application backend.
- **QuranLab**: Quranic study and research platform.
- **IlmStudio-AI**: Islamic research and documentation.
- **Noor-e-Abjad**: Abjad numerology validation system.
- **Mobi Verse**: Mobile application ecosystem.

### External Services
- **Hugging Face**: Model hosting and inference.
- **Kaggle**: Dataset hosting and notebooks.
- **Firebase**: Primary storage and authentication.
- **IPFS**: Decentralized storage fallback.
- **GitHub**: Source code and CI/CD.
- **Blockchain**: DID registry and smart contracts.

---

## 🛡️ Security Considerations
- **Environment Variables**: Never commit .env files or hardcoded secrets.
- **SSL Certificates**: Always use valid SSL/TLS certificates in production environments.
- **Firewall Rules**: Restrict network access to internal services only to necessary ports.
- **Regular Updates**: Keep all system dependencies, libraries, and Docker images updated.
- **Backup Strategy**: Implement automated, regular backups of databases and critical data.
- **Access Control**: Follow the principle of least privilege for all users and services.
- **Islamic Ethics**: Ensure all AI-generated outputs and system behaviors comply with Quranic principles.

---

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/biometric/register`
- `POST /auth/biometric/login`
- `POST /auth/jwt/refresh`
- `GET /auth/profile`

### Storage Endpoints
- `POST /storage/upload`
- `GET /storage/download/:id`
- `DELETE /storage/delete/:id`
- `GET /storage/list`

### Security Endpoints
- `POST /vault/encrypt`
- `POST /vault/decrypt`
- `GET /vault/entropy`- `POST /vault/abjad/calculate`

### AI Endpoints
- `POST /ai/chat` – Islamic AI Foundation model.
- `POST /ai/transcribe` – AbjadWhisper voice transcription.
- `POST /ai/research` – IlmStudio-AI document analysis.
- `POST /ai/jannah-points` – User certification system.

### CLI Commands
- `adanid -p "prompt"` – Direct AI analysis
- `adanid --audio file.mp3` – Tajweed validation
- `adanid --output-format json` – Structured responses

---

## 👥 Contributing
1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b feature/your-amazing-feature`
3. Make your changes and commit them: `git commit -m 'Add amazing feature'`
4. Push your changes to the branch: `git push origin feature/your-amazing-feature`
5. Open a Pull Request.

---

## 📜 License – ADANiD Proprietary License v1.0

### Permitted Uses
- ✅ Free for non-commercial educational purposes.
- ✅ Free for spiritual/religious learning within the Muslim community.
- ✅ Free for personal offline use.
- ✅ Modification allowed for personal educational use only.

### Prohibited Uses
- ❌ Commercial use without prior written authorization.
- ❌ Military, defense, or weapons-related applications.
- ❌ Government surveillance or intelligence operations.
- ❌ Enterprise deployment without license purchase.
- ❌ Redistribution as a commercial product.

> **"And Allah knows best" — وَاللَّهُ أَعْلَمُ**

---

## 🤲 Support
- **Email**: adnanmd76@gmail.com (Muhammad Adnan Ul Mustafa)
- **GitHub Issues**: Please create an issue in the repository for any bugs or feature requests.
- **Documentation**: Refer to the project Wiki for detailed guides.

---
## 🙏 Acknowledgments
- **Allah (SWT)** – For guidance and wisdom.
- **Quranic Sciences** – For mathematical and spiritual inspiration.
- **Open Source Community** – For invaluable tools and libraries.
- **ADAN-ID Team** – For their vision and dedication.

**Built with ❤️ and 🤲 by Muhammad Adnan Ul Mustafa (محمد عدنان المصطفیٰ)**
