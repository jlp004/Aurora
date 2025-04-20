import prisma from '@/lib/db';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ posts: [] });
    }

    const posts = await prisma.post.findMany({
      where: {
        title: {
          contains: query, // no mode
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// import prisma from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'

// export async function GET(req: NextRequest) {
//   // Get the search parameter 'q' from the URL
//   const { searchParams } = req.nextUrl
//   const query = searchParams.get('q')

//   console.log("Query parameter:", query) // Log the query parameter for debugging

//   // Return an error response if 'q' is not provided
//   if (!query) {
//     return NextResponse.json({ message: "Query parameter is required" }, { status: 400 })
//   }

//   try {
//     // Query the database to find posts with titles containing the query string
//     const posts = await prisma.post.findMany({
//       where: {
//         title: {
//           contains: query,
//           mode: "insensitive" // Case-insensitive search
//         }
//       }
//     })

//     console.log("Posts found:", posts) // Log the posts fetched from the database

//     // Return the posts in the response
//     return NextResponse.json({ posts }, { status: 200 })
//   } catch (error) {
//     // Log any errors and return a 500 response with the error message
//     console.error("Error fetching posts:", error)
//     return NextResponse.json({ message: "Failed to retrieve posts", error: error.message }, { status: 500 })
//   }
// }
