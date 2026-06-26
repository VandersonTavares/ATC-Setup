/**********************************************************************
 * ATC Setup
 *
 * Fluxo:
 * 0 - Verificar ambiente
 * 1 - Criar estrutura de pastas
 * 2 - Clonar repositórios
 * 3 - Copiar arquivos de suporte
 * 4 - Instalar JDKs
 * 5 - Executar instaladores gerais
 * 6 - Configurar servidores
 **********************************************************************/

import fs from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import AdmZip from "adm-zip";

/**********************************************************************
 * Configurações
 **********************************************************************/

const PROJECT_PATH = process.cwd();
const BASE_PATH = "C:\\atc";

const REPOSITORIES_FILE = path.join(
  PROJECT_PATH,
  "config",
  "repositories.json",
);
const SUPPORT_FILES_FILE = path.join(
  PROJECT_PATH,
  "config",
  "support-files.json",
);
const JDKS_FILE = path.join(PROJECT_PATH, "config", "jdks.json");
const INSTALLERS_FILE = path.join(PROJECT_PATH, "config", "installers.json");
const SERVERS_FILE = path.join(PROJECT_PATH, "config", "servers.json");

const folders = [
  "workspace",
  "suporte",
  "servers",
  "workspace\\baseline",
  "workspace\\SICOP_CONFIGURACAO_MAQ",
];

/**********************************************************************
 * Funções utilitárias
 **********************************************************************/
async function loading(text, seconds = 3) {
  const frames = ["|", "/", "-", "\\"];
  const interval = 150;

  return new Promise((resolve) => {
    let frame = 0;

    process.stdout.write(`${frames[0]} ${text}`);

    const timer = setInterval(() => {
      process.stdout.write(
        `\r${frames[frame++ % frames.length]} ${text}`
      );
    }, interval);

    setTimeout(() => {
      clearInterval(timer);
      process.stdout.write(`\r✅ ${text}\n`);
      resolve();
    }, seconds * 1000);
  });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback) {
  if (!(await pathExists(filePath))) {
    return fallback;
  }

  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}

