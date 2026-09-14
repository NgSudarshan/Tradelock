import {NextResponse, NextRequest} from "next/server"; /* Next.js middleware for handling cookies and generating a unique identifier for users. */

const COOKIE_NAME = "hexchange_uid"; /* Define a constant for the cookie name used to store the unique identifier. */

export function middleware(req: NextRequest) {/* Middleware function that checks for the existence of a cookie in the incoming request*/
    const existing= req.cookies.get(COOKIE_NAME);/* Check if the cookie already exists in the request. If it does, proceed to the next middleware or route handler. */
    if(!existing) return NextResponse.next();/* If the cookie does not exist, generate a new unique identifier and set it as a cookie in the response. */

    const res=NextResponse.next();/* Create a new NextResponse object to send back to the client. */
    res.cookies.set(COOKIE_NAME, crypto.randomUUID(), { /* Set cookie options,crypto.randomUUID() generates a 128 bit UUID */
        maxAge: 60 * 60 * 24 *365,/* 1 year = 60 secs x 60 mins x 24 hrs x 365 days */
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
    return res;
}

export const config = {
    matcher: "/((?!_next/static|_next/image|favicon.ico).*)",/* Apply the middleware to all paths except for static files, images, and the favicon. */
};