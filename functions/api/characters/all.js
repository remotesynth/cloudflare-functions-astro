export async function onRequestGet({ env }) {
  let result = {
    characters: [],
  };

  let chrs = await env.RICK_MORTY_CHRS.list();

  if (chrs.keys.length === 0) {
    const res = await fetch(`https://rickandmortyapi.com/api/character/`);
    const data = await res.json();

    data.results.forEach(async (chr) => {
      console.log("adding character: " + chr.name);
      // I am not putting an expiration on this but I could
      await env.RICK_MORTY_CHRS.put(chr.id.toString(), chr.name);
    });
    chrs = await env.RICK_MORTY_CHRS.list();
  }

  result.characters = await Promise.all(
    chrs.keys.map(async (key) => {
      let kvChar = await env.RICK_MORTY_CHRS.get(key.name.toString(), {
        type: "text",
      });
      let res = {
        id: key.name,
        name: kvChar,
      };
      return res;
    })
  );
  result.characters.sort((a, b) => {
    if (Number(a.id) > Number(b.id)) {
      return 1;
    }
    if (Number(a.id) < Number(b.id)) {
      return -1;
    }
    return 0;
  });

  return new Response(JSON.stringify(result, null, 2));
}
