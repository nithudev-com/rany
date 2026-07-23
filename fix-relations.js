const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(/@relation\(([^)]+)\)/g, (match, inner) => {
    if (inner.includes('onDelete') || inner.includes('onUpdate')) {
        return match; // skip if already defined
    }
    return `@relation(${inner}, onDelete: NoAction, onUpdate: NoAction)`;
});

schema = schema.replace(/importBatchId\s+String\?/g, 'importBatchId String? @db.ObjectId');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Fixed relations.');
