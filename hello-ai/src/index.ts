/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
    // If you set another name in the Wrangler config file as the value for 'binding',
    // replace "AI" with the variable name you defined.
    AI: Ai;
}

export default {
    async fetch(request, env): Promise<Response> {

	const { url } = request;

	console.log(url);

	//  https://developers.cloudflare.com/workers/examples/read-post/
	async function readRequestBody(request: Request) {
	    const contentType = request.headers.get("content-type");
	    if (contentType.includes("application/json")) {
		return (await request.json());
	    } else if (contentType.includes("application/text")) {
		return request.text();
	    } else if (contentType.includes("text/html")) {
		return request.text();
	    } else if (contentType.includes("form")) {
		const formData = await request.formData();
		const body = {};
		for (const entry of formData.entries()) {
		    body[entry[0]] = entry[1];
		}
		return JSON.stringify(body);

	    } else {
		// Perhaps some other type of data was submitted in the form
		// like an image, or some other binary data.
		return "a file";
	    }
	}
	
	if (url.includes("form")) {
	    return rawHtmlResponse(someForm);
	}

	
	//  https://developers.cloudflare.com/workers/examples/cors-header-proxy/

	async function handleOptions(request) {
	    if (
		request.headers.get("Origin") !== null &&
		    request.headers.get("Access-Control-Request-Method") !== null &&
		    request.headers.get("Access-Control-Request-Headers") !== null
	    ) {
		// Handle CORS preflight requests.
		return new Response(null, {
		    headers: {
			...corsHeaders,
			"Access-Control-Allow-Headers": request.headers.get(
			    "Access-Control-Request-Headers",
			),
		    },
		});
	    } else {
		// Handle standard OPTIONS request.
		return new Response(null, {
		    headers: {
			Allow: "GET, HEAD, POST, OPTIONS",
		    },
		});
	    }
	}

	const url_req = new URL(request.url);
	
	if (request.method === "OPTIONS") {
            // Handle CORS preflight requests
            return handleOptions(request);
	} else if (request.method === "POST") {

	    const reqBody = await readRequestBody(request);

	    console.log(reqBody);
	    
	    
	    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		prompt: reqBody["prompt"],
	    });

	    console.log(response)

	    
	    // https://developers.cloudflare.com/workers/examples/cors-header-proxy/
	    
	    const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
		"Access-Control-Max-Age": "86400",
	    };

	    
	    return new Response(JSON.stringify(response));
	}

	return Response(url_req);

    }
}satisfies ExportedHandler<Env>;
