import { PrismaClient } from '@crawlforge/database';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const testEmail = 'test@crawlforge.local';
  const testPassword = 'testpassword123';
  
  // 1. Create Test User
  let testUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!testUser) {
    const passwordHash = await bcrypt.hash(testPassword, 10);
    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        name: 'Test User',
        role: 'admin'
      }
    });
    console.log('Test user created.');
  } else {
    console.log('Test user already exists.');
  }

  // 2. Create Test Project
  let testProject = await prisma.project.findFirst({ where: { name: 'Test Project', createdBy: testUser.id } });
  if (!testProject) {
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'Auto-generated project for E2E tests',
        status: 'active',
        createdBy: testUser.id
      }
    });
    console.log('Test project created.');
  } else {
    console.log('Test project already exists.');
  }

  // 3. Create Simple Bot
  let simpleBot = await prisma.bot.findFirst({ where: { name: 'Simple Test Bot', projectId: testProject.id } });
  if (!simpleBot) {
    const steps = [
      { id: 'step1', type: 'OPEN_URL', url: 'https://example.com' },
      { id: 'step2', type: 'EXTRACT_TEXT', selector: 'h1', field_name: 'title' },
      { id: 'step3', type: 'SAVE_RECORD' }
    ];
    await prisma.bot.create({
      data: {
        projectId: testProject.id,
        name: 'Simple Test Bot',
        startUrl: 'https://example.com',
        stepsJson: JSON.stringify(steps),
        createdBy: testUser.id,
        status: 'active'
      }
    });
    console.log('Simple Test Bot created.');
  } else {
    // Update steps to correct format if bot already exists
    const steps = [
      { id: 'step1', type: 'OPEN_URL', url: 'https://example.com' },
      { id: 'step2', type: 'EXTRACT_TEXT', selector: 'h1', field_name: 'title' },
      { id: 'step3', type: 'SAVE_RECORD' }
    ];
    await prisma.bot.update({
      where: { id: simpleBot.id },
      data: { stepsJson: JSON.stringify(steps) }
    });
    console.log('Simple Test Bot already exists (steps updated).');
  }

  // 4. Create Loop Bot
  let loopBot = await prisma.bot.findFirst({ where: { name: 'Loop Test Bot', projectId: testProject.id } });
  if (!loopBot) {
    const steps = [
      { id: 'l1', type: 'OPEN_URL', url: 'https://example.com' },
      { id: 'l2', type: 'EXTRACT_LINKS', selector: 'a', field_name: 'links' },
      { id: 'l3', type: 'LOOP_LINKS', source_field: 'links', max_items: 3, steps: [
        { id: 'sub1', type: 'EXTRACT_TEXT', selector: 'h1', field_name: 'title' },
        { id: 'sub2', type: 'SAVE_RECORD' }
      ]}
    ];
    await prisma.bot.create({
      data: {
        projectId: testProject.id,
        name: 'Loop Test Bot',
        startUrl: 'https://example.com',
        stepsJson: JSON.stringify(steps),
        createdBy: testUser.id,
        status: 'active'
      }
    });
    console.log('Loop Test Bot created.');
  } else {
    const steps = [
      { id: 'l1', type: 'OPEN_URL', url: 'https://example.com' },
      { id: 'l2', type: 'EXTRACT_LINKS', selector: 'a', field_name: 'links' },
      { id: 'l3', type: 'LOOP_LINKS', source_field: 'links', max_items: 3, steps: [
        { id: 'sub1', type: 'EXTRACT_TEXT', selector: 'h1', field_name: 'title' },
        { id: 'sub2', type: 'SAVE_RECORD' }
      ]}
    ];
    await prisma.bot.update({
      where: { id: loopBot.id },
      data: { stepsJson: JSON.stringify(steps) }
    });
    console.log('Loop Test Bot already exists (steps updated).');
  }

  // 5. Create Document Bot
  let docBot = await prisma.bot.findFirst({ where: { name: 'Document Test Bot', projectId: testProject.id } });
  if (!docBot) {
    const steps = [
      { id: 'd2', type: 'DOWNLOAD_FILE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', selector: '', field_name: 'pdf_doc', allowed_extensions: 'pdf' }
    ];
    await prisma.bot.create({
      data: {
        projectId: testProject.id,
        name: 'Document Test Bot',
        startUrl: 'https://www.w3.org',
        stepsJson: JSON.stringify(steps),
        createdBy: testUser.id,
        status: 'active'
      }
    });
    console.log('Document Test Bot created.');
  } else {
    const steps = [
      { id: 'd2', type: 'DOWNLOAD_FILE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', selector: '', field_name: 'pdf_doc', allowed_extensions: 'pdf' }
    ];
    await prisma.bot.update({
      where: { id: docBot.id },
      data: { stepsJson: JSON.stringify(steps) }
    });
    console.log('Document Test Bot already exists (steps updated).');
  }

  // 6. Create Test Schema
  let schema = await prisma.extractionSchema.findFirst({ where: { name: 'Test Schema' } });
  if (!schema) {
    await prisma.extractionSchema.create({
      data: {
        name: 'Test Schema',
        description: 'For testing AI extraction',
        schemaJson: JSON.stringify({ type: 'object', properties: { testField: { type: 'string' } } })
      }
    });
    console.log('Test Schema created.');
  }

  // 7. Create Prompt Template
  let prompt = await prisma.promptTemplate.findFirst({ where: { name: 'Test Template' } });
  if (!prompt) {
    await prisma.promptTemplate.create({
      data: {
        name: 'Test Template',
        systemPrompt: 'You are a test assistant.',
        userPromptTemplate: 'Extract test info from {{text}}'
      }
    });
    console.log('Test Template created.');
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
