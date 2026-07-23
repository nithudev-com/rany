const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "mongodb"');
schema = schema.replace(/url\s*=\s*".*?"/, 'url      = env("DATABASE_URL")');

// Replace standard auto-incrementing BigInt IDs
schema = schema.replace(/id\s+BigInt\s+@id\s+@default\(autoincrement\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// Replace standard auto-incrementing Int IDs (e.g., StoreSettings)
schema = schema.replace(/id\s+Int\s+@id\s+@default\(\d+\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// Replace standard String IDs (e.g., ProductImportBatch)
schema = schema.replace(/id\s+String\s+@id/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// Replace BigInt foreign keys with String @db.ObjectId
schema = schema.replace(/(\w+Id)\s+BigInt(\?)?/g, '$1 String$2 @db.ObjectId');

// Replace String foreign keys with String @db.ObjectId if they are part of a relation
// Let's manually fix the known ones. ProductImportBatch uses id String.
// ProductImportRow: batchId String -> batchId String @db.ObjectId
schema = schema.replace(/batchId\s+String\b/g, 'batchId String @db.ObjectId');

// ContactConversation: orderId String? - orderId is probably referencing Order id? But Order id is BigInt (now String @db.ObjectId).
// So orderId String? -> orderId String? @db.ObjectId
schema = schema.replace(/orderId\s+String\?/g, 'orderId String? @db.ObjectId');

// ContactMessage: conversationId BigInt -> already handled by (\w+Id)\s+BigInt(\?)?

// Let's remove @@unique and @@index that have multiple fields maybe? MongoDB supports them in Prisma.
// Let's replace any db.Decimal with Float or String? MongoDB in Prisma doesn't support Decimal. It supports Float.
schema = schema.replace(/Decimal/g, 'Float');
schema = schema.replace(/@db\.Decimal\(\d+,\s*\d+\)/g, '');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema converted.');
