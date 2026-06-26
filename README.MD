# ATC Setup

## Descrição

O **ATC Setup** é uma ferramenta desenvolvida em Node.js para automatizar a preparação de uma máquina de desenvolvimento.

O objetivo é reduzir ao máximo as configurações manuais, realizando automaticamente:

* Criação da estrutura de pastas do ambiente.
* Clone dos repositórios necessários.
* Cópia ou movimentação de arquivos de suporte.
* Instalação de múltiplas versões do Java (JDK).
* Execução de instaladores necessários para o ambiente.
* Configuração automática de servidores (extração de arquivos ZIP).

---

# Estrutura do projeto

```text
ATC-Setup
│
├── config
│   ├── repositories.json
│   ├── support-files.json
│   ├── jdks.json
│   ├── installers.json
│   └── servers.json
│
├── files
│   ├── suporte
│   ├── jdks
│   ├── instaladores
│   └── servers
│
├── src
│   └── index.js
│
├── package.json
└── README.md
```

---

# Estrutura criada na máquina

Ao executar o programa será criada automaticamente a estrutura:

```text
C:\atc
│
├── workspace
│   ├── baseline
│   └── SICOP_CONFIGURACAO_MAQ
│
├── suporte
│
└── servers
```

Os repositórios serão clonados dentro de:

```text
C:\atc\workspace\baseline
```

Os servidores serão extraídos automaticamente em:

```text
C:\atc\servers
```

---

# Fluxo de execução

O programa executa as etapas na seguinte ordem:

## Etapa 1

Criar estrutura de pastas.

## Etapa 2

Clonar todos os repositórios configurados em:

```text
config/repositories.json
```

## Etapa 3

Copiar ou mover arquivos de suporte definidos em:

```text
config/support-files.json
```

## Etapa 4

Instalar todas as versões do Java configuradas em:

```text
config/jdks.json
```

## Etapa 5

Executar os instaladores gerais configurados em:

```text
config/installers.json
```

## Etapa 6

Extrair e configurar os servidores configurados em:

```text
config/servers.json
```

---

# Dependências

É necessário possuir instalado na máquina:

* Node.js 22 ou superior
* Git

---

# Dependências do projeto

Após clonar o projeto execute:

```bash
npm install
```

Dependências utilizadas atualmente:

```bash
npm install execa adm-zip
```

Caso novas dependências sejam adicionadas ao projeto, basta executar novamente:

```bash
npm install
```

---

# Executar

```bash
npm start
```

---

# Arquivos de configuração

## repositories.json

Responsável por definir todos os repositórios que serão clonados.

### Exemplo

```json
{
  "repositories": [
    {
      "name": "metro-sicaf",
      "url": "https://gitlab.com/empresa/metro-sicaf.git",
      "branch": "develop",
      "destination": "workspace/baseline/metro-sicaf"
    }
  ]
}
```

### Como adicionar um novo repositório

1. Abra:

```text
config/repositories.json
```

2. Adicione um novo objeto dentro da lista `repositories`.

Exemplo:

```json
{
  "name": "novo-projeto",
  "url": "https://gitlab.com/empresa/novo-projeto.git",
  "branch": "develop",
  "destination": "workspace/baseline/novo-projeto"
}
```

Não é necessário alterar nenhuma linha do código.

---

## support-files.json

Responsável por copiar ou mover arquivos para qualquer local dentro do ambiente criado.

### Exemplo

```json
{
  "files": [
    {
      "name": "guava-20.0.jar",
      "source": "files/suporte/libs/guava-20.0.jar",
      "destination": "workspace/baseline/metro-sicop/sicopApp/lib/guava-20.0.jar",
      "action": "copy"
    }
  ]
}
```

### Como adicionar novos arquivos de suporte

#### Passo 1

Coloque o arquivo dentro de:

```text
ATC-Setup/files/suporte
```

Você pode criar quantas subpastas desejar.

Exemplo:

```text
files
└── suporte
    ├── libs
    ├── configs
    ├── certificados
    ├── scripts
    └── ...
```

#### Passo 2

Abra:

```text
config/support-files.json
```

Adicione um novo objeto na lista `files`.

Exemplo:

```json
{
  "name": "application.properties",
  "source": "files/suporte/configs/application.properties",
  "destination": "workspace/baseline/metro-sicaf/src/main/resources/application.properties",
  "action": "copy"
}
```

### Campos

| Campo       | Descrição                                    |
| ----------- | -------------------------------------------- |
| name        | Nome amigável do arquivo                     |
| source      | Caminho do arquivo dentro da pasta ATC-Setup |
| destination | Caminho relativo à pasta C:\atc              |
| action      | copy ou move                                 |

### Actions

#### copy

Copia o arquivo mantendo o original.

