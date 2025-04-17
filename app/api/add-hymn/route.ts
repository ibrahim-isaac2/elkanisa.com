// app/api/add-hymn/route.ts
import { NextResponse } from "next/server";
import AWS from "aws-sdk";

// Configure AWS SDK for Cloudflare R2
const r2 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

interface Hymn {
  title: string;
  slides: string[];
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    // Check if R2_BUCKET_NAME is defined
    if (!process.env.R2_BUCKET_NAME) {
      throw new Error("R2_BUCKET_NAME is not defined in environment variables");
    }

    // Parse the JSON data from the request
    const hymnData: Hymn = await request.json();
    const { title, slides, timestamp } = hymnData;

    // Validate the data
    if (!title || !slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { success: false, message: "بيانات الترنيمة غير صحيحة" },
        { status: 400 }
      );
    }

    // Fetch the current list of hymns from Cloudflare R2
    let hymns: Hymn[] = [];
    try {
      const response = await r2
        .getObject({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: "add-hymn.json",
        })
        .promise();

      if (response.Body) {
        hymns = JSON.parse(response.Body.toString());
        if (!Array.isArray(hymns)) {
          hymns = [];
        }
      }
    } catch (error: any) {
      if (error.code === "NoSuchKey") {
        // If the file doesn't exist, start with an empty array
        hymns = [];
      } else {
        console.error("Error fetching add-hymn.json:", error);
        throw new Error("فشل في جلب بيانات الترانيم");
      }
    }

    // Add the new hymn to the list
    const newHymn: Hymn = {
      title,
      slides,
      timestamp,
    };
    hymns.push(newHymn);

    // Update the file on Cloudflare R2
    await r2
      .putObject({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: "add-hymn.json",
        Body: JSON.stringify(hymns),
        ContentType: "application/json",
      })
      .promise();

    return NextResponse.json({
      success: true,
      message: "تم إضافة الترنيمة بنجاح",
      data: newHymn,
    });
  } catch (error: any) {
    console.error("Error in add-hymn API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}