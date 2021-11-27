import { stat } from "fs-extra";

export async function exists(path: string) {
  // Check if the output file path exists
  try {
    await stat(path);
    // If the file exists then return true
    return true;
  } catch (err: any) {
    // Throw any other errors than file not found
    if (err.code !== 'ENOENT') {
      throw err;
    }
    // If the file doesn't exist then return false
    return false;
  }
}
