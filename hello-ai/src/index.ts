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


	//  https://developers.cloudflare.com/workers/examples/read-post/
	async function readRequestBody(request: Request) {
	    const contentType = request.headers.get("content-type");
	    if (contentType.includes("application/json")) {
		return (await request);
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
		return body;
	    } else {
		// Perhaps some other type of data was submitted in the form
		// like an image, or some other binary data.
		return "a file";
	    }
	}
	
	const { url } = request;
	if (url.includes("form")) {
	    return rawHtmlResponse(someForm);
	}
	if (request.method === "POST") {

	    //  Working around quirks of readRequestBody().
	    
	    const reqBody = await readRequestBody(request);

	    console.log(reqBody);

	    const prompt_kv_str = Object.keys(reqBody)[0];

	    console.log(prompt_kv_str);
	    
	    const prompt_in = JSON.parse(prompt_kv_str)["prompt"];
	    
	    
	    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		prompt: prompt_in,
	    });
	    return new Response(JSON.stringify(response));
	}

	return JSON.stringify(response);
	
    },
} satisfies ExportedHandler<Env>;
