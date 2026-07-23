const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "mongodb"');
schema = schema.replace(/url\s*=\s*".*?"/, 'url      = env("DATABASE_URL")');

// Replace auto-incrementing BigInt IDs
schema = schema.replace(/id\s+BigInt\s+@id\s+@default\(autoincrement\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// Replace auto-incrementing Int IDs
schema = schema.replace(/id\s+Int\s+@id\s+@default\(1\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// Replace specific String IDs (ProductImportBatch)
// In the original file it's exactly "id          String       @id"
schema = schema.replace(/id\s+String\s+@id\n/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId\n');

// Replace BigInt fields (foreign keys)
schema = schema.replace(/([a-zA-Z0-9_]+Id)[ \t]+BigInt(\?)?/g, '$1 String$2 @db.ObjectId');

// Fix specific String relation fields
schema = schema.replace(/batchId[ \t]+String\b/g, 'batchId String @db.ObjectId');
schema = schema.replace(/orderId[ \t]+String\?/g, 'orderId String? @db.ObjectId');

// Ensure guestToken and conversationId remain as is (they might have been mangled by previous regex but now they won't)

// Replace Decimal with Float
schema = schema.replace(/Decimal/g, 'Float');
schema = schema.replace(/@db\.Float\(\d+,[ \t]*\d+\)/g, ''); // Was originally @db.Decimal(12, 2) which became @db.Float(12, 2)
schema = schema.replace(/@db\.Decimal\(\d+,[ \t]*\d+\)/g, ''); 

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Done.');
