'use strict';

/**
 * Ensures Android SDK / JDK paths are visible to Gradle and the RN CLI on Windows
 * when JAVA_HOME, ANDROID_HOME, or PATH were not propagated into the IDE terminal.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function hasJavaBin(javaHome) {
  const exe = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  return fs.existsSync(exe);
}

function resolveJavaHome(env) {
  const candidates = [];
  if (env.JAVA_HOME && isDir(env.JAVA_HOME)) candidates.push(env.JAVA_HOME);

  if (process.platform === 'win32') {
    const pf = env['ProgramFiles'] || 'C:\\Program Files';
    candidates.push(
      path.join(pf, 'Android', 'Android Studio', 'jbr'),
      path.join(pf, 'Android', 'Android Studio', 'jre'),
    );
  }

  return candidates.find((p) => hasJavaBin(p)) || null;
}

function resolveSdkRoot(env) {
  if (env.ANDROID_HOME && isDir(env.ANDROID_HOME)) return env.ANDROID_HOME;

  if (process.platform === 'win32') {
    const local = env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const guess = path.join(local, 'Android', 'Sdk');
    if (isDir(guess)) return guess;
  }

  if (process.platform === 'darwin') {
    const guess = path.join(os.homedir(), 'Library', 'Android', 'sdk');
    if (isDir(guess)) return guess;
  }

  const guess = path.join(os.homedir(), 'Android', 'Sdk');
  return isDir(guess) ? guess : null;
}

function mergePath(prepend, pathStr) {
  const sep = path.delimiter;
  const parts = [pathStr || '']
    .join(sep)
    .split(sep)
    .filter(Boolean);
  const seen = new Set();
  const ordered = [];

  for (const p of [...prepend, ...parts]) {
    if (!p || seen.has(p)) continue;
    seen.add(p);
    ordered.push(p);
  }
  return ordered.join(sep);
}

/**
 * Gradle reads sdk.dir here. Fixes "SDK location not found" when the daemon does not see ANDROID_HOME.
 */
function ensureLocalProperties(sdkRoot) {
  if (!sdkRoot || !isDir(sdkRoot)) return;

  const lp = path.join(__dirname, '..', 'android', 'local.properties');
  const sdkDir = sdkRoot.replace(/\\/g, '/');
  const sdkLine = `sdk.dir=${sdkDir}`;

  let raw = '';
  try {
    raw = fs.readFileSync(lp, 'utf8');
  } catch {
    // new file
  }

  if (raw.split(/\r?\n/).some((line) => line.trim() === sdkLine)) {
    return;
  }

  const keptLines = raw
    .split(/\r?\n/)
    .filter((line) => !/^\s*sdk\.dir\s*=/.test(line));
  const banner = '# sdk.dir: maintained by scripts/run-android.cjs (npm run android)';
  const out = [banner, sdkLine, ...keptLines].join('\n').trimEnd() + '\n';
  fs.writeFileSync(lp, out, 'utf8');
}

function augmentedEnv() {
  const env = { ...process.env };

  const sdk = resolveSdkRoot(env);
  if (sdk) {
    env.ANDROID_HOME = sdk;
  }

  const javaHome = resolveJavaHome(env);
  if (javaHome) {
    env.JAVA_HOME = javaHome;
  }

  const nodeBinDir = path.dirname(process.execPath);
  const prepend = [];
  if (isDir(nodeBinDir)) {
    prepend.push(nodeBinDir);
  }
  if (sdk) {
    prepend.push(path.join(sdk, 'platform-tools'), path.join(sdk, 'emulator'));
  }
  if (javaHome) {
    prepend.push(path.join(javaHome, 'bin'));
  }

  env.PATH = mergePath(prepend.filter(isDir), env.PATH);

  return { env, sdk };
}

const { env, sdk } = augmentedEnv();
ensureLocalProperties(sdk);

const cli = path.join(__dirname, '..', 'node_modules', 'react-native', 'cli.js');
const args = [cli, 'run-android', ...process.argv.slice(2)];

const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
process.exit(result.status === null ? 1 : result.status);
