const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(/@default\(auto\(\)\) @default\(auto\(\)\) @map\("_id"\) @map\("_id"\) @db\.ObjectId @db\.ObjectId/g, '@default(auto()) @map("_id") @db.ObjectId');

// To be safe, just remove duplicates of @default(auto()), @map("_id"), @db.ObjectId
schema = schema.replace(/(@default\(auto\(\)\)\s*)+/g, '@default(auto()) ');
schema = schema.replace(/(@map\("_id"\)\s*)+/g, '@map("_id") ');
schema = schema.replace(/(@db\.ObjectId\s*)+/g, '@db.ObjectId ');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Fixed.');