#### move

Move o arquivo removendo o original.

Não é necessário alterar o código.

---

## jdks.json

Responsável por definir todas as versões do Java que serão instaladas.

### Exemplo

```json
{
  "jdks": [
    {
      "name": "JDK 8",
      "path": "files/jdks/jdk8.exe",
      "args": ["/s"],
      "enabled": true
    }
  ]
}
```

### Como adicionar um novo JDK

#### Passo 1

Coloque o instalador dentro de:

```text
ATC-Setup/files/jdks
```

Exemplo:

```text
files
└── jdks
    ├── jdk7.exe
    ├── jdk8.exe
    ├── jdk11.exe
    ├── jdk17.exe
    └── jdk21.exe
```

#### Passo 2

Abra:

```text
config/jdks.json
```

Adicione um novo objeto.

Exemplo:

```json
{
  "name": "JDK 21",
  "path": "files/jdks/jdk21.exe",
  "args": ["/s"],
  "enabled": true
}
```

Não é necessário alterar nenhuma linha do código.

---

## installers.json

Responsável por executar todos os instaladores gerais.

### Exemplo

```json
{
  "installers": [
    {
      "name": "Docker Desktop",
      "path": "files/instaladores/Docker Desktop Installer.exe",
      "args": [],
      "enabled": true
    }
  ]
}
```

### Como adicionar um novo instalador

#### Passo 1

Coloque o instalador dentro de:

```text
ATC-Setup/files/instaladores
```

Exemplo:

```text
files
└── instaladores
    ├── Git.exe
    ├── IntelliJ.exe
    ├── Docker.exe
    ├── Maven.exe
    ├── VSCode.exe
    └── ...
```

#### Passo 2

Abra:

```text
config/installers.json
```

Adicione um novo objeto.

Não é necessário alterar nenhuma linha do código.

---

## servers.json

Responsável por configurar os servidores da aplicação.

Cada servidor é um arquivo ZIP localizado na pasta `files/servers`.

O programa cria automaticamente a pasta de destino dentro de `C:\atc\servers` e extrai o conteúdo do ZIP.

### Exemplo

```json
{
  "servers": [
    {
      "name": "JBoss SICOP",
      "file": "files/servers/jboss-sicop.zip",
      "destination": "servers/jboss-sicop",
      "enabled": true
    }
  ]
}
```

### Como adicionar um novo servidor

#### Passo 1

Coloque o arquivo ZIP dentro de:

```text
ATC-Setup/files/servers
```

Exemplo:

```text
files
└── servers
    ├── jboss-sicop.zip
    ├── tomcat.zip
    ├── wildfly.zip
    └── weblogic.zip
```

#### Passo 2

Abra:

```text
config/servers.json
```

Adicione um novo objeto.

Exemplo:

```json
{
  "name": "WildFly 30",
  "file": "files/servers/wildfly.zip",
  "destination": "servers/wildfly",
  "enabled": true
}
```

Na execução do programa o arquivo ZIP será extraído automaticamente para:

```text
C:\atc\servers\wildfly
```

Não é necessário alterar nenhuma linha do código.

---

# Estrutura da pasta files

```text
files
│
├── suporte
│   ├── libs
│   ├── certificados
│   ├── configs
│   ├── scripts
│   └── ...
│
├── jdks
│   ├── jdk7.exe
│   ├── jdk8.exe
│   ├── jdk11.exe
│   ├── jdk17.exe
│   ├── jdk21.exe
│   └── ...
│
├── instaladores
│   ├── Git.exe
│   ├── IntelliJ.exe
│   ├── Maven.exe
│   ├── Docker.exe
│   ├── VSCode.exe
│   └── ...
│
└── servers
    ├── jboss-sicop.zip
    ├── tomcat.zip
    ├── wildfly.zip
    ├── weblogic.zip
    └── ...
```

---

# Observações

* Os repositórios são clonados sequencialmente (um por vez).
* As instalações também são executadas sequencialmente.
* Os servidores também são extraídos um por vez.
* Caso um repositório já exista, o clone será ignorado.
* Caso um arquivo de suporte não exista, será exibido apenas um aviso.
* Caso um instalador, JDK ou servidor não seja encontrado, será exibido um aviso e o processo continuará.
* Todo o comportamento da aplicação é controlado pelos arquivos da pasta `config`, não sendo necessário alterar o código-fonte para adicionar novos repositórios, arquivos de suporte, JDKs, instaladores ou servidores.
* A arquitetura foi projetada para permitir a adição de novas etapas de automação, como configuração de variáveis de ambiente, Maven, Tomcat, WildFly, IntelliJ IDEA, Docker, bancos de dados e outras configurações específicas do ambiente de desenvolvimento.
