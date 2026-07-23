const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(/children\s+Category\[\]\s+@relation\("CategoryTree",\s*onDelete:\s*NoAction,\s*onUpdate:\s*NoAction\)/g, 'children Category[] @relation("CategoryTree")');
schema = schema.replace(/blogs\s+BlogPost\[\]\s+@relation\("ProductToBlog",\s*onDelete:\s*NoAction,\s*onUpdate:\s*NoAction\)/g, 'blogs BlogPost[] @relation("ProductToBlog")');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Fixed inverse relations.');
