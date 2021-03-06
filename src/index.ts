import { spawnSync } from "child_process";
import fse from "fs-extra";
import ora from "ora";

const copyTemplate = (templateName: string) =>
  fse.copyFile(
    `/Users/marcosantos/Desktop/code.nosync/node-scripts/node-init/templates/${templateName}.template`,
    `./${templateName}`
  );

const step = async ({
  name,
  command,
  after,
}: {
  name: string;
  command?: string | string[];
  after?: () => Promise<void>;
}) => {
  const stepOra = ora().start(`Running: ${name}...`);
  if (command) {
    const commands = typeof command === "string" ? [command] : command;
    const argedComms = commands.map((c) => c.split(" "));
    for (let ac of argedComms) {
      const { error } = spawnSync(ac[0]!, ac.splice(1));
      if (error) {
        stepOra.fail(`[ERR] ${name} – ${error.message}`);
        return;
      }
    }
  }
  if (after) await after();
  stepOra.succeed(`[OK] ${name}`);
};

const main = async () => {
  await step({
    name: "Init Git repo",
    command: "git init",
  });

  await step({
    name: "Create package.json",
    command: "yarn init -y",
    after: () => copyTemplate("package.json"),
  });

  await step({
    name: "Install dependencies",
    command: "yarn",
  });

  await step({
    name: "Init Typescript",
    command: "tsc --init",
    after: () => copyTemplate("tsconfig.json"),
  });

  await step({
    name: "Add .gitignore",
    after: async () => copyTemplate(".gitignore"),
  });

  await step({
    name: "Create source files",
    command: ["mkdir src", "touch src/index.ts"],
  });
};

main();
