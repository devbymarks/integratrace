<div align="center">

# 🔎 IntegraTrace

### API Integration Diagnostics Platform

Monitore endpoints HTTP, execute verificações sob demanda e acompanhe o histórico de disponibilidade, status e latência em uma interface centralizada.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk\&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6DB33F?logo=springboot\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker\&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?logo=apachemaven\&logoColor=white)
![Status](https://img.shields.io/badge/Status-MVP%20de%20portf%C3%B3lio-blue)

</div>

---

## 📌 Sobre o projeto

O **IntegraTrace** é uma aplicação web para centralizar o cadastro e o diagnóstico de integrações com APIs. Ela permite registrar endpoints, executar verificações HTTP manualmente e consultar resultados anteriores para ajudar a identificar falhas e acompanhar o comportamento dos serviços.

O sistema reúne informações como código HTTP recebido, resultado da verificação, tempo de resposta e horário da execução. O dashboard apresenta uma visão resumida das integrações e das verificações registradas.

> **Escopo atual:** MVP de portfólio executado localmente. As verificações são acionadas sob demanda; o projeto ainda não implementa agendamento automático de checks nem autenticação de usuários.

## 🎯 Objetivos

* Centralizar endpoints que precisam ser verificados.
* Facilitar a identificação de respostas HTTP inesperadas.
* Registrar histórico de verificações para consulta posterior.
* Exibir indicadores operacionais em um dashboard.
* Demonstrar uma aplicação full stack com Java, API REST, persistência relacional e containers.

## ✨ Funcionalidades

* 📊 **Dashboard:** total de integrações, integrações ativas, verificações com sucesso ou falha e latência média.
* 🔌 **Gestão de integrações:** criar, consultar, editar, pesquisar, filtrar, ativar e desativar endpoints.
* 🩺 **Verificação HTTP:** executar requisições `GET` ou `HEAD`, com timeout configurável.
* 🎯 **Validação de resultado:** comparar o status HTTP recebido com o status esperado.
* 🧾 **Histórico:** consultar verificações por integração e as execuções recentes.
* 📤 **Exportação CSV:** exportar os dados disponíveis pela interface.
* 🖥️ **Interface responsiva:** dashboard web com HTML, CSS e JavaScript.
* 🧪 **Testes automatizados:** testes de API com Spring Boot, MockMvc e banco H2.
* 🐳 **Ambiente conteinerizado:** aplicação e PostgreSQL iniciados com Docker Compose.
* ❤️ **Health check da aplicação:** endpoint para conferir se a API está respondendo.

## 🧰 Tecnologias e ferramentas

|Tecnologia|Utilização|
|-|-|
|Java 21|Linguagem principal e regras de negócio|
|Spring Boot 3.5.5|Estrutura da aplicação backend|
|Spring Web|Criação da API REST|
|Spring Data JPA / Hibernate|Persistência e mapeamento objeto-relacional|
|Bean Validation|Validação dos dados recebidos|
|PostgreSQL 16|Banco de dados para execução local|
|H2|Banco em memória para testes|
|HTML5, CSS3 e JavaScript|Interface web|
|Maven|Dependências e build|
|Docker / Docker Compose|Containerização e execução local|
|JUnit 5 / MockMvc|Testes automatizados|
|Python 3 (opcional)|Script de smoke test da API, usando a biblioteca padrão|

## 🏗️ Arquitetura

O projeto segue uma organização em camadas para separar as responsabilidades:

```text
Interface Web (HTML, CSS e JavaScript)
                 │
                 ▼
          API REST (Controller)
                 │
                 ▼
          Camada de Serviço
       (regras e verificações HTTP)
                 │
                 ▼
       Repositórios Spring Data JPA
                 │
                 ▼
             PostgreSQL
```

* **Controller:** recebe as requisições HTTP e expõe os endpoints.
* **DTO:** valida os dados enviados para criar ou atualizar integrações.
* **Service:** aplica regras de negócio, executa os checks e consolida os indicadores.
* **Model:** representa integrações e execuções de verificação.
* **Repository:** consulta e persiste os dados no banco.
* **Frontend:** apresenta o dashboard, os formulários e os históricos.

## 📂 Estrutura de pastas

```text
integratrace/
├── compose.yaml
├── Dockerfile
├── pom.xml
├── README.md
├── .gitignore
├── scripts/
│   └── smoke-test.py
└── src/
    ├── main/
    │   ├── java/com/integratrace/
    │   │   ├── IntegraTraceApplication.java
    │   │   ├── controller/
    │   │   │   ├── ApiController.java
    │   │   │   └── ApiExceptionHandler.java
    │   │   ├── dto/
    │   │   │   └── IntegrationRequest.java
    │   │   ├── model/
    │   │   │   ├── CheckRun.java
    │   │   │   └── Integration.java
    │   │   ├── repository/
    │   │   │   ├── CheckRunRepository.java
    │   │   │   └── IntegrationRepository.java
    │   │   └── service/
    │   │       └── IntegrationService.java
    │   └── resources/
    │       ├── application.yml
    │       └── static/
    │           ├── app.js
    │           ├── index.html
    │           └── styles.css
    └── test/
        ├── java/com/integratrace/
        │   └── ApiControllerTest.java
        └── resources/
            └── application-test.yml
```

## ⚙️ Como executar com Docker

### Pré-requisitos

* Git (opcional, para clonar o repositório).
* Docker Desktop com Docker Compose disponível.
* Conexão com a internet na primeira execução para baixar imagens e dependências.

### 1\. Obtenha o projeto

Extraia o ZIP ou clone o repositório e entre na pasta do projeto:

```bash
cd integratrace
```

### 2\. Configure a senha do banco

O Compose utiliza uma senha padrão destinada somente ao ambiente local. Para definir outra senha, configure a variável `POSTGRES\_PASSWORD` antes de iniciar.

No PowerShell:

```powershell
$env:POSTGRES\_PASSWORD="uma-senha-local-forte"
docker compose up --build
```

No Linux/macOS:

```bash
export POSTGRES\_PASSWORD="uma-senha-local-forte"
docker compose up --build
```

### 3\. Acesse a aplicação

* **Interface web:** http://localhost:8080
* **Health check:** http://localhost:8080/api/health
* **PostgreSQL no host:** `localhost:5433`

O banco usa a porta `5433` no host para reduzir conflitos com instalações locais de PostgreSQL. Entre containers, a aplicação se conecta ao serviço `postgres` pela porta `5432`.

Para encerrar, use `Ctrl+C` e, se necessário, execute:

```bash
docker compose down
```

Os dados são mantidos no volume Docker `integratrace\_data`. Para apagar também o banco local e todos os registros persistidos:

```bash
docker compose down -v
```

**Atenção:** o comando com `-v` é destrutivo e remove os dados armazenados no volume.

## 🧪 Testes

Com Java 21 e Maven instalados, execute na raiz do projeto:

```bash
mvn test
```

Os testes automatizados usam o perfil `test` e o banco H2, sem depender de um PostgreSQL em execução.

### Smoke test da API

Com a aplicação já iniciada e Python 3 instalado:

```bash
python scripts/smoke-test.py
```

É possível informar outra URL base:

```bash
python scripts/smoke-test.py http://localhost:8080
```

O script cadastra uma integração de demonstração, executa uma verificação e confere o histórico e o dashboard. Ele consulta `https://httpbin.org/status/200`; portanto, precisa de conectividade externa. Uma falha nessa chamada pode refletir indisponibilidade do serviço de demonstração ou da rede, e não necessariamente um defeito na aplicação.

## 🔗 Endpoints da API

Base URL local: `http://localhost:8080`

|Método|Endpoint|Finalidade|
|-|-|-|
|`GET`|`/api/health`|Verifica se a aplicação está respondendo|
|`GET`|`/api/dashboard`|Retorna os indicadores do dashboard|
|`GET`|`/api/integrations`|Lista integrações; aceita `q` e `active` como filtros|
|`POST`|`/api/integrations`|Cadastra uma integração|
|`GET`|`/api/integrations/{id}`|Consulta uma integração|
|`PUT`|`/api/integrations/{id}`|Atualiza uma integração|
|`PATCH`|`/api/integrations/{id}/active`|Ativa ou desativa uma integração|
|`DELETE`|`/api/integrations/{id}`|Exclui uma integração sem histórico de checks|
|`POST`|`/api/integrations/{id}/checks`|Executa uma verificação HTTP|
|`GET`|`/api/integrations/{id}/checks`|Consulta o histórico da integração|
|`GET`|`/api/check-runs`|Consulta as verificações recentes|

### Exemplo de cadastro

```http
POST /api/integrations
Content-Type: application/json
```

```json
{
  "name": "Orders API",
  "description": "Endpoint de saúde da API de pedidos",
  "url": "https://api.example.com/health",
  "method": "GET",
  "expectedStatus": 200,
  "timeoutSeconds": 5,
  "active": true
}
```

Os métodos aceitos são `GET` e `HEAD`; o timeout permitido é de 1 a 15 segundos, e o status esperado deve estar entre 100 e 599.

## 🔐 Segurança e limitações conhecidas

Este projeto é um MVP local e **não deve ser publicado diretamente na internet sem reforço de segurança**.

* Não há autenticação nem autorização de usuários.
* O usuário pode cadastrar URLs para as quais o servidor fará requisições. Isso cria risco de **SSRF** (acesso indireto a serviços internos) se a aplicação for exposta ou usada por pessoas não confiáveis.
* Antes de um uso compartilhado ou em produção, implemente allowlist de hosts, bloqueio de endereços privados/loopback e validação de DNS/redirecionamentos, além de controles de saída de rede.
* Configure senhas por secret manager ou variáveis seguras; não use a senha padrão em ambientes compartilhados.
* O Hibernate está configurado com `ddl-auto: update`, conveniente para desenvolvimento, mas migrações versionadas são preferíveis em produção.
* Os checks são manuais: não existe agendador automático no escopo atual.
* As verificações registram resultados e latência, mas não substituem uma plataforma completa de observabilidade, alertas ou monitoramento distribuído.

Faça verificações apenas em endpoints que você possui ou tem autorização para testar.

## 💾 Banco de dados, backup e restauração

O PostgreSQL é persistido no volume Docker `integratrace\_data`. Para criar um backup lógico do banco enquanto os containers estão em execução:

```bash
docker compose exec -T postgres pg\_dump -U integratrace -d integratrace > integratrace-backup.sql
```

Para restaurar em um banco local compatível, primeiro confirme que o destino está correto e que pode ser sobrescrito. Um exemplo para restaurar em um banco vazio:

```bash
docker compose exec -T postgres psql -U integratrace -d integratrace < integratrace-backup.sql
```

Guarde o arquivo de backup em local seguro e teste periodicamente a restauração. O volume Docker preserva dados entre reinicializações, mas **não é, sozinho, uma estratégia de backup**.

## 🗺️ Roadmap

* [ ] Agendamento automático de verificações.
* [ ] Autenticação e controle de acesso por usuário.
* [ ] Allowlist de destinos e proteção contra SSRF.
* [ ] Alertas para falhas consecutivas e recuperação do serviço.
* [ ] Filtros por período e gráficos históricos de latência.
* [ ] Paginação para históricos e listagens maiores.
* [ ] Migrações de banco versionadas.
* [ ] Pipeline CI para executar os testes automaticamente.
* [ ] Melhorar a cobertura de testes de serviço, histórico e falhas HTTP.

## 👨‍💻 Autor

**Matheus Marks**

Projeto desenvolvido com foco em diagnóstico de integrações HTTP, monitoramento sob demanda de endpoints e acompanhamento de disponibilidade e latência.

O IntegraTrace centraliza o cadastro de APIs, a execução de verificações e o histórico de resultados em uma interface única, ajudando a identificar respostas inesperadas e organizar informações técnicas para análise e troubleshooting.

## ⭐ Apoie o projeto

Se este projeto foi útil para você, considere deixar uma ⭐ no repositório. 
