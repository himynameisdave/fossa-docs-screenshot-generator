#!/usr/bin/env node
import { constants } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, join, parse, relative, resolve } from 'node:path';

import { EXPORT_SCALE, SCREENSHOT_SIZE } from '../../../src/lib/screenshot-composition';
import { renderScreenshotPng } from './render';

type CliOptions = {
  browserWindow: boolean;
  force: boolean;
  help: boolean;
  inputs: string[];
  outputPath: string | null;
  scale: number;
  screenshotSize: number;
};

class CliError extends Error {}

const HELP_TEXT = `Usage:
  fossa-docs-screenshot [options] <image...>

Options:
  -o, --output <path>       Write a single input to a specific output path.
  -f, --force               Overwrite existing output files.
  --scale <number>          Export scale multiplier. Default: ${EXPORT_SCALE}.
  --screenshot-size <percent>
                            Screenshot placement size. Default: ${SCREENSHOT_SIZE.defaultPercent}.
  --no-browser-window       Export without the macOS-style browser frame.
  -h, --help                Show this help message.
`;

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      console.log(HELP_TEXT.trimEnd());
      return;
    }

    if (options.inputs.length === 0) {
      throw new CliError('Provide at least one input image path.');
    }

    if (options.outputPath && options.inputs.length > 1) {
      throw new CliError('--output can only be used with one input image.');
    }

    for (const input of options.inputs) {
      const inputPath = resolve(input);
      const outputPath = resolveOutputPath(inputPath, options.outputPath);

      await assertReadableFile(inputPath);
      await assertOutputPath(inputPath, outputPath, options.force);

      const result = await renderScreenshotPng({
        inputPath,
        outputPath,
        scale: options.scale,
        browserWindow: options.browserWindow,
        screenshotSize: options.screenshotSize
      });

      console.log(
        `Created ${formatPath(result.outputPath)} (${result.outputWidth} x ${result.outputHeight}px)`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected CLI failure.';
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    browserWindow: true,
    force: false,
    help: false,
    inputs: [],
    outputPath: null,
    scale: EXPORT_SCALE,
    screenshotSize: SCREENSHOT_SIZE.defaultPercent / 100
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--') {
      options.inputs.push(...args.slice(index + 1));
      break;
    }

    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg === '-f' || arg === '--force') {
      options.force = true;
      continue;
    }

    if (arg === '--no-browser-window') {
      options.browserWindow = false;
      continue;
    }

    if (arg === '--browser-window') {
      options.browserWindow = true;
      continue;
    }

    if (arg === '-o' || arg === '--output') {
      index += 1;
      options.outputPath = readOptionValue(args, index, arg);
      continue;
    }

    if (arg === '--scale') {
      index += 1;
      options.scale = parseScale(readOptionValue(args, index, arg));
      continue;
    }

    if (arg === '--screenshot-size') {
      index += 1;
      options.screenshotSize = parseScreenshotSize(readOptionValue(args, index, arg));
      continue;
    }

    if (arg.startsWith('-')) {
      throw new CliError(`Unknown option: ${arg}`);
    }

    options.inputs.push(arg);
  }

  return options;
}

function readOptionValue(args: string[], index: number, option: string) {
  const value = args[index];

  if (!value || value.startsWith('-')) {
    throw new CliError(`${option} requires a value.`);
  }

  return value;
}

function parseScale(value: string) {
  const scale = Number(value);

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new CliError('--scale must be a positive number.');
  }

  return scale;
}

function parseScreenshotSize(value: string) {
  const size = Number(value);

  if (
    !Number.isFinite(size) ||
    size < SCREENSHOT_SIZE.minPercent ||
    size > SCREENSHOT_SIZE.maxPercent
  ) {
    throw new CliError(
      `--screenshot-size must be a percentage between ${SCREENSHOT_SIZE.minPercent} and ${SCREENSHOT_SIZE.maxPercent}.`
    );
  }

  return size / 100;
}

function resolveOutputPath(inputPath: string, explicitOutputPath: string | null) {
  if (explicitOutputPath) {
    return resolve(explicitOutputPath);
  }

  const parsedInput = parse(inputPath);
  const inputName = parsedInput.name || basename(inputPath, extname(inputPath));

  return join(dirname(inputPath), `${inputName}.pretty.png`);
}

async function assertReadableFile(inputPath: string) {
  let fileStat;

  try {
    fileStat = await stat(inputPath);
  } catch {
    throw new CliError(`Input file does not exist: ${formatPath(inputPath)}`);
  }

  if (!fileStat.isFile()) {
    throw new CliError(`Input path is not a file: ${formatPath(inputPath)}`);
  }
}

async function assertOutputPath(inputPath: string, outputPath: string, force: boolean) {
  if (inputPath === outputPath) {
    throw new CliError('Output path must be different from the input path.');
  }

  if (force) {
    return;
  }

  try {
    await access(outputPath, constants.F_OK);
  } catch {
    return;
  }

  throw new CliError(`Output file already exists: ${formatPath(outputPath)}. Use --force to overwrite.`);
}

function formatPath(filePath: string) {
  const relativePath = relative(process.cwd(), filePath);

  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return filePath;
  }

  return relativePath;
}

void main();
