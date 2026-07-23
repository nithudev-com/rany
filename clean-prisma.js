const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Remove onDelete and onUpdate
schema = schema.replace(/, onDelete: Cascade/g, '');
schema = schema.replace(/, onDelete: SetNull/g, '');

// Remove redundant indexes
schema = schema.replace(/@@index\(\[email\]\)/g, '');
schema = schema.replace(/@@index\(\[code\]\)/g, '');
schema = schema.replace(/@@index\(\[orderNumber\]\)/g, '');
schema = schema.replace(/@@index\(\[guestToken\]\)/g, '');
schema = schema.replace(/@@index\(\[slug\]\)/g, '');
schema = schema.replace(/@@index\(\[idempotencyKey\]\)/g, '');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Cleaned.');
