import { rolesNoNumber } from '../roles.js';
import fs from 'fs';

const length = rolesNoNumber.length;
const num = 40;
let iter = 0;
while (iter < length) {
  const chunk = rolesNoNumber.splice(0, num);
  let data = '';
  for (let i = 0; i < chunk.length; i++) {
    if (i % 2 !== 0) continue;
    const roleName = chunk[i];
    const roleID = chunk[i + 1];
    data += `"${roleName}",\n"${roleID}",\n"put the county id here",\n\n`;
  }

  fs.writeFileSync(iter / num + '.txt', '[' + data + ']');
  console.log(chunk.length);
  console.log(rolesNoNumber.length);
  iter += num;
}

fs.writeFileSync('20.txt', JSON.stringify(rolesNoNumber));
