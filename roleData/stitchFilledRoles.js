import fs from 'fs';
const fsProm = fs.promises;

const flatten = arr =>
  arr.reduce(
    (flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
    []
  );

(async () => {
  // const result = [];
  try {
    const fileNames = await fsProm.readdir('./completed');

    const promises = fileNames.map(fileName =>
      fsProm.readFile(`./completed/${fileName}`, 'utf8')
    );

    const pendingRes = await Promise.all(promises);

    const result = flatten(pendingRes.map(str => JSON.parse(str)));
    fs.writeFileSync('./rolesWithIds.js', JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
})();
