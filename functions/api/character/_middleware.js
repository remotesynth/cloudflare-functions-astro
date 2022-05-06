const errorHandler = async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
};

const handleGet = async (event) => {
  const request = event.request;
  const cacheUrl = new URL(request.url);

  // Construct the cache key from the cache URL
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);

  if (!response) {
    console.log(
      `Response for request url: ${request.url} not present in cache. Fetching and caching request.`
    );

    response = await event.next();

    response.headers.append("Cache-Control", "s-maxage=10");
    event.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    console.log(`Cache hit for: ${request.url}.`);
  }
  let nextResponse = await event.next();

  nextResponse = nextResponse.clone();
  nextResponse.headers.append("Content-Type", "application/json");
  return new Response(response.body, nextResponse);
};

export const onRequest = [errorHandler];
export const onRequestGet = [handleGet];
