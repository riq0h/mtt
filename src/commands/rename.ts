import * as fs from "fs";
import * as path from "path";
import { openEditor } from "../utils/editor";

export interface RenameOperation {
  oldName: string;
  newName: string;
  path: string;
  newPath: string;
}

export async function renameFiles(): Promise<void> {
  try {
    const files: string[] = fs
      .readdirSync(process.cwd())
      .filter((file: string) => !file.startsWith("."));
    const fileContent: string = files.join("\n");
    const editedContent: string = await openEditor(fileContent);
    const newNames: string[] = editedContent.trim().split("\n");

    if (newNames.length !== files.length) {
      throw new Error(
        "the number of files and lines do not match. renaming was not performed.",
      );
    }

    const uniqueNames: Set<string> = new Set(newNames);
    if (uniqueNames.size !== newNames.length) {
      throw new Error("file names are duplicated. renaming was not performed.");
    }

    newNames.forEach((name: string) => {
      if (name.includes("/") || name.includes("\\")) {
        throw new Error(
          "file names cannot contain paths. renaming was not performed.",
        );
      }
    });

    const operations: RenameOperation[] = files.map(
      (oldName: string, index: number) => ({
        oldName,
        newName: newNames[index],
        path: path.join(process.cwd(), oldName),
        newPath: path.join(process.cwd(), newNames[index]),
      }),
    );

    if (!operations.some((op: RenameOperation) => op.oldName !== op.newName)) {
      console.log("no changes were made. renaming was not performed.");
      return;
    }

    for (const op of operations) {
      if (op.oldName !== op.newName) {
        fs.renameSync(op.path, op.newPath);
      }
    }

    console.log("renaming completed successfully.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("error:", error.message);
    } else {
      console.log("unknown error.");
      process.exit(1);
    }
  }
}
