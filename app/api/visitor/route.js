import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "visitors.json");

// جلب عدد الزوار
export async function GET() {
  let visitors = 0;
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    visitors = JSON.parse(fileData).count;
  } catch (error) {
    // لو الملف مش موجود، يبقى 0
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ count: 0 }), "utf-8");
  }
  return new Response(JSON.stringify({ count: visitors }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// زيادة عدد الزوار
export async function POST() {
  let visitors = 0;
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    visitors = JSON.parse(fileData).count;
  } catch (error) {
    // لو الملف مش موجود، ينشئ ملف جديد
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }
  visitors += 1;
  await fs.writeFile(filePath, JSON.stringify({ count: visitors }), "utf-8");
  return new Response(JSON.stringify({ count: visitors }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}