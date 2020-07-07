import fs from 'fs';
import roles from './rolesWithIds.js';

const newRoles = [];
roles.forEach((role, i, orig) => {
  if (i % 3 !== 0) return;
  const id = orig[i + 2];
  if (id === 'put the county id here') return;
  const roleID = orig[i + 1];
  newRoles.push(role, roleID, id);
});

fs.writeFileSync('./finalRoles.js', JSON.stringify(newRoles));
