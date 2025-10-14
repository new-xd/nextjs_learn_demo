import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

async function seedUsers() {
  // await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  // 先创建表（如果不存在）
  console.log('🏗️  [Users] 开始执行 CREATE TABLE...');
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;
  console.log('✅ [Users] CREATE TABLE 执行完成');
  
  // 查询现有数据
  console.log('🔍 [Users] 开始查询现有数据...');
  const existingUsers = await sql`SELECT * FROM users`;
  console.log(`✅ [Users] 查询完成，找到 ${existingUsers.length} 条数据`);
  
  // 删除所有数据
  if (existingUsers.length > 0) {
    console.log('🗑️  [Users] 开始删除所有数据...');
    await sql`DELETE FROM users`;
    console.log('✅ [Users] 删除完成');
  } else {
    console.log('ℹ️  [Users] 表中无数据，跳过删除');
  }

  // 批量hash所有密码
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: await bcrypt.hash(user.password, 10),
    })),
  );

  // 一次性插入所有用户数据
  console.log(`📝 [Users] 开始批量插入 ${usersWithHashedPasswords.length} 条数据...`);
  const insertedUsers = await sql`
    INSERT INTO users ${sql(usersWithHashedPasswords, 'id', 'name', 'email', 'password')}
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('✅ [Users] 批量插入执行完成');

  return insertedUsers;
}

async function seedInvoices() {
  // await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  // 先创建表（如果不存在）
  console.log('🏗️  [Invoices] 开始执行 CREATE TABLE...');
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;
  console.log('✅ [Invoices] CREATE TABLE 执行完成');
  
  // 查询现有数据
  console.log('🔍 [Invoices] 开始查询现有数据...');
  const existingInvoices = await sql`SELECT * FROM invoices`;
  console.log(`✅ [Invoices] 查询完成，找到 ${existingInvoices.length} 条数据`);
  
  // 删除所有数据
  if (existingInvoices.length > 0) {
    console.log('🗑️  [Invoices] 开始删除所有数据...');
    await sql`DELETE FROM invoices`;
    console.log('✅ [Invoices] 删除完成');
  } else {
    console.log('ℹ️  [Invoices] 表中无数据，跳过删除');
  }

  // 一次性插入所有发票数据
  console.log(`📝 [Invoices] 开始批量插入 ${invoices.length} 条数据...`);
  const insertedInvoices = await sql`
    INSERT INTO invoices ${sql(invoices, 'customer_id', 'amount', 'status', 'date')}
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('✅ [Invoices] 批量插入执行完成');

  return insertedInvoices;
}

async function seedCustomers() {
  // await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  // 先创建表（如果不存在）
  console.log('🏗️  [Customers] 开始执行 CREATE TABLE...');
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;
  console.log('✅ [Customers] CREATE TABLE 执行完成');
  
  // 查询现有数据
  console.log('🔍 [Customers] 开始查询现有数据...');
  const existingCustomers = await sql`SELECT * FROM customers`;
  console.log(`✅ [Customers] 查询完成，找到 ${existingCustomers.length} 条数据`);
  
  // 删除所有数据
  if (existingCustomers.length > 0) {
    console.log('🗑️  [Customers] 开始删除所有数据...');
    await sql`DELETE FROM customers`;
    console.log('✅ [Customers] 删除完成');
  } else {
    console.log('ℹ️  [Customers] 表中无数据，跳过删除');
  }

  // 一次性插入所有客户数据
  console.log(`📝 [Customers] 开始批量插入 ${customers.length} 条数据...`);
  const insertedCustomers = await sql`
    INSERT INTO customers ${sql(customers, 'id', 'name', 'email', 'image_url')}
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('✅ [Customers] 批量插入执行完成');

  return insertedCustomers;
}

async function seedRevenue() {
  // 先创建表（如果不存在）
  console.log('🏗️  [Revenue] 开始执行 CREATE TABLE...');
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;
  console.log('✅ [Revenue] CREATE TABLE 执行完成');
  
  // 查询现有数据
  console.log('🔍 [Revenue] 开始查询现有数据...');
  const existingRevenue = await sql`SELECT * FROM revenue`;
  console.log(`✅ [Revenue] 查询完成，找到 ${existingRevenue.length} 条数据`);
  
  // 删除所有数据
  if (existingRevenue.length > 0) {
    console.log('🗑️  [Revenue] 开始删除所有数据...');
    await sql`DELETE FROM revenue`;
    console.log('✅ [Revenue] 删除完成');
  } else {
    console.log('ℹ️  [Revenue] 表中无数据，跳过删除');
  }

  // 一次性插入所有收入数据
  console.log(`📝 [Revenue] 开始批量插入 ${revenue.length} 条数据...`);
  const insertedRevenue = await sql`
    INSERT INTO revenue ${sql(revenue, 'month', 'revenue')}
    ON CONFLICT (month) DO NOTHING;
  `;
  console.log('✅ [Revenue] 批量插入执行完成');

  return insertedRevenue;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    let result;
    let message = 'Database seeded successfully';

    if (table) {
      // 根据table参数初始化指定的表
      console.log(`\n🚀 开始初始化表: ${table}`);
      console.log('========================================');
      switch (table.toLowerCase()) {
        case 'users':
          result = await seedUsers();
          message = 'Users table seeded successfully';
          break;
        case 'customers':
          result = await seedCustomers();
          message = 'Customers table seeded successfully';
          break;
        case 'invoices':
          result = await seedInvoices();
          message = 'Invoices table seeded successfully';
          break;
        case 'revenue':
          result = await seedRevenue();
          message = 'Revenue table seeded successfully';
          break;
        default:
          return Response.json(
            { error: `Invalid table name: ${table}. Valid options are: users, customers, invoices, revenue` },
            { status: 400 }
          );
      }
      console.log('========================================');
      console.log(`🎉 表 ${table} 初始化完成!\n`);
    } else {
      // 没有table参数，初始化所有表
      console.log('\n🚀 开始初始化所有表...');
      console.log('========================================');
      result = await sql.begin((sql) => [
        seedUsers(),
        seedCustomers(),
        seedInvoices(),
        seedRevenue(),
      ]);
      console.log('========================================');
      console.log('🎉 所有表初始化完成!\n');
    }

    return Response.json({ message });
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    return Response.json({ error }, { status: 500 });
  }
}