async function commandExists(command, args) {
  try {
    await execa(command, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**********************************************************************
 * Etapa 0 - Verificar ambiente
 **********************************************************************/

function isSshRepository(url) {
  return typeof url === "string" && url.startsWith("git@");
}

async function checkNode() {
  console.log(`✅ Node.js encontrado: ${process.version}`);
}

async function checkNpm() {
  const exists = await commandExists("npm", ["--version"]);

  if (!exists) {
    throw new Error(
      "npm não encontrado. Instale o Node.js com npm antes de continuar.",
    );
  }

  console.log("✅ npm encontrado.");
}

async function checkGit() {
  const exists = await commandExists("git", ["--version"]);

  if (!exists) {
    throw new Error("Git não encontrado. Instale o Git antes de continuar.");
  }

  console.log("✅ Git encontrado.");
}

async function checkSshIfNeeded() {
  const data = await readJson(REPOSITORIES_FILE, { repositories: [] });
  const hasSshRepo = data.repositories.some((repo) =>
    isSshRepository(repo.url),
  );

  if (!hasSshRepo) {
    console.log(
      "ℹ️ Nenhum repositório SSH configurado. Verificação SSH ignorada.",
    );
    return;
  }

  const exists = await commandExists("ssh", ["-V"]);

  if (!exists) {
    throw new Error(
      "SSH não encontrado. Instale/configure OpenSSH antes de clonar repositórios via SSH.",
    );
  }

  console.log("✅ SSH encontrado.");
}

async function checkBasePathPermission() {
  await fs.mkdir(BASE_PATH, { recursive: true });

  const testFile = path.join(BASE_PATH, ".atc-setup-test");

  await fs.writeFile(testFile, "test");
  await fs.rm(testFile, { force: true });

  console.log(`✅ Permissão de escrita em ${BASE_PATH}.`);
}

async function checkEnvironment() {
  console.log("\n==============================");
  console.log("VERIFICANDO AMBIENTE");
  console.log("==============================\n");

  await loading("Verificando Node.js");
  await checkNode();

  await loading("Verificando npm");
  await checkNpm();

  await loading("Verificando Git");
  await checkGit();

  await loading("Verificando SSH");
  await checkSshIfNeeded();

  await loading("Verificando permissão de escrita");
  await checkBasePathPermission();
}

/**********************************************************************
 * Etapa 1 - Criar estrutura de pastas
 **********************************************************************/

async function createStructure() {
  console.log("\n==============================");
  console.log("CRIANDO ESTRUTURA");
  console.log("==============================\n");

  await fs.mkdir(BASE_PATH, { recursive: true });

  for (const folder of folders) {
    const fullPath = path.join(BASE_PATH, folder);
    await fs.mkdir(fullPath, { recursive: true });
    console.log(`📁 ${fullPath}`);
  }
}

/**********************************************************************
 * Etapa 2 - Clonar repositórios
 **********************************************************************/

async function cloneRepository(repo) {
  if (!repo.url) {
    console.log(`⚠️ ${repo.name}: URL não configurada.`);
    return;
  }

  const destination = path.join(BASE_PATH, repo.destination);

  if (await pathExists(destination)) {
    console.log(`⚠️ ${repo.name}: já existe.`);
    return;
  }

  console.log(`\n⬇️ Clonando ${repo.name}`);

  await execa(
    "git",
    ["clone", "--branch", repo.branch, repo.url, destination],
    { stdio: "inherit" },
  );

  console.log(`✅ ${repo.name} clonado.`);
}

async function cloneRepositories() {
  console.log("\n==============================");
  console.log("CLONANDO REPOSITÓRIOS");
  console.log("==============================\n");

  const data = await readJson(REPOSITORIES_FILE, { repositories: [] });

  for (const repo of data.repositories) {
    await cloneRepository(repo);
  }
}

/**********************************************************************
 * Etapa 3 - Copiar arquivos de suporte
 **********************************************************************/

async function applySupportFile(file) {
  const source = path.join(PROJECT_PATH, file.source);
  const destination = path.join(BASE_PATH, file.destination);

  if (!(await pathExists(source))) {
    console.log(`⚠️ ${file.name}: não encontrado.`);
    return;
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });

  if (file.action === "move") {
    await fs.rename(source, destination);
    console.log(`📦 Movido ${file.name}`);
    return;
  }

  await fs.copyFile(source, destination);
  console.log(`📦 Copiado ${file.name}`);
}

async function applySupportFiles() {
  console.log("\n==============================");
  console.log("ARQUIVOS DE SUPORTE");
  console.log("==============================\n");

  const data = await readJson(SUPPORT_FILES_FILE, { files: [] });

  for (const file of data.files) {
    await applySupportFile(file);
  }
}

/**********************************************************************
 * Etapa 4 - Instalar JDKs
 **********************************************************************/

async function installJdk(jdk) {
  if (jdk.enabled === false) {
    return;
  }

  const jdkPath = path.join(PROJECT_PATH, jdk.path);

  if (!(await pathExists(jdkPath))) {
    console.log(`⚠️ ${jdk.name}: instalador não encontrado.`);
    return;
  }

  console.log(`\n☕ Instalando ${jdk.name}`);

  await execa(jdkPath, jdk.args ?? [], {
    stdio: "inherit",
  });

  console.log(`✅ ${jdk.name} instalado/finalizado.`);
}

async function installJdks() {
  console.log("\n==============================");
  console.log("INSTALANDO JDKs");
  console.log("==============================\n");

  const data = await readJson(JDKS_FILE, { jdks: [] });

  for (const jdk of data.jdks) {
    await installJdk(jdk);
  }
}

/**********************************************************************
 * Etapa 5 - Executar instaladores gerais
 **********************************************************************/

async function runInstaller(installer) {
  if (installer.enabled === false) {
    return;
  }

  const installerPath = path.join(PROJECT_PATH, installer.path);

  if (!(await pathExists(installerPath))) {
    console.log(`⚠️ ${installer.name}: instalador não encontrado.`);
    return;
  }

  console.log(`\n🚀 Executando ${installer.name}`);

  await execa(installerPath, installer.args ?? [], {
    stdio: "inherit",
  });

  console.log(`✅ ${installer.name} finalizado.`);
}

async function runInstallers() {
  console.log("\n==============================");
  console.log("INSTALADORES GERAIS");
  console.log("==============================\n");

  const data = await readJson(INSTALLERS_FILE, { installers: [] });

  for (const installer of data.installers) {
    await runInstaller(installer);
  }
}

/**********************************************************************
 * Etapa 6 - Configurar servidores
 **********************************************************************/

async function configureServer(server) {
  if (server.enabled === false) {
    return;
  }

  const zipPath = path.join(PROJECT_PATH, server.file);
  const destination = path.join(BASE_PATH, server.destination);

  if (!(await pathExists(zipPath))) {
    console.log(`⚠️ ${server.name}: arquivo ZIP não encontrado.`);
    return;
  }

  if (await pathExists(destination)) {
    console.log(`⚠️ ${server.name}: destino já existe. Pulando extração.`);
    return;
  }

  console.log(`\n🖥️ Extraindo servidor ${server.name}`);

  await fs.mkdir(destination, { recursive: true });

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destination, true);

  console.log(`✅ ${server.name} extraído em: ${destination}`);
}

async function configureServers() {
  console.log("\n==============================");
  console.log("CONFIGURANDO SERVIDORES");
  console.log("==============================\n");

  const data = await readJson(SERVERS_FILE, { servers: [] });

  for (const server of data.servers) {
    await configureServer(server);
  }
}

/**********************************************************************
 * Programa principal
 **********************************************************************/

async function main() {
  // Etapa 0
  await checkEnvironment();

  // Etapa 1
  await createStructure();

  // Etapa 2
  await cloneRepositories();

  // Etapa 3
  await applySupportFiles();

  // Etapa 4
  await installJdks();

  // Etapa 5
  await runInstallers();

  // Etapa 6
  await configureServers();

  console.log("\n==============================");
  console.log("ATC SETUP FINALIZADO");
  console.log("==============================");
}

main().catch((error) => {
  console.error("\n❌ Erro:", error.message);
});
