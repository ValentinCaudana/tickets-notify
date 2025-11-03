import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const subsPath = path.join(__dirname, "../data/subscriptions.json");

function safeReadFileSync(path) {
  if (!fs.existsSync(path)) return [];
  const data = fs.readFileSync(path, "utf8");
  if (!data.trim()) return []; // if the file is empty
  try {
    return JSON.parse(data);
  } catch {
    return []; // if the content is not a valid JSON
  }
}

export function listSubscriptions(_req, res) {
  const subs = safeReadFileSync(subsPath);
  res.json(subs);
}

export function createSubscription(req, res) {
  const { email, clubId } = req.body;

  if (!email || !clubId) {
    return res.status(400).json({ error: "email and clubId are required" });
  }

  const subs = safeReadFileSync(subsPath);
  const sub = { id: crypto.randomUUID(), email, clubId };
  subs.push(sub);

  fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
  res.status(201).json(sub);
}
