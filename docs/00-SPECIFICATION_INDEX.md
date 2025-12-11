# 📋 Lean_RPG Specification Index

**Last Updated**: December 11, 2025  
**Purpose**: Complete development guide for Lean_RPG Frontend

---

## 📁 Dokumenty

### 1. **00-SPECIFICATION_INDEX.md** ✅
**Co**: Detailní dokumentace všech API endpointů

**Obsahuje**:
- Kompletní seznam endpointů se Request/Response příklady
- Chybové kódy a jejich řešení
- Autentizace & bezpečnost (JWT)
- Rate limiting info
- Webhooks (když bude potřeba)

**Pro koho**:
- Backend developery
- Frontend developery (pro integraci)
- QA testeři (Postman)

---

### 2. **01-FRONTEND_DEVELOPMENT.md** ✅
**Co**: Kompletní React/TypeScript development guide

**Obsahuje**:
- Setup & běh (npm, env variables)
- Folder struktura
- State management (React hooks + Context)
- API integration pattern
- 3x Mini-hry:
  - Audit Game (5S)
  - Ishikawa Game (Fishbone)
  - Factory Map (Red Tags)
- Gemini integration
- Všechny komponenty
- Troubleshooting

**Pro koho**:
- Frontend developeré
- React vývojáři
- Nové členy týmu

---

### 3. **02-LEAN_RPG_API_SPECIFICATION.md** ✅
**Co**: Detailní API dokumentace

**Obsahuje**:
- 25+ API endpointů
- Request/Response příklady
- Error handling
- Rate limiting
- Postman testing guide

**Pro koho**:
- Backend developeré
- QA testeři
- Frontend integrace

---

### 4. **03-LEAN_RPG_OPENAPI.json** ✅
**Co**: Machine-readable Swagger/OpenAPI 3.0

**Používání**:
- Import do Postmanu
- Import do Swagger UI
- Generování client kódu

**Pro koho**:
- Automatizované tooling
- IDE auto-complete
- Code generation

---

### 5. **04-AI_INTEGRATION_GUIDE.md** ✅
**Co**: Návod pro AI assistanty

**Obsahuje**:
- Architektura & data modely
- Frontend tasks (konkrétní TODO)
- Backend tasks (konkrétní TODO)
- Implementation patterns
- Common gotchas

**Pro koho**:
- GitHub Copilot
- Claude
- Nové vývojáře

---

## 🎯 Quick Start - Vyber si svou roli

### Jsem Frontend Developer 👨‍💻

```bash
1. Čti: docs/01-FRONTEND_DEVELOPMENT.md
2. Reference: docs/02-LEAN_RPG_API_SPECIFICATION.md
3. npm install && npm run dev
4. Implementuj komponenty
```

### Jsem Backend Developer 🔧

```bash
1. Čti: docs/02-LEAN_RPG_API_SPECIFICATION.md
2. Reference: docs/04-AI_INTEGRATION_GUIDE.md
3. Importuj: docs/03-LEAN_RPG_OPENAPI.json do Postmanu
4. Implementuj routes
```

### Jsem AI Assistant 🤖

```bash
1. Čti: docs/04-AI_INTEGRATION_GUIDE.md
2. Reference: docs/03-LEAN_RPG_OPENAPI.json
3. Reference: docs/01-FRONTEND_DEVELOPMENT.md
4. Implementuj task
```

### Jsem QA Tester / PM 📋

```bash
1. Čti: docs/00-SPECIFICATION_INDEX.md
2. Importuj do Postmanu: docs/03-LEAN_RPG_OPENAPI.json
3. Reference: docs/02-LEAN_RPG_API_SPECIFICATION.md
4. Testuj API + UI
```

---

## 📚 Files v `/docs`

- `00-SPECIFICATION_INDEX.md` - Index & navigace (toto)
- `01-FRONTEND_DEVELOPMENT.md` - React guide (743 řádků)
- `02-LEAN_RPG_API_SPECIFICATION.md` - API detail (1286 řádků)
- `03-LEAN_RPG_OPENAPI.json` - Swagger spec (859 řádků)
- `04-AI_INTEGRATION_GUIDE.md` - AI guide (664 řádků)

**Total**: ~4000 řádků dokumentace

---

**Next**: Vyber si roli a čti příslušný dokument!
